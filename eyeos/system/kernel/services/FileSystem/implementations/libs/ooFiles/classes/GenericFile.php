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
 * This class extends the AbstractFile class for the files transparently handled by PHP.
 * (local files, sockets, (FTP), HTTP, SSH, ...)
 * It is designed to be a full featured wrapper to access and manage files with PHP.
 * But, as PHP library is not perfectly adapted to manage *all* files the same way, it may
 * be extended via specialized subclasses.
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class GenericFile extends AbstractFile {
	/**
	 * @var string
	 */
	protected $path;
	
	/**
	 * @var array
	 * @see GenericFile->clearStatsCache()
	 */
	protected $statsCache = array(
		'isDirectory' => null,				//bool
		'isFile' => null,					//bool
		'isLink' => null,					//bool
		'permissions' => null,				//string
		'size' => null,						//int
		'linkTarget' => null				//string
	);
	
	/**
	 * @param string $path The path to the file (MUST BE A VALID URL)
	 *                     - file:///home/john/eyeos/users/jn4/john/files/myFile.txt
	 *                     - file://localhost/home/john/eyeos/users/jn4/john/files/myFile.txt
	 *                     - file://C:/myFolder/myFile.ext
	 *                     - ...
	 * @param mixed $params Additional arguments (could be useful for derivated classes)
	 */
	public function __construct($path, $params = null) {
		AdvancedPathLib::parse_url($path);
		$this->path = $path;
	}
	
	/**
	 * @param mixed $newGroup The group name or group number or an object representing the group. 
	 * @param bool $recursive
	 * @return bool TRUE if the group has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chgrp($newGroup, $recursive = false) {
		if ($recursive) {
			//TODO recursive chgrp
			throw new EyeNotImplementedException(__METHOD__ . ': $recursive = true');
		}
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			if ($this->isLink()) {
				return lchgrp($path, $newGroup);
			} else {
				return chgrp($path, $newGroup);
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to change file\'s group at ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * @param int $newMode The new mode (octal value).
	 * @param bool $recursive
	 * @return bool TRUE if the mode has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 */
	public function chmod($newMode, $recursive = false) {
		if ($recursive) {
			//TODOrecursive chmod
			throw new EyeNotImplementedException(__METHOD__ . ': $recursive = true');
		}
		if (!is_integer($newMode)) {
			throw new EyeInvalidArgumentException('Expecting an octal value for $newMode. Given: "' . $newMode . '" (' . gettype($newMode) . ').');
		}
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			return chmod($path, $newMode);
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to change file\'s mode at ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * @param mixed $newOwner The user name or user number or an object representing the user.
	 * @param bool $recursive
	 * @return bool TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chown($newOwner, $recursive = false) {
		if ($recursive) {
			//TODO recursive chown
			throw new EyeNotImplementedException(__METHOD__ . ': $recursive = true');
		}
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			if ($this->isLink()) {
				return lchown($path, $newOwner);
			} else {
				return chown($path, $newOwner);
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to change file\'s owner at ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * Alias for clearstatcache()
	 */
	public static function clearCache() {
		clearstatcache();
	}
	
	/**
	 * Clear object's internal cache (forces next call to information getters to fetch *real* data).
	 * @return void
	 */
	public function clearStatsCache() {
		foreach ($this->statsCache as &$cacheValue) {
			$cacheValue = null;
		}
	}
	
	/**
	 * @param IFile $file The source file to copy from.
	 * @return bool TRUE if the file has been successfully copied from $file, FALSE if an error occured
	 * Note: An exception is raised if an important error is detected (the copy of a single file failed),
	 *       but during a folder copy, a failure during the copy of a single "sub-file" is ignored and no
	 *       exception is raised.
	 *       Nevertheless, you can check if the copy was a full success by testing the returned value.
	 * @throws EyeIOException
	 * @throws EyeFileNotFoundException
	 */
	protected function copyFrom(IFile $file, $overwrite = true) {
		if ($this->isDirectory() && (!$file->isDirectory() || $this->getName() != $file->getName())) {
			if ($this->getName() != '/' || $file->getName() != '/') {
				return $this->getChildFile($file->getName())->copyFrom($file, $overwrite);
			}
		}
		if ($this->exists() && !$overwrite) {
			throw new EyeIOException($this->path.'" exists and can\'t be overwritten.');
		}
		
		//FILE or LINK
		if ($file->isFile() || $file->isLink()) {
			$srcPath = AdvancedPathLib::getPhpLocalHackPath($file->getPath());
			$destPath = AdvancedPathLib::getPhpLocalHackPath($this->path);	
			
			// First, let's try with the function provided by PHP, but only working with
			// a very restricted range of filesystems
			if (copy($srcPath, $destPath)) {
				return true;
			}
			if (!$this->exists() && !$this->createNewFile(true)) {
				throw new EyeIOException('Unable to create destination file ' . $this->path . '.');
			}
			try {
				$fileWriter = new FileWriter($this->getOutputStream());
				$fileReader = new FileReader($file->getInputStream());
				
				$buffer = null;
				while($fileReader->read($buffer) !== 0) {
					$fileWriter->write($buffer);
				}
				
				$fileReader->close();
				$fileWriter->close();
				
				return true;
			} catch (Exception $e) {
				if (is_object($fileReader)) {
					$fileReader->close();
				}
				if (is_object($fileWriter)) {
					$fileWriter->close();
				}
				throw new EyeIOException('Unable to transfer files contents ' . $file->getPath() . ' => ' . $this->path . '.', 0, $e);
			}
		}
		//DIRECTORY
		elseif ($file->isDirectory()) {
			if ($this->isDirectory() || $this->mkdirs()) {
				$success = true;
				foreach($file->listFiles() as $subFile) {
					try {
						if (!$subFile->copyTo($this)) {
							$success = false;
						}
					} catch (Exception $e) {
						$success = false;
					}
				}
				return $success;
			}
			else {
				throw new EyeIOException('Unable to create destination directory ' . $this->path . '.');
			}
		}
		else {
			throw new EyeFileNotFoundException($file->getPath() . ' does not exist.');
		}
	}
	
	
	/**
	 * @param bool $overwrite Set to TRUE to try overwriting the file if it already exists
	 * @return bool TRUE if the file has been successfully created, FALSE otherwise
	 * @throws EyeIOException
	 */
	public function createNewFile($overwrite = false) {
		if ($this->exists()) {
			if ($overwrite) {
				try {
					$this->delete();
				} catch (Exception $e) {
					throw new EyeIOException($this->path . ' exists and can\'t be overwritten.', 0, $e);
				}
			} else {
				throw new EyeFileAlreadyExistsException($this->path . ' already exists. Try overwrite instead.');
			}
		}
		try {
			$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
			$fp = fopen($path, 'w');
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to create file ' . $this->path . '.', 0, $e);
		}
		if ($fp === false) {
			throw new EyeIOException('Unable to create file ' . $this->path . ', fopen() failed.');
		}
		fclose($fp);
		return true;
	}
	
	/**
	 * @param IFile $target The target file the link will point to
	 * @param bool $overwrite
	 * @return bool TRUE if the link has been successfully created
	 * @throws EyeIOException
	 * @throws EyeUnsupportedOperationException
	 */
	public function createNewLink(IFile $target, $overwrite = false) {
		$linkPath = AdvancedPathLib::getPhpLocalHackPath($this->path);
		$targetPath = AdvancedPathLib::getPhpLocalHackPath($target->path);
		try {
			if (!function_exists('symlink')) {
				throw new EyeUnsupportedOperationException('Link creation is not available on this server.');
			}
			if (symlink($targetPath, $linkPath) === false) {
				throw new EyeIOException('Link creation failed for ' . $linkPath . '.');
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Link creation failed for ' . $linkPath . '.', 0, $e);
		}
		return true;
	}
	
	/**
	 * @param bool $recursive
	 * @param bool $onlyContents In the case of a directory, only delete the files it contains if TRUE
	 * or the entire directory otherwise
	 * @return bool TRUE if the file has been successfully deleted, FALSE otherwise
	 * @throws EyeIOException
	 * @throws EyeFileNotFoundException
	 */
	public function delete($recursive = false, $onlyContents = false) {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		if ($this->isDirectory()) {
			$success = true;
			if ($recursive || $onlyContents) {
				foreach($this->listFiles() as $subFile) {
					$success = $success && $subFile->delete(true, false);
				}
				//when using glob(), we need to specify explicitely hidden files to list them
				foreach($this->listFiles('.*') as $subFile) {
					$success = $success && $subFile->delete(true, false);
				}
			}
			if (!$onlyContents) {
				try {
					return rmdir($path) && $success;
				} catch (EyeErrorException $e) {
					throw new EyeIOException('Unable to delete directory ' . $this->path . '.', 0, $e);
				}
			}
			return $success;
		}
		elseif ($this->isFile() || $this->isLink()) {
			try {
				return unlink($path);
			} catch (EyeErrorException $e) {
				throw new EyeIOException('Unable to delete file ' . $this->path . '.', 0, $e);
			}
		}
		else {
			throw new EyeFileNotFoundException($this->path . ' does not exist.');
		}
	}
	
	/**
	 * @return bool TRUE if the file/folder exists, FALSE otherwise
	 * @throws EyeIOException
	 */
	public function exists($forceCheck = false) {
		if ($forceCheck) {
			self::clearCache();
		}
		$Logger = Logger::getLogger('GenericFile.exists');
		$Logger->debug("Exists path: " . $this->path);

		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			return file_exists($path);
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to check file\'s existence at ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * Forces fetching stats from the current file now.
	 * @return bool
	 */
	public function fetchStats() {
		return false;
	}
	
	/**
	 * @return string
	 */
	public function getAbsolutePath() {
		return AdvancedPathLib::buildURL($this->getURLComponents());
	}
	
	/**
	 * Note: You should consider using a FileInputStream returned by getInputStream() instead.
	 * @see FileInputStream (package system-libs/streams)
	 * @see FileReader (package system-libs/streams)
	 * 
	 * @see file_get_contents
	 * 
	 * @return mixed The content of the file or FALSE if an error occured
	 * @throws EyeBadMethodCallException
	 * @throws EyeIOException
	 */
	public function getContents() {
		if ($this->isDirectory()) {
			throw new EyeBadMethodCallException($this->path . ' is a directory.');
		}
		if (!$this->exists()) {
			throw new EyeFileNotFoundException($this->path . ' does not exist.');
		}
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			return file_get_contents($path);
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to read file\'s content at ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * @return IFile The target file pointed by the link
	 * @throws EyeUnsupportedOperationException
	 */
	public function getLinkTarget() {
		if ($this->isLink()) {
			$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
			$thisClass = get_class($this);
			return new $thisClass(readlink($path));
		}
		throw new EyeUnsupportedOperationException($this->path . ' is not a link.');
	}
	
	/**
	 * @return string The extension of the file
	 */
	public function getExtension() {
		return pathinfo($this->path, PATHINFO_EXTENSION);
	}
	
	/**
	 * @return int The group ID of the file
	 */
	public function getGroup() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			$groupId = filegroup($path);
		} catch (EyeErrorException $e) {
			throw new EyeStatFailedException('Unable to read file\'s group for ' . $this->path . '.', 0, $e);
		}
		if ($groupId === false) {
			throw new EyeStatFailedException('Unable to read file\'s group for ' . $this->path . '.');
		}
		return $groupId;
	}
	
	/**
	 * @return string The name of the file
	 */
	public function getName() {
		if ($this->getPathFromRoot() == '/') {
			return '/';
		}
		$pathInfo = utf8_pathinfo($this->path);
		return $pathInfo['basename'];
	}
	
	/**
	 * @return int The owner ID of the file
	 */
	public function getOwner() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			$ownerId = fileowner($path);
		} catch (EyeErrorException $e) {
			throw new EyeStatFailedException('Unable to read file\'s owner for ' . $this->path . '.', 0, $e);
		}
		if ($ownerId === false) {
			throw new EyeStatFailedException('Unable to read file\'s owner for ' . $this->path . '.');
		}
		return $ownerId;
	}
	
	/**
	 * @return string The path of the file's parent directory
	 */
	public function getParentPath() {
		if (preg_match('/^[a-z]{1}:\/?$/i', AdvancedPathLib::getPhpLocalHackPath($this->path))) {
			return $this->getAbsolutePath();		//if the path is the root of a Windows drive, return itself
		}
		$urlParts = $this->getURLComponents();
		$urlParts['path'] = AdvancedPathLib::dirname($urlParts['path']);
		return AdvancedPathLib::buildUrl($urlParts);
	}
	
	/**
	 * @return GenericFile The file corresponding to the file's parent directory
	 */
	public function getParentFile() {
		$thisClass = get_class($this);
		return new $thisClass($this->getParentPath());
	}
	
	/**
	 * @return string
	 */
	public function getPath() {
		return $this->path;
	}
	
	/**
	 * @return string
	 */
	public function getPathFromRoot() {
		$urlParts = $this->getURLComponents();
		return AdvancedPathLib::realpath($urlParts['path']);
	}
	
	/**
	 * @return array('dirname' => ..., 'basename' => ..., 'extension' => ..., 'filename' => ...)
	 */
	public function getPathInfo() {
		return pathinfo($this->path);
	}
	
	/**
	 * @param bool $octal TRUE to return permissions in octal form (755),
	 *                       FALSE to return them in Unix form (rwxr-xr-x)
	 * @return mixed The permissions of the file
	 * @throws EyeStatFailedException
	 */
	public function getPermissions($octal = true) {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		$perms = fileperms($path);
		if ($perms == false) {
			throw new EyeStatFailedException('Unable to fetch permissions for file ' . $this->path.'.');
		}
		if (!$octal) {
			$perms = AdvancedPathLib::permsToUnix($perms);
		}
		return $perms;
	}
	
	/**
	 * @return int The size of the file/directory, in bytes (B)
	 *             Notes: - If the file doesn't exist, the function will return 0
	 *                    - The recursive process doesn't follow links
	 * @throws EyeStatFailedException
	 */
	public function getSize($recursive = false) {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		
		//file
		if ($this->isFile() || $this->isLink()) {
			self::clearCache();
			try {
				$size = filesize($path);
				if ($size === false) {
					throw new EyeStatFailedException('Unable to get the size of file ' . $this->path . '.');
				}
			} catch (EyeErrorException $e) {
				throw new EyeStatFailedException('Unable to get the size of file ' . $this->path . '.', 0, $e);
			}
			return $size;
		}
		//directory
		elseif($this->isDirectory()) {
			$totalSize = 0;
			foreach($this->listFiles() as $file) {
				try {
					if ($file->isFile() || $file->isLink()) {
						$totalSize += $file->getSize();
					}
					elseif ($recursive === true) {
						$totalSize += $file->getSize(true);
					}
				} catch (Exception $e) {
					continue;
				}
			}
			return $totalSize;
		}
		else {
			return 0;
		}
	}
	
	/**
	 * @return int The umask to apply when creating new files/link/folders
	 */
	public function getUMask() {
		return umask();
	}
	
	/**
	 * @return array The components forming the URL of the path (@see parse_url() in PHP manual)
	 */
	public function getURLComponents() {
		return AdvancedPathLib::parse_url($this->path);
	}
		
	/**
	 * @return bool TRUE if the file is a directory, FALSE otherwise
	 */
	public function isDirectory() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		return is_dir($path);
	}
	
	/**
	 * @return bool TRUE if the file can be read by the current user, FALSE otherwise.
	 */
	public function isExecutable() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		return is_executable($path);
	}
	
	/**
	 * @return bool TRUE if the file is a normal file, FALSE otherwise
	 */
	public function isFile() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		return is_file($path);
	}
	
	/**
	 * @return bool TRUE if the file is a link, FALSE otherwise
	 */
	public function isLink() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		return is_link($path);
	}
	
	/**
	 * @return bool TRUE if the file can be read by the current user, FALSE otherwise.
	 */
	public function isReadable() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		return is_readable($path);
	}
	
	/**
	 * @return bool TRUE if the file can be written by the current user, FALSE otherwise.
	 */
	public function isWritable() {
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		return is_writable($path);
	}
	
	/**
	 * @param mixed $pattern A filter pattern as a string (same as *NIX shell), or an
	 * array of possible patterns.
	 * @param int $flags GLOB_NORMAL | GLOB_ONLY_DIR | GLOB_DIR_IGNORE_PATTERN
	 *                       | GLOB_DIR_FIRST | GLOB_FORCE_SCANDIR | GLOB_CASEINSENSITIVE
	 * 					(@see class AdvancedPathLib)
	 * @return array(IFile) The list of the files contained in the "file" itself if $this
	 * is a directory, or the files contained in the parent directory if $this is a
	 * normal file
	 * @throws EyeIOException
	 */
	public function listFiles($pattern = '*', $flags = AdvancedPathLib::GLOB_NORMAL) {
		if (!$this->isDirectory()) {
			throw new EyeBadMethodCallException('Cannot list files: ' . $this->path . ' is not a directory.');
		}
		$dirPath = $this->getAbsolutePath();
		
		try {
			$files = AdvancedPathLib::glob($dirPath, $pattern, $flags);
		} catch(Exception $e) {
			throw new EyeIOException('Unable to list files in directory ' . $dirPath . '.', 0, $e);
		}
		$filesObjects = array();
		$thisClass = get_class($this);
		foreach($files as $filepath) {
			try {
				$filesObjects[] = new $thisClass($filepath);
			} catch (Exception $e) {
				throw new EyeIOException('Unable to create file object for ' . $filepath . '.', 0, $e);
			}
		}
		return $filesObjects;
	}
	
	/**
	 * @param int $mode The mode. Default is 0777 - umask.
	 * @return bool TRUE if the directory has been successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function mkdir($mode = null) {
		if($mode === null) {
			$mode = 0777 & ~$this->getUMask();
		}
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			if(mkdir($path, $mode)) {
				return true;
			}
			throw new EyeIOException('Unable to create directory at ' . $this->path . '.');
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to create directory at ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * @param int $mode The mode. Default is 0777 - umask.
	 * @return bool TRUE if the directory and all the needed parent ones have been
	 * successfully created, FALSE otherwise
	 * @throws EyeIOException
	 */
	public function mkdirs($mode = null) {
		if($mode === null) {
			$mode = 0777 & ~$this->getUMask();
		}
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			if(mkdir($path, $mode, true)) {
				return true;
			}
			throw new EyeIOException('Unable to create directory at ' . $this->path . '.');
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to create directory at ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * @return bool TRUE if the file has been successfully moved, FALSE otherwise
	 * @throws EyeIOException
	 */
	public function moveTo(IFile $file) {
		if (!$this->exists()) {
			throw new EyeFileNotFoundException($this->path . ' does not exist.');
		}
		if ($file->isDirectory()) {
			$target = $file->getChildFile($this->getName());
		}
		else {
			$target = $file;
		}
		if ($target->isFile()) {
			return false;
		}
		try {
			if ($target->copyFrom($this)) {
				$this->delete(true);
			}
		} catch (Exception $e) {
			throw new EyeIOException('Error occured during file move ' . $this->path . ' => ' . $file->getPath() . '.', 0, $e);
		}
		return true;
	}
	
	/**
	 * Note: You should consider using a FileOutputStream returned by getOutputStream() instead.
	 * @see FileOutputStream (package system-libs/streams)
	 * @see FileWriter (package system-libs/streams)
	 * 
	 * @see file_put_contents
	 * 
	 * @return int The number of bytes written to the file.
	 * @param mixed $data THe data to be written to the file.
	 * @param int $flags FILE_APPEND | LOCK_EX (FILE_TEXT | FILE_BINARY only for PHP 6)
	 * @throws EyeBadMethodCallException
	 * @throws EyeIOException
	 */
	public function putContents($data, $flags = 0) {
		if (!is_int($flags)) {
			throw new EyeInvalidArgumentException('Expecting an integer value for $flags. Given: "' . $flags . '" (' . gettype($flags) . ').');
		}
		if ($this->isDirectory()) {
			throw new EyeBadMethodCallException($this->path . ' is a directory.');
		}
		$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
		try {
			$bytesWritten = file_put_contents($path, $data, $flags);
			if ($bytesWritten === false) {
				throw new EyeIOException('Unable to write data to file ' . $this->path . '.');
			} else {
				return $bytesWritten;
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to write data to file ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * @return bool TRUE if the file has been successfully renamed.
	 * @throws EyeIOException
	 */
	public function renameTo($newName) {
		if (!$this->exists()) {
			throw new EyeFileNotFoundException($this->path . ' does not exist.');
		}
		if (!$newName) {
			return true;
		}
		$urlParts = AdvancedPathLib::parse_url($this->path);
		$urlParts['path'] = AdvancedPathLib::unifyPath(dirname($urlParts['path']) . '/' . $newName);
		$newPath = AdvancedPathLib::buildURL($urlParts);
		if ($this->exists()) {
			$path = AdvancedPathLib::getPhpLocalHackPath($this->path);
			$newPath = AdvancedPathLib::getPhpLocalHackPath($newPath);
			try {
				if (rename($path, $newPath)) {
					$this->path = $newPath;
					return true;
				}
				throw new EyeIOException('Unable to rename file ' . $this->path . '.');
			} catch (EyeErrorException $e) {
				throw new EyeIOException('Unable to rename file ' . $this->path . '.', 0, $e);
			}
		}
		else {
			$this->path = $newPath;
			return true;
		}
	}
}
?>