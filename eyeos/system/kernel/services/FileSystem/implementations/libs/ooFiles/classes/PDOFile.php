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
 * Example of URL: dbfile://user:pass@localhost:3306/myBase|myTable/my/path/to/a/file.ext	 (WRONG)
 * 
 * 		MAYBE THIS INSTEAD: dbfile:///my/path/to/a/file.ext
 * 		WITH PARAMS       : array(
 * 								'dsn' => 'mysql:host=localhost;port=3306;dbname=myBase',
 * 								'tableName' => 'myTable'
 * 							)
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class PDOFile extends AbstractFile {
	//const URL_DBNAME_TABLE_NAMESEPARATOR = '|';
	
	private static $ActiveConnections = array();
	
	/**
	 * @var string
	 */
	private $path;
	
	private $connectionData = array();
	
	
	/**
	 * @param string $path The path to the file
	 * @param mixed $params Additional arguments (could be useful for derivated classes)
	 */
	public function __construct($path, $params = null) {
		$urlParts = AdvancedPathLib::parse_url($path);
		
		//DSN
		if (!isset($params['PDOFile::dsn'])) {
			throw new EyeInvalidArgumentException('Missing DSN (key "dsn") in $params for database connection.');
		}
		$this->connectionData['dsn'] = $params['dsn'];
		
		//TABLE NAME
		if (!isset($params['PDOFile::tableName'])) {
			throw new EyeInvalidArgumentException('Missing table name (key "tableName") in $params for database connection.');
		}
		$this->connectionData['tableName'] = $params['tableName'];
		
		//USER
		if (isset($params['PDOFile::user'])) {
			$this->connectionData['user'] = $params['PDOFile::user'];
		}
		
		//PASSWORD
		if (isset($params['PDOFile::password'])) {
			$this->connectionData['password'] = $params['PDOFile::password'];
		}
		
		$this->path = $path;
	}
	
	/**
	 * @param mixed $newGroup The group name or group number or an object representing the group. 
	 * @param bool $recursive
	 * @return boolean TRUE if the group has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chgrp($newGroup, $recursive = false) {
		//TODO
	}
	
	/**
	 * @param int $newMode The new mode (octal value). 
	 * @param bool $recursive
	 * @return boolean TRUE if the mode has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 */
	public function chmod($newMode, $recursive = false) {
		//TODO
	}
	
	/**
	 * @param mixed $newGroup The user name or user number or an object representing the user. 
	 * @param bool $recursive
	 * @return boolean TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chown($newOwner, $recursive = false) {
		//TODO
	}
		
	/**
	 * @param IFile $file The source file to copy from.
	 * @return bool TRUE if the file has been successfully copied from $file, FALSE otherwise.
	 * @throws EyeIOException
	 */
	protected function copyFrom(IFile $file, $overwrite = true) {
		//TODO
	}
	
	/**
	 * @param bool $overwrite Set to TRUE to try overwriting the file if it already exists.
	 * @return bool TRUE if the file has been successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function createNewFile($overwrite = false) {
		//TODO
	}
	
	/**
	 * @param IFile $target The target file the link will point to.
	 * @param bool $overwrite
	 * @return bool TRUE if the link has been successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function createNewLink(IFile $target, $overwrite = false) {
		//TODO
	}
	
	protected static function createTable($connectionData, $dropFirst = false) {		
		if (!is_string($connectionData['tableName']) || $connectionData['tableName'] == '') {
			throw new EyeInvalidArgumentException('$connectionData[\'tableName\'] must be a non-empty string.');
		}
		$con = self::getConnection($connectionData);
		
		//TODO
	}
	
	/**
	 * @param bool $recursive
	 * @param bool $onlyContents In the case of a directory, only delete the files it contains if TRUE
	 * or the entire directory otherwise.
	 * @return bool TRUE if the file has been successfully deleted, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function delete($recursive = false, $onlyContents = false) {
		//TODO
	}
	
	protected static function destroyConnection($connectionData) {
		$key = '';
		if (isset($connectionData['user'])) {
			$key .= $connectionData['user'];
			$key .= isset($connectionData['password']) ? ':' . $connectionData['password'] .'@' : '@';
		}
		$key .= $connectionData['dsn'];
		unset(self::$ActiveConnections[$key]);
	}
	
	/**
	 * @param bool $forceCheck TRUE to force clearing the cache before checking the file's existence.
	 * @return bool TRUE if the file/folder/link exists, FALSE otherwise.
	 */
	public function exists($forceCheck = false) {
		//TODO
	}
	
	/**
	 * Forces fetching stats from the current file now (if supported).
	 * @return bool
	 */
	public function fetchStats() {
		//TODO
	}
	
	/**
	 * @return string
	 */
	public function getAbsolutePath() {
		//TODO
	}
	
	protected static function getConnection($connectionData) {
		if (!is_array($connectionData)) {
			throw new EyeInvalidArgumentException('$connectionData must be an array.');
		}
		if (!is_string($connectionData['dsn']) || $connectionData['dsn'] == '') {
			throw new EyeInvalidArgumentException('$connectionData[\'dsn\'] must be a non-empty string.');
		}
		
		$key = '';
		if (isset($connectionData['user'])) {
			$key .= $connectionData['user'];
			$key .= isset($connectionData['password']) ? ':' . $connectionData['password'] .'@' : '@';
		}
		$key .= $connectionData['dsn'];
		
		try {
			if (!isset(self::$ActiveConnections[$key])) {
				if (isset($connectionData['user'])) {
					if (isset($connectionData['password'])) {
						self::$ActiveConnections[$key] = new PDO($connectionData['dsn'], $connectionData['user'], $connectionData['password']);
					} else {
						self::$ActiveConnections[$key] = new PDO($connectionData['dsn'], $connectionData['user']);
					}
				} else {
					self::$ActiveConnections[$key] = new PDO($connectionData['dsn']);
				}
			}
		} catch (PDOException $e) {
			throw new EyeDBException('Unable to connect to database with DSN "' . $connectionData['dsn']
				. '" (user: "' . $connectionData['user'] . '", password: ' . isset($connectionData['password']) ? 'yes' : 'no' . ')');
		}
		return self::$ActiveConnections[$key];
	}
	
	/**
	 * NOTE: in the case of a link, the data is read from its target.
	 * @return mixed The content of the file or FALSE if an error occured.
	 * @throws EyeIOException
	 */
	public function getContents() {
		//TODO
	}
	
	/**
	 * @return string The extension of the file.
	 */
	public function getExtension() {
		//TODO
	}
	
	/**
	 * @return mixed The group of the file as an integer if the ID is retrievable, as a string otherwise.
	 */
	public function getGroup() {
		//TODO
	}
	
	/**
	 * @return IFile The target file pointed by the link, or FALSE if an error occured.
	 * @throws EyeIOException
	 */
	public function getLinkTarget() {
		//TODO
	}
	
	/**
	 * @return string The name of the file.
	 */
	public function getName() {
		//TODO
	}
	
	/**
	 * @return mixed The owner of the file as an integer if the ID is retrievable, as a string otherwise.
	 */
	public function getOwner() {
		//TODO
	}
	
	/**
	 * @return string The path of the file's parent directory.
	 */
	public function getParentPath() {
		//TODO
	}
	
	/**
	 * @return LocalFile The file corresponding to the file's parent directory.
	 */
	public function getParentFile() {
		//TODO
	}
	
	/**
	 * @return string
	 */
	public function getPath() {
		//TODO
	}
	
	/**
	 * @return string
	 */
	public function getPathFromRoot() {
		//TODO
	}
	
	/**
	 * @return array('dirname' => ..., 'basename' => ..., 'extension' => ..., 'filename' => ...)
	 */
	public function getPathInfo() {
		//TODO
	}
	
	/**
	 * @return string The permissions of the file.
	 * @throws EyeIOException
	 */
	public function getPermissions($octal = true) {
		//TODO
	}
	
	/**
	 * @return int The size of the file (in KB).
	 * @throws EyeIOException
	 */
	public function getSize($recursive = false) {
		//TODO
	}
	
	/**
	 * @return int The umask to apply when creating new files/link/folders
	 */
	public function getUMask() {
		//TODO
	}
	
	/**
	 * @return array The result of the function AdvancedPathLib::parse_url() on the path.
	 */
	public function getURLComponents() {
		//TODO
	}
		
	/**
	 * @return bool TRUE if the file is a directory, FALSE otherwise.
	 */
	public function isDirectory() {
		//TODO
	}
	
	/**
	 * @return boolean TRUE if the file can be executed, FALSE otherwise.
	 */
	public function isExecutable() {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the file is a normal file, FALSE otherwise.
	 */
	public function isFile() {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the file is a link, FALSE otherwise.
	 */
	public function isLink() {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the file can be read by the current user, FALSE otherwise.
	 */
	public function isReadable() {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the file can be written by the current user, FALSE otherwise.
	 */
	public function isWritable() {
		//TODO
	}
	
	/**
	 * @return array(IFile) The list of the files contained in the "file" itself if this
	 * one is a directory, or the files contained in the parent directory if this one is
	 * a normal file.
	 * @throws EyeIOException
	 */
	public function listFiles($pattern='*', $flags=AdvancedPathLib::GLOB_NORMAL) {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the directory has been successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function mkdir($mode = null) {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the directory and all the needed parent ones have been.
	 * successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function mkdirs($mode = null) {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the file has been successfully moved, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function moveTo(IFile $file) {
		//TODO
	}
	
	/**
	 * @return int The number of bytes written to the file.
	 * @param mixed $data THe data to be written to the file.
	 * @param int $flags FILE_APPEND | LOCK_EX (FILE_TEXT | FILE_BINARY only for PHP 6)
	 * @throws EyeBadMethodCallException
	 * @throws EyeIOException
	 */
	public function putContents($data, $flags = 0) {
		//TODO
	}
	
	/**
	 * @return bool TRUE if the file has been successfully renamed, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function renameTo($newName) {
		//TODO
	}
}
?>