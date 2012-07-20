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

abstract class ImageViewerApplication extends EyeosApplicationExecutable {
    public static function getFile($params) {
        $file = $params;

        //then, check the destination file
        $myFileDest = FSI::getFile($file);
        $myFileDest->checkReadPermission();
        $myRealFile = $myFileDest->getRealFile();
        $fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());

        header('Content-Type: ' . mime_content_type($fileNameDestination));
        readfile($fileNameDestination);
        exit;
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
		
		$myFile = FSI::getFile($params['path']);
		if (method_exists ( $myFile , 'getRealFile' )) {
			$fileName = AdvancedPathLib::getPhpLocalHackPath($myFile->getRealFile()->getAbsolutePath());
		} else {
			$fileName = $params['path'];
		}
			
		$info = GetImageSize($fileName);
		$width = $info[0];
		$height = $info[1];
		$mime = $info['mime'];

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

		$imagevariable = ob_get_contents();
		ob_end_clean(); 
		header('Content-Type:' . $mime);
		header('Content-Length: ' . strlen($imagevariable));
		header('Accept-Ranges: bytes');
		header('X-Pad: avoid browser bug');
		

		echo $imagevariable;
		exit;
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
	 * return Array (
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

}

?>