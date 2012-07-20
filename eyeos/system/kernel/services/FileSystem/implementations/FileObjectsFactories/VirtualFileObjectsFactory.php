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

define('SERVICE_FILESYSTEM_VIRTUALFILEFACTORY_LOCATORS_DIR', 'VirtualFileObjectsFactory.Locators');
define('SERVICE_FILESYSTEM_VIRTUALFILEFACTORY_LOCATORS_PATH', SERVICE_FILESYSTEM_FILEOBJECTSFACTORIES_PATH.'/'.SERVICE_FILESYSTEM_VIRTUALFILEFACTORY_LOCATORS_DIR);

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class VirtualFileObjectsFactory implements IFileObjectsFactory {
	private static $Instance = null;
	
	protected function __construct() {
		require_once SERVICE_FILESYSTEM_VIRTUALFILEFACTORY_LOCATORS_PATH . '/MountedFileLocator.php';
	}
	
	/**
	 * @param string $path
	 * @return bool
	 */
	public function checkPath($path) {
		$urlParts = AdvancedPathLib::parse_url($path);
		if (in_array(strtolower($urlParts['scheme']), EyeosAbstractVirtualFile::$VirtualFileSchemes)) {
			return true;
		}
		return false;
	}
	
	/**
	 * Returns an IVirtualFile object corresponding to the given virtual $path.
	 * 
	 * @param string $path The path/URL of the file.
	 * @param array $params Optionnal addionnal parameters passed to the file class constructor.
	 * @return IVirtualFile The file object if the FOF was able to create it or null otherwise.
	 * @throws EyeException If an error occured during the creation of the file object.
	 */
	public function getFile($path, $params = null) {
		$urlParts = AdvancedPathLib::parse_url($path, AdvancedPathLib::OS_UNIX);
		try {
			$xmlConf = FSI::getConfiguration($urlParts['scheme'] . '.scheme');
		} catch(EyeFileNotFoundException $e) {
			throw new EyeMissingConfigurationException('Missing handler configuration file for scheme ' . $urlParts['scheme'] . '://.', 0, $e);
		}
		$handlerClassName = (string) $xmlConf->handlerClassName[0];
		if (!class_exists($handlerClassName)) {
			throw new EyeClassNotFoundException('Unable to find ' . $handlerClassName);
		}
		//autocomplete path if possible (home://myFolder => home://~currentuser/myFolder)
		$path = call_user_func_array(
			array($handlerClassName, 'autocompletePath'),
			array($path)
		);
		
		//check for mounted file first
		$realFile = null;
		if ($xmlConf->mountpointsManager->getName() != '') {
			$realFile = MountedFileLocator::getRealFile($path, null, $params);
			if ($realFile !== null) {
				$params['realFile'] = $realFile;
			}
		}
		
		//if no mounted path has been found, get the real file object from its locator
		if ($realFile === null) {
			$locatorClassFilename = (string) $xmlConf->locatorClassName[0];
			if ($locatorClassFilename == '') {
				throw new EyeMissingConfigurationException('No VirtualFileLocator class has been specified in the configuration file.');
			}
			if (!is_file(SERVICE_FILESYSTEM_VIRTUALFILEFACTORY_LOCATORS_PATH . '/' . $locatorClassFilename . '.php')) {
				throw new EyeFileNotFoundException('Unable to find specified VirtualFileLocator class file: ' . $locatorClassFilename . '.php.');
			}
			require_once SERVICE_FILESYSTEM_VIRTUALFILEFACTORY_LOCATORS_PATH . '/' . $locatorClassFilename . '.php';
			if (!class_exists($locatorClassFilename)) {
				throw new EyeClassNotFoundException('Unable to find class ' . $locatorClassFilename);
			}
			$params['realFile'] = call_user_func_array(
				array($locatorClassFilename, 'getRealFile'),
				array($path, $xmlConf->parameters, $params)
			);
		}
		
		return new $handlerClassName(AdvancedPathLib::buildUrl($urlParts), $params);
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$className = __CLASS__;
			self::$Instance = new $className();
		}
		return self::$Instance;
	}
}

interface IVirtualFileLocator {
	
	/**
	 * @param string $path
	 * @param SimpleXMLElement $xmlConf
	 * @return AbstractFile
	 */
	public static function getRealFile($path, $xmlParams = null, $params = null);
	
}

?>
