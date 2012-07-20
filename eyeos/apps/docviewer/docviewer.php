<?php

/*
 *                 eyeos - The Open Source Cloud's Web Desktop
 *                               Version 2.0
 *                   Copyright (C) 2007 - 2010 eyeos Team
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License version 3 as published by the
 * Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * version 3 along with this program in the file "LICENSE".  If not, see
 * <http://www.gnu.org/licenses/agpl-3.0.txt>.
 *
 * See www.eyeos.org for more details. All requests should be sent to licensing@eyeos.org
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "Powered by
 * eyeos" logo and retain the original copyright notice. If the display of the
 * logo is not reasonably feasible for technical reasons, the Appropriate Legal Notices
 * must display the words "Powered by eyeos" and retain the original copyright notice.
 */

abstract class DocViewerApplication extends EyeosApplicationExecutable {
    public static function convertFile($params) {
        $filepath = $params[0];

		$pathinfo = pathinfo($filepath);
		$extension = strtoupper($pathinfo['extension']);

		if ($extension == 'EDOC') {
			$pdfFile = self::openEdocument($filepath);
		} else {
			$pdfFile = self::openOOdocument($filepath);
		}

		$file = FSI::getFile($pdfFile);

        if($file instanceof EyeLocalFile) {
                $fileNameOriginal = $pdfFile;
        } else {
                $myRealFile = $file->getRealFile();
                $fileNameOriginal = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
        }

        $hash = md5(md5_file($fileNameOriginal).'/pdf');

        $to = 'home:///';

        //then, check the destination file
        $myFileDest = FSI::getFile($to);

        $myFileDest->checkWritePermission();
        $myRealFile = $myFileDest->getRealFile();
        $fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());

        $conversionCache = $fileNameDestination . '/.office/' . $hash . '/';



        if(!file_exists($fileNameDestination . '/.office/')) {
            mkdir($fileNameDestination . '/.office/');
		}

        if(!file_exists($conversionCache)) {
			//close the session so we can make other sessions concurrently
			session_write_close();
			set_time_limit(0);
            if(!is_dir($fileNameDestination . '/.office/' . $hash)) {
                    mkdir($fileNameDestination . '/.office/' . $hash);
            }
            $fileNameDestinationRealSize = escapeshellarg($conversionCache.$hash.'.jpg');
            $fileNameDestinationThubnail = escapeshellarg($conversionCache.$hash.'-thubnail.jpg');
            $fileNameOriginal = escapeshellarg($fileNameOriginal);

            $cmd = 'convert -interlace line -quality 75 -density 100 '.$fileNameOriginal.' '.$fileNameDestinationRealSize;
            shell_exec('LANG=en_US.utf-8;'.$cmd);

//            $cmd = 'convert -resize 130 -verbose -quality 30 -density 300 '.$fileNameOriginal.' '.$fileNameDestinationThubnail;
//            shell_exec('LANG=en_US.utf-8;'.$cmd);
        }

        $files = scandir($conversionCache);
		if(!file_exists($conversionCache.$hash.'-0.jpg')) {
			copy($conversionCache.$hash.'.jpg', $conversionCache.$hash.'-0.jpg');
		}
        $size = getimagesize($conversionCache.$hash.'-0.jpg');
        return array((count($files)-2), $hash, $size[0], $size[1]);
    }

	private function openEdocument($filepath) {
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

	private function openOOdocument($filepath) {
		$myConverter = new Converter();
		$pdfFilter = self::getPDFFilterString($filepath);
		if ($pdfFilter == 'PDF') {
			//None Convert anything
			$PDFPath = $myConverter->Convert($filepath);
		} else {
			//Convert to PDF
			$PDFPath = $myConverter->Convert($filepath, $pdfFilter);
		}

		if (!$PDFPath || !file_exists($PDFPath)) {
			throw new Exception('Cannot convert document');
		}

		return $PDFPath;
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

    public static function getFile($params) {
        $hash = utf8_basename($params[0]);
        $num = utf8_basename(intval($params[1]));
        $thubnail = $params[2];

        $to = 'home:///';
        //then, check the destination file
        $myFileDest = FSI::getFile($to);
        $myFileDest->checkWritePermission();
        $myRealFile = $myFileDest->getRealFile();
        $fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());

        header('Content-Type: image/jpeg');
        if(!$thubnail) {
            readfile($fileNameDestination.'/.office/'.$hash.'/'.$hash.'-'.$num.'.jpg');
        } else {
			session_write_close();
			require_once('system/Frameworks/Applications/Executables/EyeosModules/FileSystemExecModule.php');
            FileSystemExecModule::getScaledImage(array('maxWidth'=>'150', 'path'=>$fileNameDestination.'/.office/'.$hash.'/'.$hash.'-'.$num.'.jpg'));
        }
        exit;
    }
}

?>