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
class FileInputStream extends FileStream implements IInputStream {	
	/**
	 * 
	 * @param string $path
	 * @param array $params
	 */
	public function __construct($path, $params = null) {
		parent::__construct($path, $params);
	}
	
	/**
	 * @param mixed &$data
	 * @return int
	 * @throws EyeIOException
	 * @throws EyeFileNotFoundException
	 */
	public function read(&$data, $length = IInputStream::DEFAULT_READ_LENGTH) {
		$return = null;
		if (!is_file($this->path)) {
			throw new EyeFileNotFoundException('"' . $this->path . '" does not exist or is a directory.');
		}
		try {
			if ($this->isClosed()) {
				$this->open('r');
			}
			$data = fread($this->fd, $length);
			if ($data === false) {
				throw new EyeIOException('fread() returned FALSE.');
			}
			return strlen($data);
		} catch (IChainableException $e) {
			throw new EyeIOException('Unable to read file data at "' . $this->path . '".', 0, $e);
		}
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function reset() {
		try {
			if ($this->isClosed()) {
				throw new EyeIOException('Stream is not open or has been closed.');
			}
			if (!rewind($this->fd)) {
				throw new EyeIOException('rewind() returned FALSE.');
			}
		} catch(IChainableException $e) {
			throw new EyeIOException('Unable to reset file pointer at "' . $this->path . '".', 0, $e);
		}
	}
	
	/**
	 * 
	 * @param int $offset
	 * @param int $whence
	 * @throws EyeIOException
	 */
	public function seek($offset, $whence = SEEK_SET) {
		try {
			if ($this->isClosed()) {
				throw new EyeIOException('Stream is not open or has been closed.');
			}
			if (fseek($this->fd, $offset, $whence) === -1) {
				throw new EyeIOException('fseek() returned -1.');
			}
		} catch(IChainableException $e) {
			throw new EyeIOException('Unable to seek file pointer at "' . $this->path . '".', 0, $e);
		}
	}
	
	/**
	 * 
	 * @param int $n
	 * @throws EyeIOException
	 */
	public function skip($n) {
		try {
			$this->seek($n, SEEK_CUR);
		} catch(IChainableException $e) {
			throw new EyeIOException('Unable to skip file pointer at "' . $this->path . '".', 0, $e);
		}
	}
}

?>
