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
 * This class is an abstraction of a file. Any extending file class must implement
 * all those methods.
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
abstract class AbstractFile implements IFile {
	
	/**
	 * @return string A string representation of the object.
	 */
	public function __toString() {
		return get_class($this) . ': ' . $this->getAbsolutePath();
	}
	
	/**
	 * @param IFile $file
	 * @param bool $foldersFirst
	 * @return int A negative value if the current file should be placed before $file,
	 * zero (0) if they are equals, a positive value otherwise.
	 */
	public function compareTo(IFile $file, $foldersFirst = false) {
		if ($foldersFirst) {
			$isDirThis = $this->isDirectory();
			$isDirFile = $file->isDirectory();
			if ($isDirThis && !$isDirFile) {
				return -1;
			} else if($isDirFile && !$isDirThis) {
				return 1;
			}
		}
		$urlParts = $file->getURLComponents();
		$urlParts['path'] = $file->getPathFromRoot();				//needed to resolve the path (if relative)
		$absolutePathFile = AdvancedPathLib::buildURL($urlParts);
		$urlParts = $this->getURLComponents();
		$urlParts['path'] = $this->getPathFromRoot();				//needed to resolve the path (if relative)
		$absolutePathThis = AdvancedPathLib::buildURL($urlParts);
		return utf8_strcasecmp($absolutePathThis, $absolutePathFile);
	}
	
	/**
	 * @param IFile $file The source file to copy from.
	 * @return bool TRUE if the file has been successfully copied from $file, FALSE otherwise.
	 * @throws EyeIOException
	 */
	protected abstract function copyFrom(IFile $file, $overwrite = true);
	
	/**
	 * @param IFile $file The target file to copy to.
	 * @return bool TRUE if the file has been successfully copied to $file, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public final function copyTo(IFile $file, $overwrite = true) {
		$Logger = Logger::getLogger('fileSystem.AbstractFile');
		$Logger->debug("copyTo: " . get_class($this) . " => " . get_class($file));
		return $file->copyFrom($this, $overwrite);
	}
	
	/**
	 * Important: By default, the comparison method is based on PATHS, which means that 2 objects
	 * of different classes representing the exact same file (= same paths) are considered equal.
	 * 
	 * @return bool TRUE if the current file designate the same file as $file, FALSE otherwise.
	 */
	public function equals(IFile $file) {
		return $this->compareTo($file) === 0;
	}
	
	/**
	 * The object returned will either represent a file located in the directory if the current
	 * file exists and is a directory, or a file located in the same directory as the current
	 * file otherwise.
	 * @param string $fileName The name of the file.
	 * @return IFile
	 */
	public function getChildFile($fileName, $params = null) {
		if ($this->isDirectory()) {
			$filePath = $this->getAbsolutePath() . '/' . $fileName;
		} else {
			$filePath = $this->getParentPath() . '/' . $fileName;
		}
		$className = get_class($this);
		return new $className($filePath, $params);
	}
	
	/**
	 * @param array Special parameters for FileInputStream::__construct() (see FileInputStream constants)
	 * @return FileInputStream
	 */
	public function getInputStream($params = null) {
		return new FileInputStream($this->getPath(), $params);
	}
	
	/**
	 * @return string The MIME type of the file.
	 */
	public function getMimeType() {
		return MimeContentType::getMimeTypeFromFile($this->getPath());
	}
	
	/**
	 * @param array Special parameters for FileOutputStream::__construct() (see FileOutputStream constants)
	 * @return FileOutputStream
	 */
	public function getOutputStream($params = null) {
		return new FileOutputStream($this->getPath(), $params);
	}
	
	/**
	 * @return boolean TRUE if the file represents a root of the filesystem, FALSE otherwise.
	 */
	public function isRoot() {
		$urlParts = $this->getUrlComponents();
		return $urlParts['path'] == '/';
	}
}
?>