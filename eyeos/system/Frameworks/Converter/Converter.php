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

include_once 'MediaConverter.php';

class Converter {
	public static function Convert($from, $format = '') {

		//first, get the original file
		$myFile = FSI::getFile($from);
		$myFile->checkReadPermission();
		if($myFile instanceof EyeLocalFile) {
			$fileNameOriginal = $from;
		} else {
			$myRealFile = $myFile->getRealFile();
			$fileNameOriginal = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		}

		$hash = md5(md5_file($fileNameOriginal).'/'.$format);

		$to = 'home:///';
		//then, check the destination file
		$myFileDest = FSI::getFile($to);
		$myFileDest->checkWritePermission();
		$myRealFile = $myFileDest->getRealFile();
		$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());

		$conversionCache = $fileNameDestination . '/.office/' . $hash . '/' . $hash;

		if(!file_exists($fileNameDestination . '/.office/')) {
		    mkdir($fileNameDestination . '/.office/');
		}
	 		
		if(file_exists($conversionCache)) {
			return $conversionCache;
		} else {
		 	if(!is_dir($fileNameDestination . '/.office/' . $hash)) {
			  	mkdir($fileNameDestination . '/.office/' . $hash);
		  	}
			$fileNameDestination = $conversionCache;
		}

		$fileNameReturn = $fileNameDestination;
		/*
		 * If isset format do conversion, otherwise just copy original file to 
		 */
		if ($format != '') {
			$fileNameOriginal = escapeshellarg($fileNameOriginal);
			$fileNameDestination = escapeshellarg($fileNameDestination);
			$format = escapeshellarg($format);

			//some legacy applications do not use the filter writer_pdf_Export, just pdf
			if ($format == 'pdf') {
				$format = 'writer_pdf_Export';
			}

			if (!@fsockopen('127.0.0.1', '2002', $errno, $errstr, 3)) {
				shell_exec('nohup soffice "-accept=socket,host=localhost,port=2002;urp;" >/dev/null 2>/dev/null &');
				//shell_exec with soffice forked to avoid soffice to be killed
				//at the end of the php execution, cannot be synchronous.
				sleep(4);
			}

			$cmd = 'python ' . EYE_ROOT . '/' . SYSTEM_DIR . '/' . FRAMEWORKS_DIR . '/Converter/ooo2any.py --extension eyeos --format ' . $format;
			$cmd .= ' --destination ' . $fileNameDestination . ' ' . $fileNameOriginal;

			shell_exec('LANG=en_US.utf-8;' . $cmd);
		} else {
			// Just copy file to new destination
			copy($fileNameOriginal, $fileNameDestination);
		}
		
		return $fileNameReturn;
	}
}

?>