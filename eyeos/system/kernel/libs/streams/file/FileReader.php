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

/**
 * TODO
 * 
 * @package kernel-libs
 * @subpackage streams
 */
class FileReader extends BasicInputStreamReader {	
	/**
	 * 
	 * @param mixed $file A path to a file, or a FileInputStream object
	 * @param array $params
	 */
	public function __construct($file, $params = null) {
		if (is_string($file)) {
			$file = new FileInputStream($file);
		}
		if (!$file instanceof FileInputStream) {
			throw new EyeInvalidArgumentException('$file must be a string or a FileInputStream object.');
		}
		parent::__construct($file, $params);
	}
	
	/**
	 * Reads the file and writes it to the output buffer.
	 * Note: At the end of the operation, the handler on the file will be closed.
	 * 
	 * @param int $chunkSize The length of the chunks (in bytes) that will be read in the
	 *            loop until the end of the file.
	 * @return int The number of bytes read from the file.
	 * @throws EyeIOException
	 * @throws EyeFileNotFoundException
	 * @deprecated ################################################
	 */
	public function echoFile($chunkSize = IInputStream::DEFAULT_READ_LENGTH) {
		return parent::doEcho(null, $chunkSize);
	}
	
	/**
	 * Reads the file and returns its content.
	 * Note: At the end of the operation, the handler on the file will be closed.
	 * 
	 * @param int $chunkSize The length of the chunks (in bytes) that will be read in the
	 *            loop until the end of the file.
	 * @return string The content of the file.
	 * @throws EyeIOException
	 * @throws EyeFileNotFoundException
	 */
	public function readFile($chunkSize = IInputStream::DEFAULT_READ_LENGTH) {
		return parent::readAll($chunkSize);
	}
}

?>
