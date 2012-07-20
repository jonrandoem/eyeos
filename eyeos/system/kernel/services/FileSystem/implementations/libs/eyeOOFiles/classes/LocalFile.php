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
 * This class ...
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class EyeLocalFile extends LocalFile implements ISecurableFile {	
	public function checkAdminPermission() {
		SecurityManager::getInstance()->checkAdmin($this);
	}
	
	public function checkDeletePermission() {
		SecurityManager::getInstance()->checkDelete($this);
	}
	
	public function checkReadPermission() {
		SecurityManager::getInstance()->checkRead($this);
	}
	
	public function checkWritePermission() {
		SecurityManager::getInstance()->checkWrite($this);
	}
	
	/**
	 * @param mixed $newGroup The group name or group number or an object representing the group. 
	 * @param bool $recursive
	 * @return bool TRUE if the group has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeSecurityException
	 */
	public function chgrp($newGroup, $recursive = false) {
		$this->checkAdminPermission();
		return parent::chgrp($newGroup, $recursive);
	}
	
	/**
	 * @param int $newMode The new mode (octal value).
	 * @param bool $recursive
	 * @return bool TRUE if the mode has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 * @throws EyeSecurityException
	 */
	public function chmod($newMode, $recursive = false) {
		$this->checkAdminPermission();
		return parent::chmod($newMode, $recursive);
	}
	
	/**
	 * @param mixed $newGroup The user name or user number or an object representing the user.
	 * @param bool $recursive
	 * @return bool TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeSecurityException
	 */
	public function chown($newOwner, $recursive = false) {
		$this->checkAdminPermission();
		return parent::chown($newOwner, $recursive);
	}
	
	/**
	 * @param IFile $file The source file to copy from
	 * @return bool TRUE if the file has been successfully copied from $file, FALSE otherwise
	 * @throws EyeSecurityException
	 */
	protected function copyFrom(IFile $file, $overwrite = true) {
		$this->checkWritePermission();
		if ($file instanceof ISecurableFile) {
			$file->checkReadPermission();
		}
		return parent::copyFrom($file, $overwrite);
	}
	
	/**
	 * @param bool $overwrite Set to TRUE to try overwriting the file if it already exists
	 * @return void
	 * @throws EyeIOException
	 */
	public function createNewFile($overwrite = false) {
		$this->getParentFile()->checkWritePermission();
		try {
			return parent::createNewFile($overwrite);
		} catch (EyeIOException $e) {
			throw new EyeIOException('Unable to create file at '.$this->getAbsolutePath());
		}
	}
	
	/**
	 * @param bool $recursive
	 * @param bool $onlyContents In the case of a directory, only delete the files it contains if TRUE
	 * or the entire directory otherwise
	 * @return bool TRUE if the file has been successfully deleted, FALSE otherwise
	 */
	public function delete($recursive = false, $onlyContents = false) {
		$this->checkDeletePermission();
		return parent::delete($recursive, $onlyContents);
	}
	
	/**
	 * Forces fetching stats from the current file now (if supported).
	 * @return bool
	 */
	public function fetchStats() {
		$this->checkReadPermission();
		return parent::fetchStats();
	}
	
	/**
	 * NOTE: in the case of a link, the data is read from its target.
	 * @return mixed The content of the file or FALSE if an error occured
	 */
	public function getContents() {
		$this->checkReadPermission();
		return parent::getContents();
	}
	
	/**
	 * @return int The size of the file (in KB)
	 */
	public function getSize($recursive = false) {
		$this->checkReadPermission();
		return parent::getSize($recursive);
	}
	
	/**
	 * @return bool TRUE if the file can be read by the current user, FALSE otherwise
	 */
	public function isExecutable() {
		return false;
	}
	
	/**
	 * @return bool TRUE if the file can be read by the current user, FALSE otherwise
	 */
	public function isReadable() {
		try {
			$this->checkReadPermission();
			return parent::isReadable();
		} catch (EyeSecurityException $e) {
			return false;
		}
	}
	
	/**
	 * @return bool TRUE if the file can be written by the current user, FALSE otherwise
	 */
	public function isWritable() {
		try {
			$this->checkWritePermission();
			return parent::isWritable();
		} catch (EyeSecurityException $e) {
			return false;
		}
	}
	
	/**
	 * @return array(IFile) The list of the files contained in the "file" itself if this
	 * one is a directory, or the files contained in the parent directory if this one is
	 * a normal file
	 */
	public function listFiles($pattern = '*', $flags = AdvancedPathLib::GLOB_NORMAL) {
		if ($this->isDirectory()) {
			$this->checkReadPermission();
		} elseif ($this->isFile()) {
			$this->getParentFile()->checkReadPermission();
		}
		return parent::listFiles($pattern, $flags);
	}
	
	/**
	 * @return bool TRUE if the directory has been successfully created, FALSE otherwise
	 */
	public function mkdir($mode = 0777) {
		$this->getParentFile()->checkWritePermission();
		return parent::mkdir($mode);
	}
	
	/**
	 * @return bool TRUE if the directory and all the needed parent ones have been
	 * successfully created, FALSE otherwise
	 */
	public function mkdirs($mode = 0777) {
		$this->getParentFile()->checkWritePermission();
		return parent::mkdirs($mode);
	}
	
	/**
	 * @return bool TRUE if the file has been successfully moved, FALSE otherwise
	 */
	public function moveTo(IFile $file) {
		$this->getParentFile()->checkWritePermission();
		$this->checkReadPermission();
		return parent::moveTo($file);
	}
	
	/**
	 * NOTE: in the case of a link, the data is written to its target.
	 * @param mixed $data THe data to be written to the file.
	 * @param int $flags FILE_APPEND | LOCK_EX (FILE_TEXT | FILE_BINARY only for PHP 6)
	 * @return int The number of bytes written to the file.
	 */
	public function putContents($data, $flags = 0) {
		$this->checkWritePermission();
		return parent::putContents($data, $flags);
	}
	
	/**
	 * @return bool TRUE if the file has been successfully renamed, FALSE otherwise
	 */
	public function renameTo($newName) {
		$this->getParentFile()->checkWritePermission();
		return parent::renameTo($newName);
	}
}
?>