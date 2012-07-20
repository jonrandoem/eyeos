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

abstract class PdfViewerApplication extends EyeosApplicationExecutable {
    public static function convertFile($params) {
        $path = $params[0];

        $file = FSI::getFile($path);
        $file->checkReadPermission();

        if($file instanceof EyeLocalFile) {
            $fileNameOriginal = $path;
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

//            $cmd = 'convert -resize 130 -verbose -quality 30 -density 70 '.$fileNameOriginal.' '.$fileNameDestinationThubnail;
//            shell_exec('LANG=en_US.utf-8;'.$cmd);
        }

        $files = scandir($conversionCache);
		if(!file_exists($conversionCache.$hash.'-0.jpg')) {
			copy($conversionCache.$hash.'.jpg', $conversionCache.$hash.'-0.jpg');
		}
        $size = getimagesize($conversionCache.$hash.'-0.jpg');
        return array((count($files)-2), $hash, $size[0], $size[1]);
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