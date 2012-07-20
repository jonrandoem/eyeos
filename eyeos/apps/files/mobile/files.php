<?php

abstract class FilesMobileApplication extends EyeosApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {

		$buffer = '';
		$itemsPath = EYE_ROOT . '/' . APPS_DIR . '/files/mobile/';
		$buffer .= file_get_contents($itemsPath . '/model/eyeosmobileFile.js');
		$buffer .= file_get_contents($itemsPath . '/viewerManager/fileViewerManager.js');

		// Load ViewManager Handlers
		$viewerHandlerPath = $itemsPath . 'viewerManager/handlers/';
		$viewerHandlers = Array();
		$iterator = new DirectoryIterator($viewerHandlerPath);
		foreach ($iterator as $fileInfo) {
			if ($fileInfo->getFilename() == '.' || $fileInfo->getFilename() == '..' || $fileInfo->getFilename() == '.svn') {
				continue;
			}

			if ($fileInfo->isDir()) {
				continue;
			}

			// If is a file and is a js 
			if ($fileInfo->isFile() && substr(strrchr($fileInfo->getFilename(), '.'), 1) == 'js') {
				$buffer .= file_get_contents($viewerHandlerPath . $fileInfo->getFilename());
				$pathInfo = pathinfo($fileInfo->getFilename());
				$handlerName = $pathInfo['filename'];
				$viewerHandlers[] = $handlerName;
			}
		}

		// Initialize fileViewManager and send handlers to it
		$buffer .= 'var fvm = fileViewerManager.getInstance();';
		$buffer .= 'fvm.loadHandlers(' . json_encode($viewerHandlers) . ');';

		$response->appendToBody($buffer);
	}

	/**
	 * Giving a path relative to a document, we convert it to pdf, than to single
	 * images and then we return a hash that is and the filename of the image
	 * Real path of the image ishome://~{username}/.office/{hash}/{fileName}
	 * 
	 * @param
	 *  Array (
	 *		path => string				Absolute path of input image
	 *  )
	 * 
	 * @return
	 *	Array (
	 *		images => Array ()			paths of the images
	 *		previews => Array()			paths with the preview of the images
	 *		hash => string				See schema above
	 *	)
	 */
	public static function convertDocumentToImagesHash ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}

		$filepath = $params['path'];
		$maxWidth = isset($params['maxWidth']) ? $params['maxWidth'] : null;

		$pathinfo = pathinfo($filepath);
		$extension = strtoupper($pathinfo['extension']);
		
		if($extension == 'EDOC') {
			return self::openEdocument($filepath);
		} else {
			return self::openOOdocument($filepath);
		}

	}

	/**
	 * Open eyeOS document (.edoc)
	 * @return
	 *	Array (
	 *		images => Array ()			paths of the images
	 *		previews => Array()			paths with the preview of the images
	 *		hash => string				See schema above
	 *	)
	 */
	public static function openEdocument($filepath) {
		//get information about path
		$pathinfo = pathinfo($filepath);
		//get the extension
		$extension = strtoupper($pathinfo['extension']);
		//if the extension is not edoc, it won't work
		if ($filepath === null || $extension != 'EDOC') {
			throw new EyeInvalidArgumentException('Missing or invalid $filepath');
		}
		$file = FSI::getFile($filepath);
		$file->checkReadPermission();
		
		$filepath = 'home:///';
		$myFile = FSI::getFile($filepath);
		$myRealFile = $myFile->getRealFile();
		$home = $myRealFile;
		$home = AdvancedPathLib::getPhpLocalHackPath($home->getPath());
		$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		$fileNameDestination .= '/.office/documents/' . ProcManager::getInstance()->getCurrentProcess()->getPid();

		if(!file_exists(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/')) {
			mkdir(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/');
		} else {
			$cmd = 'rm -fr ' . escapeshellarg(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/documents/');
			shell_exec($cmd);
		}

		mkdir(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/documents/');

		if(file_exists($fileNameDestination)) {
			AdvancedPathLib::rmdirs($fileNameDestination);
		}

		mkdir($fileNameDestination);
		$myRealFile = $file->getRealFile();
		$originalFile = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		$cmd = 'unzip  -d ' . escapeshellarg($fileNameDestination) . ' ' . escapeshellarg($originalFile);
		shell_exec($cmd);
		
		$pathToFile = $fileNameDestination . '/document.html';
		//this path should be eyeos, not real
		$pathToFile = str_replace($home, 'home:///', $pathToFile);
		//now we need to convert this file to pdf
		return self::openOOdocument($pathToFile);
	}

	public static function openOOdocument($filepath) {
		$myConverter = new Converter();
		$pdfFilter = self::getPDFFilterString($filepath);
		if ($pdfFilter == 'PDF') {
			//None Convert anything
			$PDFPath = $myConverter->Convert($filepath);
		} else {
			//Convert to PDF
			$PDFPath = $myConverter->Convert($filepath, $pdfFilter);
		}

		$PDFDir = dirname($PDFPath);
		if (!$PDFPath || !file_exists($PDFPath)) {
			throw new Exception('Cannot convert document');
		}

		//Generate Images from PDF
		$imageRadixName = 'results';
		$smallImageRadixName = 'preview';
		$cmd = 'convert -interlace line -quality 75 -density 100 ' . escapeshellarg($PDFPath) . ' ' . escapeshellarg($PDFDir . '/' . $imageRadixName . '.jpg');
		shell_exec('LANG=en_US.utf-8;' . $cmd);

		$cmd = 'convert  -interlace line -quality 30 -density 70 '. escapeshellarg($PDFPath) . ' ' . escapeshellarg($PDFDir . '/' . $smallImageRadixName . '.jpg');
		shell_exec('LANG=en_US.utf-8;'.$cmd);

		$iterator = new DirectoryIterator($PDFDir);
		$imagesList = Array();
		$smallImageList = Array();
		foreach ($iterator as $fileInfo) {
			if (strpos($fileInfo->getFilename(), $smallImageRadixName) !== false) {
				$smallImageList[] = $fileInfo->getFileName();
			}
			if (strpos($fileInfo->getFilename(), $imageRadixName) !== false) {
				$imageList[] = $fileInfo->getFileName();
			}
		}
		natsort($imageList);
		natsort($smallImageList);
		return Array(
			'hash' => basename($PDFDir),
			'images' => array_values($imageList),
			'previews' => array_values($smallImageList),
		);
	}

	
	/**
	 * Return the correct openoffice filter string depending of file
	 *
	 * @param <String> $filePath
	 * @return String
	 */
	private static function getPDFFilterString ($filePath) {
		$pathinfo = pathinfo($filePath);
		$extension = strtoupper($pathinfo['extension']);

		switch ($extension) {
			case 'DOC':
			case 'DOCX':
			case 'TXT':
			case 'ODT':
				return 'writer_pdf_Export';
				break;
			case 'ODS':
			case 'OTS':
			case 'SXC':
			case 'STC':
			case 'XLS':
			case 'XLT':
			case 'XLSX':
			case 'FODS':
			case 'UOS':
				return 'calc_pdf_Export';
				break;
			case 'ODP':
			case 'OTP':
			case 'SXI':
			case 'STI':
			case 'PPT':
			case 'POT':
			case 'SXD':
			case 'PPTX':
			case 'PPSX':
			case 'POTM':
			case 'PPS':
			case 'FODP':
			case 'UOP':
				return 'impress_pdf_Export';
				break;
			case 'PDF':
				return 'PDF';
				break;
			default:
				return 'writer_pdf_Export';
				break;
		}
	}


	/**
	 * Return the scaled version of image giving the hash and the filename
	 *
	 * @param Array $params = (
	 *		maxHeight => integer,		Max Height of output image
	 *		maxWidth => integer,		Max Width of output image
	 *		hash => string				Hash of the office directory
	 *		filename => string			filename
	 * )
	 */
	public static function getScaledImageByHash ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['hash']) || !is_string($params['hash'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'hash\']');
		}

		if (!isset($params['filename']) || !is_string($params['filename'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'filename\']');
		}

		$hash = basename($params['hash']);
		$filename = basename($params['filename']);

		$params['path'] = self::getPathByHash(Array(
			'hash' => $hash,
			'filename' => $filename
		));
		
		self::getScaledImage($params);
	}

	/**
	 * Evalueate LocalHackPat of a dir/file providing hash directory, and
	 * a facultative filename see @convertDocumentToImagesHash
	 *
	 * @param Array (
	 *		hash => string				Hash of the office directory
	 *		filename => string			filename
	 * )
	 * @return String
	 */
	private static function getPathByHash ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['hash']) || !is_string($params['hash'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'hash\']');
		}

		$filename = isset($params['filename']) ? basename($params['filename']) : '';
		$hash = basename($params['hash']);
		
		$userName = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getName();

		$path = 'home://~' . $userName . '/.office/' . $hash . '/' . $filename;
		return $path;
	}


	/**
	 * Return the scaled version of image.
	 * 
	 * @param Array $params = (
	 *		maxHeight => integer,		Max Height of output image
	 *		maxWidth => integer,		Max Width of output image
	 *		path => string				Path of input image
	 * )
	 */
	public static function getScaledImage($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}

		$path = $params['path'];
		$maxHeight = isset($params['maxHeight']) ? intval($params['maxHeight']) : null;
		$maxWidth = isset($params['maxWidth']) ? intval($params['maxWidth']) : null;
		$response = MMapManager::getCurrentResponse();
		
		$myFile = FSI::getFile($path);
		$myFile->checkReadPermission();
		if (method_exists ( $myFile , 'getRealFile' )) {
			$fileName = AdvancedPathLib::getPhpLocalHackPath($myFile->getRealFile()->getAbsolutePath());
		} else {
			$fileName = $path;
		}
			
		$info = GetImageSize($fileName);
		$width = $info[0];
		$height = $info[1];
		$mime = $info['mime'];
		$size = filesize($fileName);

		//Calculate new dimensions
		$newDimensions = self::calculateDimensions(Array(
					'height' => $height,
					'width' => $width,
					'maxHeight' => $maxHeight,
					'maxWidth' => $maxWidth
		));

		$newHeight = $newDimensions['height'];
		$newWidth = $newDimensions['width'];



		if (($newHeight == $height) && ($newWidth == $width)) {
			//No resize is necessary
			$imageData = $myFile->getContents();
		} else {
			// What sort of image?
			$type = substr(strrchr($mime, '/'), 1);
			switch ($type) {
				case 'jpeg':
					$image_create_func = 'ImageCreateFromJPEG';
					$image_save_func = 'ImageJPEG';
					$new_image_ext = 'jpg';
					break;
				case 'png':
					$image_create_func = 'ImageCreateFromPNG';
					$image_save_func = 'ImagePNG';
					$new_image_ext = 'png';
					break;
				case 'bmp':
					$image_create_func = 'ImageCreateFromBMP';
					$image_save_func = 'ImageBMP';
					$new_image_ext = 'bmp';
					break;
				case 'gif':
					$image_create_func = 'ImageCreateFromGIF';
					$image_save_func = 'ImageGIF';
					$new_image_ext = 'gif';
					break;
				case 'vnd.wap.wbmp':
					$image_create_func = 'ImageCreateFromWBMP';
					$image_save_func = 'ImageWBMP';
					$new_image_ext = 'bmp';
					break;
				case 'xbm':
					$image_create_func = 'ImageCreateFromXBM';
					$image_save_func = 'ImageXBM';
					$new_image_ext = 'xbm';
					break;
				default:
					$image_create_func = 'ImageCreateFromJPEG';
					$image_save_func = 'ImageJPEG';
					$new_image_ext = 'jpg';
			}

			// Create blank image with new dimensions
			$imageData = ImageCreateTrueColor($newWidth, $newHeight);

			$originalImage = $image_create_func($fileName);
			ImageCopyResampled($imageData, $originalImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
			$image_save_func($imageData);
		}
		
		$response->getHeaders()->append('Content-Type:' . $mime);
		$response->getHeaders()->append('Content-Length: ' . $size);
		$response->getHeaders()->append('Accept-Ranges: bytes');
//		$response->getHeaders()->append('X-Pad: avoid browser bug');
		

		$response->setBody($imageData);
	}

	/**
	 * Return the original file
	 *
	 * @param Array $params = (
	 *		path => string				Path of the file, realPath or eyeFile object
	 * )
	 */
	public static function getFile($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}
		$path = $params['path'];
		
		$myFile = FSI::getFile($path);
		$myFile->checkReadPermission();
		if (method_exists ( $myFile , 'getRealFile' )) {
			$fileName = AdvancedPathLib::getPhpLocalHackPath($myFile->getRealFile()->getAbsolutePath());
		} else {
			$fileName = $path;
		}	
		
		if(isset ($params['format']) && is_string($params['format'])) {
			try {
				Logger::getLogger('Mobile - files.php')->debug('Transcoding to: '.$params['format']);
				Logger::getLogger('Mobile - files.php')->debug('$fileName previous: '.$fileName);
				$MediaConverter = new MediaConverter();
				$fileName = $MediaConverter->Convert($fileName, $params['format']);
				Logger::getLogger('Mobile - files.php')->debug('$fileName next: '.$fileName);
			} catch (Exception $e) {
				Logger::getLogger('Mobile - files.php')->error('Transcode error: '.$e);
			}
		}

		$mime = mime_content_type($fileName);
		$size = filesize($fileName);
		header('Content-Type: ' . $mime);
		header('Accept-Ranges: bytes');

		if (isset($_SERVER['HTTP_RANGE'])) {
			$ranges = explode(',', substr($_SERVER['HTTP_RANGE'], 6));
			foreach ($ranges as $range) {
				$parts = explode('-', $range);
				$start = intval($parts[0]); // If this is empty, this should be 0.
				$end = intval($parts[1]); // If this is empty or greater than than filelength - 1, this should be filelength - 1.
				
				if(empty($end)) {	//For avoid problems with Range: bytes=0-
					$end = $size;
				}
				
				if ($start > $end) {
					header('HTTP/1.1 416 Requested Range Not Satisfiable');
					exit;
				}
				
//				Logger::getLogger('Mobile - files.php')->debug('$start: '.$start.' $end: '.$end);
				//If you do not specify the 'b' flag when working with binary files,
				//you may experience strange problems with your data, including broken image files and strange problems with \r\n characters.
				$fp = fopen($fileName, 'rb');
				fseek($fp, $start);
				
				header('Content-Length: ' . $end-$start+1);
				header('Content-Range: bytes '.$start.'-'.$end.'/'.$size);
				echo fread($fp, $end-$start+1);
				exit;
			}
		}
		header('Content-Range: bytes 0/'.$size);
		header('Content-Length: ' . $size);
		readfile($fileName);

		exit;
	}

	/**
	 * Get the first image of a video
	 * @param Array $params = (
	 *		path => string				Path of the file
	 * )
	 * @return fill the response with the image
	 */
	public static function getVideoPoster($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}

		$myFile = FSI::getFile($params['path']);
		if (method_exists ( $myFile , 'getRealFile' )) {
			$fileName = AdvancedPathLib::getPhpLocalHackPath($myFile->getRealFile()->getAbsolutePath());
		} else {
			$fileName = $params['path'];
		}

		Logger::getLogger('Mobile - files.php')->debug('$fileName: '.$fileName);
		try {
			$MediaConverter = new MediaConverter();
			$fileName = $MediaConverter->Convert($fileName, 'JPG');
		} catch (Exception $e) {
			Logger::getLogger('Mobile - files.php')->debug('$MediaConverter error: '.$e);
		}

		$size = filesize($fileName);
		$data = file_get_contents($fileName);

		$response = MMapManager::getCurrentResponse();
		$response->getHeaders()->append('Content-Type: image/jpeg');
		$response->getHeaders()->append('Content-Length: ' . $size);
		$response->getHeaders()->append('Accept-Ranges: bytes');
//		$response->getHeaders()->append('Expires: 0');
//		$response->getHeaders()->append('Pragma: public');
//		$response->getHeaders()->append('Content-Disposition: inline');
//		$response->getHeaders()->append('Content-Transfer-Encoding: binary');
//		$response->getHeaders()->append('Cache-Control: must-revalidate, post-check=0, pre-check=0');
//		$response->getHeaders()->append('X-Pad: avoid browser bug');

		$response->setBody($data);
	}

	/**
	 * Calculate new image dimension depending of maxHeight and maxWidth respecting proportions
	 * 
	 * @param Array $params = (
	 *		height => integer,			Height of input image
	 *		width => integer,			Width of input image
	 *		maxHeight => integer,		Max Height of output image (not mandatory)
	 *		maxWidth => integer,		Max Width of output image  (not mandatory)
	 * )
	 *
	 * @return Array (
	 *		height => integer,
	 *		width => integer
	 * )
	 */
	private static function calculateDimensions ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		if (!isset($params['height']) || !is_int($params['height'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'height\']');
		}
		if (!isset($params['width']) || !is_int($params['width'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'width\']');
		}
		if (isset($params['maxWidth'])) {
			$maxWidth = intval($params['maxWidth']);
		} else {
			$maxWidth = null;
		}
		if (isset($params['maxHeight'])) {
			$maxHeight = intval($params['maxHeight']);
		} else {
			$maxHeight = null;
		}

		$width = $params['width'];
		$height = $params['height'];
		
		// Only maxHeight is setted
		if ($maxHeight != null && $maxWidth == null) {
			if ($height > $maxHeight) {
				return Array(
					'height' => $maxHeight,
					'width' => round(($maxHeight / $height) * $width)
				);
			}
		}

		// Only maxWidth is setted
		if ($maxWidth != null && $maxHeight == null) {
			if ($width > $maxWidth) {
				return Array(
					'height' => round(($maxWidth / $width) * $height),
					'width' => $maxWidth
				);
			}
		}

		// Both are setted
		if ($maxWidth != null && $maxHeight != null) {
			if ($width > $maxWidth) {
				// We fix width
				$newHeight = round(($maxWidth / $width) * $height);
				$newWidth = $maxWidth;

				//Is Height ok?
				if ($newHeight > $maxHeight) {
					$newHeight = $maxHeight;
					$newWidth = round(($maxHeight / $newHeight) * $newWidth);
				}

				return Array (
					'height' => $newHeight,
					'width' => $newWidth
				);
			} else {
				// Width is ok, just control height
				if ($height > $maxHeight) {
					$newHeight = $maxHeight;
					$newWidth = round(($maxHeight / $newHeight) * $width);
					return Array(
						'height' => $newHeight,
						'width' => $newWidth
					);
				}
			}
		}

		// If none of previous conditions, we don't need to modify height nor width
		return Array(
			'height' => $height,
			'width' => $width
		);
		
	}
	
	/**
	 * Create a HTML page with the image full resolution
	 *
	 * @param Array $params = (
	 *		maxHeight => integer,		Max Height of output image
	 *		maxWidth => integer,		Max Width of output image
	 *		path => string				Path of input image
	 * )
	 *
	 */
	public static function createHtmlImagePreview ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}

		$src = 'index.php?message=getScaledImage&mobile=1&params[path]='. $params['path'];
		if (isset($params['checknum'])) {
			$src .= '&checknum='. $params['checknum'];
		}
		if (isset($params['maxWidth'])) {
			$src .= '&maxWidth='. $params['maxWidth'];
		}
		if (isset($params['maxHeight'])) {
			$src .= '&maxHeight='. $params['maxHeight'];
		}

		$navbarParams = array ();
		$navbarParams['pages'] = array( 0 => array('name' => basename($params['path']), 'url' => $src ));
		$navbarParams['actualPage'] = 0;
		$navbarParams['showBackButton'] = false;
		$navbarParams['showNextButton'] = false;
		$navbarParams['showSelectButton'] = false;
		
		$src = str_replace('"', '', $src);

		$html = '
			<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
			<html>
			  <head>
				<title>eyeOS mobile version</title>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				<!--<meta name="viewport" content="initial-scale=0.7"/>-->

				<link rel="stylesheet" href="eyeos/extern/js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.css" />
				<!-- <link rel="stylesheet" href="eyeos/extern/js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.min.css" />-->
				<link rel="icon" type="image/png" href="index.php?extern=images/favicon.png" />
				<style type="text/css">
					body {
						width:				100%;
						padding:			0;
						margin:				0;
						background-color:	#CCCCCC;
					}
					#page_Container {
						margin-bottom:		30px;
						padding-top:		60px;
					}
					#page {
						max-width:			98%;
						width:				98%;
					}
				</style>
			  </head>
			  <body>' .
				self::createHtmlNavigationHeader($navbarParams) .
				'<center id="page_Container">
					<img id="page" src="' . $src . '" />
				</center>
			  </body>
			</html>';
		$response = MMapManager::getCurrentResponse();
		$response->setBody($html);
	}

	/**
	 * Create a HTML page with a full preview of the document
	 * 
	 * @param Array (
	 *		hash => string,			directory inside .office home of the user
	 *		images => Array ()		filenames of full size images
	 *		actualPage => integer	index of actual page
	 * )
	 * 
	 */
	public static function createHtmlFullDocumentPreview ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		if (!isset($params['checknum'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'checknum\']');
		}
		if (!isset($params['hash'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'hash\']');
		}
		if (!isset($params['filename'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'filename\']');
		}
		if (!isset($params['index'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'index\']');
		}
		if (!isset($params['pagescount'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'index\']');
		}

		$checknum = $params['checknum'];
		$hash = $params['hash'];
		$filename = $params['filename'];
		$filenameBegin = substr($filename, 0, strpos($filename, '-') + 1);
        $filenameEnd = strchr($filename, '.');

		$index = $params['index'];
		$pagesCount = $params['pagescount'];

		$linkSkel = 'index.php?message=createHtmlFullDocumentPreview&mobile=1&checknum=' . $checknum . '&params[checknum]=' . $checknum . '&params[hash]=' . $hash . '&params[filename]=' . $filenameBegin . '%pagenumber%' . $filenameEnd. '&params[index]=%pagenumber%&params[pagescount]=' . $pagesCount;

		$headerParams = Array(
			'pages' => Array(),
			'actualPage' => $index
		);

		//Create pages links
		for ($i = 0; $i < $pagesCount; ++$i) {
			$newLink = str_replace('%pagenumber%', $i, $linkSkel);
			$headerParams['pages'][] = Array(
				'url' => $newLink,
				'name' => 'Page ' . (string) ($i + 1)
			);
		}

		// Disabled next / prev / Select if we are just showing one page
		if ($pagesCount == 1) {
			$headerParams['showBackButton'] = false;
			$headerParams['showNextButton'] = false;
			$headerParams['showSelectButton'] = false;
		}

		$imageUrl = 'index.php?message=getScaledImageByHash&mobile=1&checknum=' . $checknum . '&params[hash]='. $hash . '&params[filename]=' . $filename;
		
		$imageUrl = str_replace('"', '', $imageUrl);
		
		$html = '
			<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
			<html>
			  <head>
				<title>eyeOS mobile version</title>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				<!--<meta name="viewport" content="initial-scale=0.7"/>-->
				
				<link rel="stylesheet" href="eyeos/extern/js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.css" />
				<!-- <link rel="stylesheet" href="eyeos/extern/js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.min.css" /> -->
				<link rel="icon" type="image/png" href="index.php?extern=images/favicon.png" />
				<style type="text/css">
					body {
						width:				100%;
						padding:			0;
						margin:				0;
						background-color:	#CCCCCC;
					}
					#page_Container {
						margin-bottom:		30px;
						padding-top:		60px;
					}
					#page {
						max-width:			98%;
						width:				98%;
					}
				</style>
			  </head>
			  <body>' .
				self::createHtmlNavigationHeader($headerParams) .
			  '<center id="page_Container">
					<img id="page" src="' . $imageUrl . '" />
				</center>
			</body>
			</html>';
		$response = MMapManager::getCurrentResponse();
		$response->setBody($html);
	}

	/**
	 * Create a navbar for an independent document viewer
	 * @uses jquery.mobile.css
	 *
	 * @param Array (
	 *		pages => Array (
	 *			name =>	string			name of the page
	 *			url => string			absoulte url of the page
	 *		)
	 *		actualPage => integer	index of actual page (starting with 0, we are coders :)
	 *	Optional:
	 *		showBackButton => boolean	TRUE/false
	 *		showNextButton => boolean	TRUE/false
	 *		showSelectButton => boolean	TRUE/false
	 *		showCloseButton => boolean	TRUE/false
	 * )
	 *
	 */
	private static function createHtmlNavigationHeader ($params) {
		if (!isset($params['pages']) && !is_array($params['pages'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'checknum\']');
		} else {
			$pages = $params['pages'];
		}
		if (!isset($params['actualPage'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'hash\']');
		} else {
			$actualPage = $params['actualPage'];
		}

		if (isset($params['showBackButton']) && is_bool($params['showBackButton']) ) {
			$showBackButton = $params['showBackButton'];
		} else {
			$showBackButton = true;
		}

		if (isset($params['showNextButton']) && is_bool($params['showNextButton'])) {
			$showNextButton = $params['showNextButton'];
		} else {
			$showNextButton = true;
		}

		if (isset($params['showSelectButton']) && is_bool($params['showSelectButton'])) {
			$showSelectButton = $params['showSelectButton'];
		} else {
			$showSelectButton = true;
		}

		if (isset($params['showCloseButton']) && is_bool($params['showCloseButton'])) {
			$showCloseButton = $params['showCloseButton'];
		} else {
			$showCloseButton = true;
		}

		$pagesCount = count($pages);

		$buttonStyle='style="font-size:150%; margin-left:15px;"';
		$navStyle = 'style="width:100%; background: #5E87B0; padding:30px 0px;"';
		//Hardcored theme-b
		$navHeader = '<div class="ui-bar-b ui-header" style="left:0px;top:0px">';

		//Insert Close Button
		if($showCloseButton) {
			$navHeader .= '	<span class="ui-btn-left ui-btn ui-btn-inline ui-btn-up-b ui-btn-icon-left ui-btn-corner-all ui-shadow">
								<span onclick="window.close()" class="ui-btn-inner ui-btn-corner-all">
									<span class="ui-btn-text">Close</span><span class="ui-icon ui-icon-delete ui-icon-shadow"></span>
								</span>
							</span>';
		}

		//Insert Back Button
		if($showBackButton) {
			$spanProperty = 'style="display: none;';
			if( ($pagesCount > 1) && ($actualPage > 0) ) {
				$prevLink = $pages[$actualPage-1]['url'];
				$spanProperty = 'onclick="location.href=\'' . $prevLink . '\'"';
			}

			$navHeader .= '	<span class="ui-btn-left ui-btn ui-btn-inline ui-btn-up-b ui-btn-icon-left ui-btn-corner-all ui-shadow" style="left:100px">
								<span ' . $spanProperty . ' class="ui-btn-inner ui-btn-corner-all">
									<span class="ui-btn-text">Back</span><span class="ui-icon ui-icon-arrow-l ui-icon-shadow"></span>
								</span>
							</span>';
		}

		//Insert Next Button
		if($showNextButton) {
			$spanProperty = 'style="display: none;';
			if ( ($pagesCount > 1) && ($actualPage  + 1 < $pagesCount) ) {
				$nextLink = $pages[$actualPage+1]['url'];
				$spanProperty = 'onclick="location.href=\'' . $nextLink . '\'"';
			}
			$navHeader .= '	<span class="ui-btn-left ui-btn ui-btn-inline ui-btn-up-b ui-btn-icon-right ui-btn-corner-all ui-shadow" style="left:185px">
								<span ' . $spanProperty . ' class="ui-btn-inner ui-btn-corner-all">
									<span class="ui-btn-text">Next</span><span class="ui-icon ui-icon-arrow-r ui-icon-shadow"></span>
								</span>
							</span>';
		}

		//Insert Select
		if($showSelectButton) {
			$navHeader .= '<style type="text/css">
							#selectObj {
								color: 					#fff;
								cursor:					pointer;
								line-height:			small;
								border:					0px transparent;
								background-color:		transparent;
								font-family:			Helvetica, Arial, sans-serif;
								font-size:				13px;
								font-weight:			bold;
								text-decoration:		none;
								text-shadow:			0 -1px 1px #145072;
								text-align:				left;
								-moz-appearance:		none;
								-webkit-appearance:		none;
								-moz-box-sizing:		content-box;
								-webkit-box-sizing:		content-box;
								margin:					0;
								padding:				0;
								width:					155%;
							}
							</style>';

			if ($pagesCount > 1) {
				
				$selectable = '<select id="selectObj" onchange="location.href=this.options[this.selectedIndex].value;">';
				for ($i = 0; $i < $pagesCount; $i++) {
					//If its the actual Page its selected
					$selected = ($i == $actualPage) ? 'selected="selected"' : '';
					$name = (array_key_exists('name', $pages[$i])) ? $pages[$i]['name'] : 'Page '.(string)($i + 1);
					$selectable .= '<option ' . $selected. ' value="' . $pages[$i]['url'] . '">' . $name . '</option>';
				}
				$selectable .= '</select>';
			}
			$navHeader .= '<span class="ui-btn-left ui-btn ui-btn-inline ui-btn-up-b ui-btn-icon-right ui-btn-corner-all ui-shadow" style="left:270px">
								<span class="ui-btn-inner ui-btn-corner-all">
									<span class="ui-btn-text">' . $selectable . '</span><span class="ui-icon ui-icon-arrow-d ui-icon-shadow"></span>
								</span>
							</span>';
		}
			
		$navHeader .= '<h1 class="ui-title">' . $pages[$actualPage]['name'] . '</h1>
					</div>';
		return $navHeader;
	}
}
?>