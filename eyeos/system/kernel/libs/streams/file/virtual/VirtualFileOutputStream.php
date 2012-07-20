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
class VirtualFileOutputStream extends FileOutputStream {	
	protected $fileObject = null;
	protected $realFileOutputStream = null;
	
	/**
	 * @var boolean
	 */
	protected $dataWritten = false;
	
	/**
	 * 
	 * @param EyeosAbstractVirtualFile $file
	 * @param array $params
	 */
	public function __construct(EyeosAbstractVirtualFile $file, $params = null) {
		$this->fileObject = $file;
		$this->realFileOutputStream = $file->getRealFile()->getOutputStream($params);
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close() {
		$this->realFileOutputStream->close();
		if ($this->dataWritten) {
			$event = new FileEvent($this->fileObject);
			$this->fileObject->fireEvent('fileWritten', $event);
		}
	}
	
	protected function getFileDescriptor() {
		return $this->realFileOutputStream->getFileDescriptor();
	}
	
	public function getPath() {
		return $this->realFileOutputStream->getPath();
	}
	
	protected function isClosed() {
		return $this->realFileOutputStream->isClosed();
	}
	
	/**
	 * TODO
	 * 
	 * @param string $mode The mode specifying the type of access ('r', 'r+', 'w', 'w+', 'a', 'a+')
	 * 
	 * @see fopen()
	 */
	protected function open($mode) {
		$this->realFileOutputStream->open($mode);
	}
	
	/**
	 * 
	 * @param mixed &$data
	 * @param int $length
	 * @throws EyeIOException
	 */
	public function write(&$data, $length = null) {
		$this->realFileOutputStream->write($data, $length);
		$this->dataWritten = true;
	}
}
?>
