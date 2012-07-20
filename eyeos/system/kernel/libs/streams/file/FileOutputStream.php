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
class FileOutputStream extends FileStream implements IOutputStream {	
	const PARAM_APPEND = 'append';
	
	private $append = false;
	
	/**
	 * 
	 * @param string $path
	 * @param array $params
	 */
	public function __construct($path, $params = null) {
		parent::__construct($path, $params);
		$this->append = isset($params[self::PARAM_APPEND]) ? $params[self::PARAM_APPEND] : false;
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function flush() {
		try {
			if ($this->isClosed()) {
				throw new EyeIOException('Stream is not open or has been closed.');
			}
			if (!fflush($this->fd)) {
				throw new EyeIOException('fflush() returned FALSE.');
			}
		} catch(IChainableException $e) {
			throw new EyeIOException('Unable to flush file data at "' . $this->path . '".', 0, $e);
		}
	}
	
	
	
	/**
	 * 
	 * @param mixed &$data
	 * @param int $length
	 * @throws EyeIOException
	 */
	public function write(&$data, $length = null) {
		try {
			$return = null;
			if ($this->isClosed()) {
				if ($this->append) {
					$this->open('a');
				} else {
					$this->open('w');
				}
			}
			if ($length === null) {
				$return = fwrite($this->fd, $data);
			} else {
				$return = fwrite($this->fd, $data, $length);
			}
			if ($return === false) {
				throw new EyeIOException('fwrite() returned FALSE.');
			}
			return $return;
		} catch (IChainableException $e) {
			throw new EyeIOException('Unable to write file data at "' . $this->path . '".', 0, $e);
		}
	}
}
?>
