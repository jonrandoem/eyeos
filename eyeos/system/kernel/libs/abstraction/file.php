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
 * This interface is an abstraction of a file. Any extending file class must implement
 * all those methods.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IFile {
	/**
	 * @param mixed $newGroup The group name or group number or an object representing the group.
	 * @param bool $recursive
	 * @return bool TRUE if the group has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chgrp($newGroup, $recursive = false);
	
	/**
	 * @param int $newMode The new mode (octal value).
	 * @param bool $recursive
	 * @return bool TRUE if the mode has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 */
	public function chmod($newMode, $recursive = false);
	
	/**
	 * @param mixed $newGroup The user name or user number or an object representing the user.
	 * @param bool $recursive
	 * @return bool TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chown($newOwner, $recursive = false);
	
	/**
	 * @param IFile $file
	 * @param bool $foldersFirst
	 * @return int A negative value if the current file should be placed before $file,
	 * zero (0) if they are equals, a positive value otherwise.
	 */
	public function compareTo(IFile $file, $foldersFirst = false);
	
	/**
	 * @param IFile $file The target file to copy to.
	 * @return bool TRUE if the file has been successfully copied to $file, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function copyTo(IFile $file, $overwrite = true);
	
	/**
	 * @param bool $overwrite Set to TRUE to try overwriting the file if it already exists.
	 * @return bool TRUE if the file has been successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function createNewFile($overwrite = false);
	
	/**
	 * @param IFile $target The target file the link will point to.
	 * @param bool $overwrite
	 * @return bool TRUE if the link has been successfully created
	 * @throws EyeUnsupportedOperationException
	 * @throws EyeIOException
	 */
	public function createNewLink(IFile $target, $overwrite = false);
	
	/**
	 * @param bool $recursive
	 * @param bool $onlyContents In the case of a directory, only delete the files it contains if TRUE
	 * or the entire directory otherwise.
	 * @return bool TRUE if the file has been successfully deleted, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function delete($recursive = false, $onlyContents = false);
	
	/**
	 * @return bool TRUE if the current file designate the same file as $file, FALSE otherwise.
	 */
	public function equals(IFile $file);
	
	/**
	 * @param bool $forceCheck TRUE to force clearing the cache before checking the file's existence.
	 * @return bool TRUE if the file/folder/link exists, FALSE otherwise.
	 */
	public function exists($forceCheck = false);
	
	/**
	 * Forces fetching stats from the current file now (if supported).
	 * @return bool
	 */
	public function fetchStats();
	
	/**
	 * @return string
	 */
	public function getAbsolutePath();
	
	/**
	 * The object returned will either represent a file located in the directory if the current
	 * file exists and is a directory, or a file located in the same directory as the current
	 * file otherwise.
	 * @param string $fileName The name of the file.
	 * @return IFile
	 */
	public function getChildFile($fileName, $params = null);
	
	/**
	 * NOTE: in the case of a link, the data is read from its target.
	 * @return mixed The content of the file or FALSE if an error occured.
	 * @throws EyeIOException
	 */
	public function getContents();
	
	/**
	 * @return string The extension of the file.
	 */
	public function getExtension();
	
	/**
	 * @return mixed The group of the file as an integer if the ID is retrievable, as a string otherwise.
	 */
	public function getGroup();
	
	/**
	 * @param array Special parameters for FileInputStream::__construct() (see FileInputStream constants)
	 * @return FileInputStream
	 */
	public function getInputStream($params = null);
	
	/**
	 * @return IFile The target file pointed by the link
	 * @throws EyeUnsupportedOperationException
	 * @throws EyeIOException
	 */
	public function getLinkTarget();
	
	/**
	 * @return string The MIME type of the file.
	 */
	public function getMimeType();
	
	/**
	 * @return string The name of the file.
	 */
	public function getName();
	
	/**
	 * @param array Special parameters for FileOutputStream::__construct() (see FileOutputStream constants)
	 * @return FileOutputStream
	 */
	public function getOutputStream($params = null);
	
	/**
	 * @return mixed The owner of the file as an integer if the ID is retrievable, as a string otherwise.
	 */
	public function getOwner();
	
	/**
	 * @return string The path of the file's parent directory.
	 */
	public function getParentPath();
	
	/**
	 * @return LocalFile The file corresponding to the file's parent directory.
	 */
	public function getParentFile();
	
	/**
	 * @return string
	 */
	public function getPath();
	
	/**
	 * @return string
	 */
	public function getPathFromRoot();
	
	/**
	 * @return array('dirname' => ..., 'basename' => ..., 'extension' => ..., 'filename' => ...)
	 */
	public function getPathInfo();
	
	/**
	 * @return string The permissions of the file.
	 * @throws EyeIOException
	 */
	public function getPermissions($octal = true);
	
	/**
	 * @return int The size of the file (in KB).
	 * @throws EyeIOException
	 */
	public function getSize($recursive = false);
	
	/**
	 * @return int The umask to apply when creating new files/link/folders
	 */
	public function getUMask();
	
	/**
	 * @return array The result of the function AdvancedPathLib::parse_url() on the path.
	 */
	public function getURLComponents();
		
	/**
	 * @return bool TRUE if the file is a directory, FALSE otherwise.
	 */
	public function isDirectory();
	
	/**
	 * @return bool TRUE if the file can be executed, FALSE otherwise.
	 */
	public function isExecutable();
	
	/**
	 * @return bool TRUE if the file is a normal file, FALSE otherwise.
	 */
	public function isFile();
	
	/**
	 * @return bool TRUE if the file is a link, FALSE otherwise.
	 */
	public function isLink();
	
	/**
	 * @return bool TRUE if the file can be read, FALSE otherwise.
	 */
	public function isReadable();
	
	/**
	 * @return bool TRUE if the file represents a root of the filesystem, FALSE otherwise.
	 */
	public function isRoot();
	
	/**
	 * @return bool TRUE if the file can be written, FALSE otherwise.
	 */
	public function isWritable();
	
	/**
	 * @param mixed $pattern A filter pattern as a string (same as *NIX shell), or an
	 * array of possible patterns.
	 * @param int $flags GLOB_NORMAL | GLOB_ONLY_DIR | GLOB_DIR_IGNORE_PATTERN
	 *                       | GLOB_DIR_FIRST | GLOB_FORCE_SCANDIR | GLOB_CASEINSENSITIVE
	 * 					(@see class AdvancedPathLib)
	 * @return array(IFile) The list of the files contained in the "file" itself if this
	 * one is a directory, or the files contained in the parent directory if this one is
	 * a normal file.
	 * @throws EyeIOException
	 */
	public function listFiles($pattern = '*', $flags = AdvancedPathLib::GLOB_NORMAL);
	
	/**
	 * @param int $mode The mode. Default is 0777 - umask.
	 * @return bool TRUE if the directory has been successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function mkdir($mode = null);
	
	/**
	 * @param int $mode The mode. Default is 0777 - umask.
	 * @return bool TRUE if the directory and all the needed parent ones have been.
	 * successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function mkdirs($mode = null);
	
	/**
	 * @return bool TRUE if the file has been successfully moved, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function moveTo(IFile $file);
	
	/**
	 * NOTE: in the case of a link, the data is written to its target.
	 * @param mixed $data THe data to be written to the file.
	 * @param int $flags FILE_APPEND | LOCK_EX (FILE_TEXT | FILE_BINARY only for PHP 6)
	 * @return int The number of bytes written to the file.
	 * @throws EyeIOException
	 */
	public function putContents($data, $flags = 0);
	
	/**
	 * @param string $newName The new name of the file.
	 * @return bool TRUE if the file has been successfully renamed, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function renameTo($newName);
}
?>