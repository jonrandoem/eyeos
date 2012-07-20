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

AdvancedPathLib::parse_url_registerFragment2PathProtocol(array('ftp', 'ftps'));

/**
 * This class extends the GenericFile class to handle remote FTP files management.
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class FTPFile extends GenericFile  {
	const CONNECTION_TIMEOUT = 90;
	const ANONYMOUS_USERNAME = 'anonymous';
	const ANONYMOUS_PASSWORD = 'ftp@eyeos.org';
	const DEFAULT_PORT = 21;
	
	/**
	 * Connections pool for current HTTP request.
	 * @var array(user:pass@IP_addr:port => resource)
	 */
	static $connectedHosts = array();

	/**
	 * @param $path The path to the file (MUST BE A VALID URL)
	 *              - ftp://ftp.eyeos.org/
	 *              - ftp://usertest@ftp.eyeos.org:21/test/myFile.txt
	 *              - ...
	 * @param mixed $params Initial stats of the file (@see protected var GenericFile::$statsCache)
	 */
	public function __construct($path = '', $params = null) {
		parent::__construct($path, $params);
		if (is_array($params)) {
			$this->statsCache['isDirectory'] = isset($params['isDirectory']) ?  $params['isDirectory'] : null;
			$this->statsCache['isFile'] = isset($params['isFile']) ?  $params['isFile'] : null;
			$this->statsCache['isLink'] = isset($params['isLink']) ?  $params['isLink'] : null;
			$this->statsCache['permissions'] = isset($params['permissions']) ?  $params['permissions'] : null;
			$this->statsCache['size'] = isset($params['size']) ?  $params['size'] : null;
			$this->statsCache['linkTarget'] = isset($params['linkTarget']) ?  $params['linkTarget'] : null;
			$this->statsCache['owner'] = isset($params['owner']) ?  $params['owner'] : null;
			$this->statsCache['group'] = isset($params['group']) ?  $params['group'] : null;
		}
	}
	
	/**
	 * @param mixed $newGroup The group name or group number or an object representing the group. 
	 * @param bool $recursive
	 * @return bool TRUE if the group has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chgrp($newGroup, $recursive = false) {
		throw new EyeUnsupportedOperationException('Unable to change group of a FTP file.');
	}
	
	/**
	 * @param int $newMode The new mode (octal value).
	 * @param $bool $recursive
	 * @return bool TRUE if the mode has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 */
	public function chmod($newMode, $recursive = false) {
		if ($recursive) {
			//TODO recursive chmod
			throw new EyeNotImplementedException(__METHOD__ . ': $recursive = true');
		}
		if (!is_integer($newMode)) {
			throw new EyeInvalidArgumentException('Expecting an octal value for $newMode. Given: "' . $newMode . '" (' . gettype($newMode) . ').');
		}
		$pathFromRoot = $this->getPathFromRoot();
		$res = $this->getConnection();
		try {
			if (ftp_chmod($res, $newMode, $pathFromRoot)) {
				$this->statsCache['permissions'] = AdvancedPathLib::permsToUnix($newMode);
				return true;
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to change file\'s mode at ' . AdvancedPathLib::getURLForDisplay($this->path));
		}
		throw new EyeUnknownErrorException('Unable to change file\'s mode at ' . AdvancedPathLib::getURLForDisplay($this->path));
	}
	
	/**
	 * @param mixed $newGroup The user name or user number or an object representing the user.
	 * @param bool $recursive
	 * @return bool TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chown($newOwner, $recursive = false) {
		throw new EyeUnsupportedOperationException('Unable to change owner of a FTP file.');
	}
	
	/**
	 * Clear object's internal cache (forces next call to information getters to fetch *real* data).
	 * @return void
	 */
	public function clearStatsCache() {
		parent::clearStatsCache();
		$this->statsCache['owner'] = null;
		$this->statsCache['group'] = null;
	}
	
	/**
	 * Sort files list processed by parse_rawlist() in order to put the folders on top
	 * of the list.
	 * AUTOMATICALLY CALLED BY parse_rawlist()
	 * 
	 * @param array $a
	 * @param array $b
	 * @return int A negative value if $a must be placed before $b, a positive value otherwise
	 */
	protected static function compareFilesData($a, $b) {
		if ($a['type'] == $b['type']) {			
			return strcmp($a['name'], $b['name']);
		}
		if ($a['type'] == 'd' && $b['type'] != 'd')
			return -1;
		if ($a['type'] != 'd' && $b['type'] == 'd')
			return 1;
	}
	
	/**
	 * @return bool TRUE if the file has been successfully copied from $file, FALSE otherwise
	 */
	protected function copyFrom(IFile $file, $overwrite = true) {
		$this->destroyConnection();
		return parent::copyFrom($file, $overwrite);
	}
	
	/**
	 * @param bool $overwrite Set to TRUE to try overwriting the file if it already exists
	 * @return bool TRUE if the file has been successfully created, FALSE otherwise
	 */
	public function createNewFile($overwrite = false) {
		$context = null;
		if ($overwrite) {
			$opts = array('ftp' => array('overwrite' => true));
			$context = stream_context_create($opts);
		}
		else {
			$opts = array('ftp' => array('overwrite' => false));
			$context = stream_context_create($opts);
		}
		$this->destroyConnection();
		try {
			$fp = fopen($this->path, 'w', false, $context);
			if ($fp === false) {
				throw new EyeIOException('Unable to create file '.AdvancedPathLib::getURLForDisplay($this->path).', fopen() failed.');
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to create file '.AdvancedPathLib::getURLForDisplay($this->path).', fopen() failed.', 0, $e);
		}
		fclose($fp);
		
		//updating internal stats
		$this->statsCache['isDirectory'] = false;
		$this->statsCache['isFile'] = true;
		$this->statsCache['isLink'] = false;
		$this->statsCache['size'] = 0;
		$this->statsCache['linkTarget'] = null;
		
		return true;
	}
	
	/**
	 * @param IFile $target The target file the link will point to
	 * @param bool $overwrite
	 * @return bool TRUE if the link has been successfully created, FALSE otherwise
	 * THIS METHOD IS NOT (YET?) AVAILABLE WITH FTP PROTOCOL.
	 */
	public function createNewLink(IFile $target, $overwrite = false) {
		throw new EyeUnsupportedOperationException('Link creation is not supported by FTP '.AdvancedPathLib::getURLForDisplay($this->path).'.');
	}
	
	/**
	 * @param bool $recursive Try to delete folders and files recursively
	 *                (Warning: can be _very_ long to perform on FTP servers)
	 * @param bool $onlyContents In the case of a directory, only delete the files it contains if TRUE
	 * or the entire directory otherwise
	 * @return bool TRUE if the file has been successfully deleted, FALSE otherwise
	 */
	public function delete($recursive = false, $onlyContents = false) {
		$success = true;
		if ($this->isDirectory()) {
			if ($recursive || $onlyContents) {
				foreach($this->listFiles() as $subFile) {
					$success &= $subFile->delete(true, false);
				}
			}
			if (!$onlyContents) {
				$res = $this->getConnection();
				if (ftp_rmdir($res, $this->getPathFromRoot())) {
					$success = true;
					$this->statsCache['isDirectory'] = false;
				}
				else {
					$success = false;
				}
			}
			else {
				$success &= true;
			}
		}
		elseif ($this->isFile() || $this->isLink()) {
			$res = $this->getConnection();
			if (ftp_delete($res, $this->getPathFromRoot())) {	
				$success = true;
				$this->statsCache['isFile'] = false;
				$this->statsCache['isLink'] = false;
			}
			else {
				$success = false;
			}
		}
		return $success;
	}
	
	/**
	 * Destroys the connection matching the current file if any.
	 * This method is used to shut down a connection made with ftp_connect() before
	 * using a standard function (such as fopen) because this one will make a second
	 * connection, which may be refused by the FTP server.
	 */
	protected function destroyConnection() {
		$urlParts = $this->getURLComponents();
		self::registerConnection(false, $urlParts['host'], $urlParts['port'], $urlParts['user'], $urlParts['pass']);
	}
	
	/**
	 * @return bool TRUE if the file/folder exists, FALSE otherwise
	 */
	public function exists($forceCheck = false) {
		if ($forceCheck) {
			$this->statsCache['isDirectory'] = null;
			$this->statsCache['isFile'] = null;
			$this->statsCache['isLink'] = null;
		}
		return $this->isDirectory() || $this->isFile() || $this->isLink();
	}
	
	/**
	 * Forces fetching stats from the current file now.
	 * @return bool
	 */
	public function fetchStats() {		
		$urlParts = $this->getURLComponents();
		if ($urlParts['path'] == '/') {
			$this->statsCache['permissions'] = 'd---------';
			$this->statsCache['isDirectory'] = true;
			$this->statsCache['isFile'] = false;
			$this->statsCache['isLink'] = false;
			$this->statsCache['size'] = 0;
			$this->statsCache['linkTarget'] = null;
			$this->statsCache['owner'] = 0;
			$this->statsCache['group'] = 0;
			return true;
		}
		
		//fetching stats from parent folder's files list
		$parentUrlParts = $this->getParentFile()->getURLComponents();
		$res = $this->getConnection();
		$parentFilesList = ftp_rawlist($res, $parentUrlParts['path']);
		
		$fileInfo = false;
		if ($parentFilesList) {
			$thisName = $this->getName();
			$parsedParentFilesList = self::parseRawList($parentFilesList, false);
			foreach($parsedParentFilesList as $file) {
				if ($file['name'] == $thisName) {
					$fileInfo = $file;
					break;
				}
			}
		}
		
		//current file does not seem to exist
		if (!$fileInfo) {
			$this->statsCache['permissions'] = '----------';
			$this->statsCache['isDirectory'] = false;
			$this->statsCache['isFile'] = false;
			$this->statsCache['isLink'] = false;
			$this->statsCache['size'] = 0;
			$this->statsCache['linkTarget'] = null;
			$this->statsCache['owner'] = 0;
			$this->statsCache['group'] = 0;
			throw new EyeStatFailedException('Stat failed for ' . $this->path);
		}
		
		$this->statsCache['permissions'] = $fileInfo['type'].$fileInfo['perms'];
		$this->statsCache['owner'] = $fileInfo['owner'];
		$this->statsCache['group'] = $fileInfo['group'];
		switch ($fileInfo['type']) {
			case 'd':
				$this->statsCache['isDirectory'] = true;
				$this->statsCache['isFile'] = false;
				$this->statsCache['isLink'] = false;
				$this->statsCache['size'] = null;
				$this->statsCache['linkTarget'] = null;
				break;
			case 'l':
				$this->statsCache['isDirectory'] = false;
				$this->statsCache['isFile'] = false;
				$this->statsCache['isLink'] = true;
				$this->statsCache['size'] = $fileInfo['size'];
				$parsedLinkName = self::parseLinkName($this, $fileInfo[0]['name']);
				if (is_array($parsedLinkName)) {
					$this->statsCache['linkTarget'] = $parsedLinkName[2];
				} else {
					$this->statsCache['linkTarget'] = null;
				}
				break;
			default:
				$this->statsCache['isDirectory'] = false;
				$this->statsCache['isFile'] = true;
				$this->statsCache['isLink'] = false;
				$this->statsCache['size'] = $fileInfo['size'];
				$this->statsCache['linkTarget'] = null;
		}
		return true;
	}
	
	/**
	 * @param bool $forceReconnect
	 * @return resource
	 */
	protected function getConnection($forceReconnect = false) {
		$urlParts = $this->getURLComponents();
		$ftpResource = self::isConnectionRegistered($urlParts['host'], $urlParts['port'], $urlParts['user'], $urlParts['pass']);
		if ($ftpResource) {
			if ($forceReconnect) {
				ftp_close($ftpResource);
			} else {
				return $ftpResource;
			}
		}
		$host = $urlParts['host'];
		$port = $urlParts['port'] ? $urlParts['port'] : self::DEFAULT_PORT;
		try {
			if ($urlParts['scheme'] == 'ftps') {
				if (!function_exists('ftp_ssl_connect')) {
					throw new EyeUnsupportedOperationException('No FTPS protocol support found on this server to connect to '.AdvancedPathLib::getURLForDisplay($this->path));
				} else {
					$ftpResource = ftp_ssl_connect($host, $port, self::CONNECTION_TIMEOUT);
				}
			} else {
				$ftpResource = ftp_connect($host, $port, self::CONNECTION_TIMEOUT);
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to connect to host for file '.AdvancedPathLib::getURLForDisplay($this->path).'.', 0, $e);
		}
		if ($ftpResource === false) {
			throw new EyeIOException('Unable to connect to host for file '.AdvancedPathLib::getURLForDisplay($this->path).'.');
		}
		$username = $urlParts['user'] ? $urlParts['user'] : self::ANONYMOUS_USERNAME;
		$password = $urlParts['pass'] ? $urlParts['pass'] : self::ANONYMOUS_PASSWORD;
		try {
			if (ftp_login($ftpResource, $username, $password) === false) {
				ftp_close($ftpResource);
				throw new EyeIOException('Unable to login to host for file '.AdvancedPathLib::getURLForDisplay($this->path).'.');
			}
		} catch (EyeErrorException $e) {
			ftp_close($ftpResource);
			throw new EyeIOException('Unable to login to host for file '.AdvancedPathLib::getURLForDisplay($this->path).'.', 0, $e);
		}
		if (ftp_pasv($ftpResource, true) === false) {
			//passive mode failed... and so?
		}
		self::registerConnection($ftpResource, $urlParts['host'], $urlParts['port'], $urlParts['user'], $urlParts['pass']);
		return $ftpResource;
	}
	
	/**
	 * @return mixed The content of the file or FALSE if an error occured
	 */
	public function getContents() {
		$this->destroyConnection();
		return parent::getContents();
	}
	
	/**
	 * @return string The group's name of the file
	 */
	public function getGroup() {
		if ($this->statsCache['group'] === null) {
			$this->fetchStats();
		}
		return $this->statsCache['group'];
	}
	
	/**
	 * @return IFile The target file pointed by the link, or FALSE if an error occured
	 */
	public function getLinkTarget() {
		if ($this->isLink()) {
			if ($this->statsCache['linkTarget'] === null) {
				$this->fetchStats();
			}
			if ($this->statsCache['linkTarget'] !== null) {
				$thisClass = get_class($this);
				return new $thisClass($this->statsCache['linkTarget']);
			}
		}
		throw new EyeUnsupportedOperationException(AdvancedPathLib::getURLForDisplay($this->path).' is not a link.');
	}
	
	/**
	 * @return string The owner's name of the file
	 */
	public function getOwner() {
		if ($this->statsCache['owner'] === null) {
			$this->fetchStats();
		}
		return $this->statsCache['owner'];
	}
	
	/**
	 * @return string
	 */
	public function getPathFromRoot() {
		$urlParts = $this->getURLComponents();
		return AdvancedPathLib::realpath($urlParts['path'], false);
	}
	
	/**
	 * @param bool $octal TRUE to return permissions in octal form (755),
	 *                       FALSE to return them in Unix form (rwxr-xr-x)
	 * @return mixed The permissions of the file or FALSE if the file doesn't exist
	 */
	public function getPermissions($octal = true) {
		if ($this->statsCache['permissions'] === null) {
			$this->fetchStats();
		}
		if (!$octal) {
			return $this->statsCache['permissions'];
		}
		else {
			return AdvancedPathLib::permsToOctal($this->statsCache['permissions']);
		}
	}
	
	/**
	 * @params bool $recursive Fetch size recursiverly in subfolders if TRUE
	 *                 (Warning: can be _very_ slow to perform, specially on remote filesystems)
	 * @return int The size of the file, in bytes (B)
	 *             Note: If the file doesn't exist, or if an error occurs, the function will return 0
	 */
	public function getSize($recursive = false) {
		if ($this->statsCache['size'] === null || $recursive) {
			//file
			if ($this->isFile() || $this->isLink()) {
				$urlParts = $this->getURLComponents();
				$res = $this->getConnection();
				$size = ftp_size($res, $urlParts['path']);
				$this->statsCache['size'] = ($size == -1) ? 0 : $size;
			}
			//directory
			elseif($this->isDirectory()) {
				$totalSize = 0;
				foreach($this->listFiles() as $file) {
					if ($file->isFile() || $file->isLink()) {
						$totalSize += $file->getSize();
					}
					elseif ($recursive === true) {
						$totalSize += $file->getSize(true);
					}
				}
				$this->statsCache['size'] = $totalSize;
			}
			else {
				$this->statsCache['size'] = 0;
			}
		}
		return $this->statsCache['size'];
	}
	
	/**
	 * @return int The umask to apply when creating new files/link/folders
	 */
	public function getUMask() {
		throw new EyeUnsupportedOperationException(__METHOD__);
	}
	
	/**
	 * @param string $host
	 * @param int $port
	 * @param string $user
	 * @param string $pass
	 * @return mixed Connection resource or FALSE
	 */
	protected static function isConnectionRegistered($host, $port = self::DEFAULT_PORT, $user = self::ANONYMOUS_USERNAME, $pass = self::ANONYMOUS_PASSWORD) {
		$port = intval($port) ? $port : self::DEFAULT_PORT;
		$hostIp = gethostbyname($host);
		if (isset(self::$connectedHosts[$user.':'.$pass.'@'.$hostIp.':'.$port])) {
			return self::$connectedHosts[$user.':'.$pass.'@'.$hostIp.':'.$port];
		}
		return false;
	}
		
	/**
	 * @return bool TRUE if the file is a directory, FALSE otherwise
	 */
	public function isDirectory() {
		if ($this->statsCache['isDirectory'] === null) {
			$this->fetchStats();
		}
		return $this->statsCache['isDirectory'];
	}
	
	/**
	 * @return bool TRUE if the file is a normal file, FALSE otherwise
	 */
	public function isFile() {
		if ($this->statsCache['isFile'] === null) {
			$this->fetchStats();
		}
		return $this->statsCache['isFile'];
	}
	
	/**
	 * Note: This operation is not available for FTP files, so the returned value is always FALSE. 
	 * @return bool TRUE if the file can be executed, FALSE otherwise
	 */
	public function isExecutable() {
		return false;
	}
	
	/**
	 * @return bool TRUE if the file is a link, FALSE otherwise
	 */
	public function isLink() {
		if ($this->statsCache['isLink'] === null) {
			$this->fetchStats();
		}
		return $this->statsCache['isLink'];
	}
	
	/**
	 * Note: This operation is not available for FTP files, so the returned value is always TRUE. 
	 * @return bool TRUE if the file can be read, FALSE otherwise
	 */
	public function isReadable() {
		return true;	//TODO: do it better?
	}
	
	/**
	 * Note: This operation is not available for FTP files, so the returned value is always TRUE. 
	 * @return bool TRUE if the file can be written, FALSE otherwise
	 */
	public function isWritable() {
		return true;	//TODO: do it better?
	}
	
	/**
	 * @param string $pattern Filter pattern (same as *NIX shell)
	 * @param int $flags GLOB_NORMAL | GLOB_ONLY_DIR | GLOB_DIR_IGNORE_PATTERN
	 *                       | GLOB_DIR_FIRST | GLOB_FORCE_SCANDIR | GLOB_CASEINSENSITIVE
	 * 					(@see class AdvancedPathLib)
	 * @return array(IFile) The list of the files contained in the "file" itself if $this
	 * is a directory, or the files contained in the parent directory if $this is a
	 * normal file
	 */
	public function listFiles($pattern = '*', $flags = AdvancedPathLib::GLOB_NORMAL) {
		if (is_array($pattern)) {
			Logger::getLogger('system.services.FileSystem.FTPFile')->warn('FTPFile::listFiles() does not handle array as $pattern yet, using "*" instead.');
			//FIXME --NOT IMPLEMENTED--
			$pattern = '*';
		}
		if ($this->isDirectory()) {
			$dir = $this;
		}
		else {
			$dir = $this->getParentFile();
		}
		if (($flags & AdvancedPathLib::GLOB_CASEINSENSITIVE)) {
			$pattern = mb_sql_regcase($pattern);
		}
		
		$res = $this->getConnection();
		
		try {
			//first let's try with -A option (LIST "ALL"), but some servers may fail
			$rawList = @ftp_rawlist($res, '-a '.$dir->getPathFromRoot());		
			if ($rawList === false) {
				//then let's try with the classical LIST command alone
				$rawList = @ftp_rawlist($res, $dir->getPathFromRoot());		
				if ($rawList === false) {
					throw new EyeIOException('Unable to list files in directory '.AdvancedPathLib::getURLForDisplay($this->path).'.');
				}
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to list files in directory '.AdvancedPathLib::getURLForDisplay($this->path).'.', 0, $e);
		}
		$parsedList = self::parseRawList($rawList, false);
		
		$filesObjects = array();
		foreach($parsedList as $fileInfo) {
			if (($flags & AdvancedPathLib::GLOB_ONLY_DIR) && $fileInfo['type'] != 'd') {
				continue;
			}
			if (AdvancedPathLib::fnmatch($pattern, $fileInfo['name']) !== false
				|| (($flags & AdvancedPathLib::GLOB_DIR_IGNORE_PATTERN) && $fileInfo['type'] == 'd')) {
				$linkTarget = false;
				if ($fileInfo['type'] == 'l') {
					$parsedLinkName = self::parseLinkName($this, $fileInfo['name']);
					if (is_array($parsedLinkName)) {
						$fileInfo['name'] = $parsedLinkName[0];
						$linkTarget = $parsedLinkName[1];
					}
				}

				$fileParams = array(
					'isDirectory' => ($fileInfo['type'] == 'd' ? true : false),
					'isFile' => ($fileInfo['type'] == 'd' || $fileInfo['type'] == 'l' ? false : true),
					'isLink' => ($fileInfo['type'] == 'l' ? true : false),
					'permissions' => $fileInfo['type'].$fileInfo['perms'],
					'size' => $fileInfo['size'],
					'linkTarget' => $linkTarget
				);
				
				$newFileUrlParts = $dir->getURLComponents();
				$newFileUrlParts['path'] = AdvancedPathLib::unifyPath($newFileUrlParts['path'].'/'.$fileInfo['name']);
				
				$thisClass = get_class($this);
				$newFile = new $thisClass(AdvancedPathLib::buildURL($newFileUrlParts), $fileParams);
				$filesObjects[] = $newFile;
			}
		}
		if ($flags & AdvancedPathLib::GLOB_DIR_FIRST) {
			$filesObjectsOrdered = array();
			//looking for directories
			foreach($filesObjects as $i => $fileObject) {
				if ($fileObject->isDirectory()) {
					$filesObjectsOrdered[] = $fileObject;
				}
			}
			//looking for files and links
			foreach($filesObjects as $i => $fileObject) {
				if ($fileObject->isFile() || $fileObject->isLink()) {
					$filesObjectsOrdered[] = $fileObject;
				}
			}
			$filesObjects = $filesObjectsOrdered;
		}
		return $filesObjects;
	}
	
	/**
	 * @return bool TRUE if the directory has been successfully created, FALSE otherwise
	 */
	public function mkdir($mode = null) {
		if (!$this->getParentFile()->exists()) {
			throw new EyeIOException('Unable to create directory '.AdvancedPathLib::getURLForDisplay($this->path).': parent folder does not exist.');
		}
		return $this->mkdirs($mode);
	}
	
	/**
	 * @param int $mode The mode. Default is 0777 - umask.
	 * @return bool TRUE if the directory and all the needed parent ones have been
	 * successfully created, FALSE otherwise
	 * 
	 * Note: Some FTP servers seem to automatically create directories recursively while some
	 *       others don't, so the recursive process has to be forced in the following code.
	 */
	public function mkdirs($mode = null) {
		$parentFile = $this->getParentFile();
		if (!$parentFile->exists()) {
			if (!$parentFile->mkdirs($mode)) {
				throw new EyeIOException('Unable to create directory '.AdvancedPathLib::getURLForDisplay($parentFile->path).'.');
			}
		}
		$pathFromRoot = $this->getPathFromRoot();
		$res = $this->getConnection();
		try {
			if (ftp_mkdir($res, $pathFromRoot)) {
				$this->statsCache['isDirectory'] = true;
				$this->statsCache['isFile'] = false;
				$this->statsCache['isLink'] = false;
				
				$modeOk = false;
				if ($mode !== null) {
					$newPerms = ftp_chmod($res, $mode, $pathFromRoot);
					if ($newPerms) {
						$newPerms |= 0x4000;	//directory bit value
						$this->statsCache['permissions'] = AdvancedPathLib::permsToUnix($newPerms);
						$modeOk = true;
					}
				}
				if (!$modeOk) {
					$this->fetchStats();
				}
				return true;
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to create directory '.AdvancedPathLib::getURLForDisplay($this->path).'.', 0, $e);
		}
		throw new EyeIOException('Unable to create directory '.AdvancedPathLib::getURLForDisplay($this->path).'.');
	}
	
	/**
	 *
	 * @param FTPFile $baseFile A file of the same server/connection
	 * @param string $linkName The name of the link ("myLink -> /my/path/to/target")
	 * @return array(0 => link_name, 1 => full_path_of_target)
	 */
	protected static function parseLinkName(FTPFile $baseFile, $linkName) {
		if (preg_match('/^(.+) -> (.+)$/', $linkName, $matches)) {
			$urlParts = $baseFile->getURLComponents();
			$urlParts['path'] = $matches[2];
			return array(
				$matches[1],
				AdvancedPathLib::buildURL($urlParts, AdvancedPathLib::OS_UNIX)
			);
		}
		return false;
	}
	
	/**
	 * Parses strings returned by the ftp_rawlist() function and put each file's information in
	 * a dedicated named cell in a PHP array for better future process.
	 * 
	 * -- Source: php.net / Google :)
	 * -- Adaptation: Nanawel (nanawel -at- eyeos.org)
	 * 
	 * @param array $array The array to parse
	 * @param bool $sort TRUE to force sorting the output array (folders then files, alphabetical order)
	 * @return array An array in the form of (filename => array(fileInformations))
	 */
	protected static function parseRawList($array, $sort = true) {
		$filesData = array();		
		foreach ($array as $currentFile) {
			$matches = array();
			//            type   permissions   number     owner            group          size      month            day                     year/time       name
			preg_match("/([-dl])([rwxst-]+).* ([0-9])+ ([a-zA-Z0-9]+).* ([a-zA-Z0-9]+).* ([0-9]*) ([a-zA-Z]{3}).? ([0-9]{1,2}) ([0-9]{2}:[0-9]{2}| [0-9]{4}) (.+)/",$currentFile,$matches);
			
			$fileInfo = array(
				'name' => $matches[10],
				'type' => $matches[1],
				'perms' => $matches[2],
				'number' => $matches[3],
				'owner' => $matches[4],
				'group' => $matches[5],
				'size' => $matches[6],
				'month' => $matches[7],
				'day' => $matches[8],
				'year-time' => $matches[9],
			);	
			
			if ($fileInfo['name'] != '.' && $fileInfo['name'] != '..' && $fileInfo['name'] != '') {
				$filesData[] = $fileInfo;
			}
		}
		
		//sort data (folders, then files)
		if ($sort) {
			usort($filesData, 'FTPFile::compareFilesData');
		}
		return $filesData;
	}
	
	/**
	 * @return int The number of bytes written to the file.
	 * @param mixed $data THe data to be written to the file.
	 * @param int $flags FILE_APPEND | LOCK_EX (FILE_TEXT | FILE_BINARY only for PHP 6)
	 * @throws EyeBadMethodCallException
	 * @throws EyeIOException
	 */
	public function putContents($data, $flags = 0) {
		if (!is_integer($flags)) {
			throw new EyeInvalidArgumentException('Expecting an integer value for $flags. Given: "' . $flags . '" (' . gettype($flags) . ').');
		}
		$opts = array('ftp' => array('overwrite' => true));
		$context = stream_context_create($opts);
		try {
			$this->destroyConnection();
			$bytesAdded = file_put_contents($this->path, $data, $flags, $context);
		} catch (Exception $e) {
			throw new EyeIOException('Error occured during data transfer to file '.AdvancedPathLib::getURLForDisplay($this->path).'.', 0, $e);
		} catch (ErrorException $e) {
			throw new EyeIOException('Error occured during data transfer to file '.AdvancedPathLib::getURLForDisplay($this->path).'.', 0, $e);
		}
		if ($bytesAdded === false) {
			throw new EyeIOException('Unable to write data to file '.AdvancedPathLib::getURLForDisplay($this->path).'.');
		}
		if ($flags & FILE_APPEND) {
			$this->statsCache['size'] += $bytesAdded;
		} else {
			$this->statsCache['size'] = $bytesAdded;
		}
		$this->statsCache['isDirectory'] = false;
		return $bytesAdded;
	}
	
	/**
	 * @param mixed $resource Connection resource to register or FALSE to unregister
	 * @param string $host Hostname or IP adress
	 * @param int $port Port (default: 21)
	 * @param string $user
	 * @param string $pass
	 * @return bool
	 */
	protected static function registerConnection($resource, $host, $port = self::DEFAULT_PORT, $user = self::ANONYMOUS_USERNAME, $pass = self::ANONYMOUS_PASSWORD) {
		$port = intval($port) ? $port : 21;
		$hostIp = gethostbyname($host);
		if (isset(self::$connectedHosts[$user.':'.$pass.'@'.$hostIp.':'.$port])) {
			if ($resource) {
				return true;
			} else {
				unset(self::$connectedHosts[$user.':'.$pass.'@'.$hostIp.':'.$port]);
				return true;
			}
		}
		if ($resource) {
			self::$connectedHosts[$user.':'.$pass.'@'.$hostIp.':'.$port] = $resource;
			return true;
		}
		throw new EyeException('Unable to register connection host='.$host.' port='.$port.' user='.$user.' password=**HIDDEN**');
	}
}
?>