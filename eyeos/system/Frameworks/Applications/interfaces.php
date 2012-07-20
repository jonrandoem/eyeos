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
 * 
 * @package kernel-frameworks
 * @subpackage Applications
 */
interface IApplicationsManager extends ISingleton {
	public function getAllApplications();
	public function getAllInstalledApplications();
	public function getAllFavoriteApplications();
	public function getAllNotInstalledApplications();
	public function getAllRecentlyInstalledApplications();
	public function setFavoriteApplication(IApplicationDescriptor $appDesc, $favorite = true);
	public function setInstalledApplication(IApplicationDescriptor $appDesc, $installed = true);
	public function getApplicationsFromCategory($category);
	public function searchApplication($pattern);
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Applications
 */
interface IApplicationDescriptor extends IMetaAssociable {
	public function __construct($name);
	public function getApplicationClassName();
	public function executeJavascript(AppExecutionContext $context, MMapResponse $response);
	public function getJavascriptPath();
	public function getName();
	public function getPath();
	public function getPhpPath();
	public function isJavascriptOnlyApplication();
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Applications
 */
class EyeosApplicationDescriptor implements IApplicationDescriptor, ISimpleMapObject {
	const CLASS_SUFFIX = 'Application';
	
	/**
	 * @var string
	 */
	protected $name;
	
	/**
	 * 
	 * @param string $name The name of the eyeos application this object will describe.
	 */
	public function __construct($name) {
		if (empty($name)) {
			throw new EyeInvalidArgumentException('$name cannot be empty.');
		}
		$this->name = strtolower(basename($name));
		
		if (!$this->isJavascriptOnlyApplication() && !class_exists($this->getApplicationClassName())) {
			require $this->getPhpPath();
		}
	}
	
	private static function checkArgsValidity($args) {
		foreach($args as $key => $value) {
			if (!is_numeric($key)) {
				throw new EyeInvalidArgumentException('Application arguments must be a strict numerically-indexed array! (key "' . $key . '" found)');
			}
		}
	}
	
	public function deleteMeta() {
		MetaManager::getInstance()->deleteMeta($this);
	}
	
	public function getApplicationClassName() {
		return ucfirst($this->getName()) . self::CLASS_SUFFIX;
	}
	
	public function getAttributesMap() {
		$myMeta = $this->getMeta();
		return array(
			'name' => $this->getName(),
			'javascriptOnly' => $this->isJavascriptOnlyApplication() ? 'true' : 'false',
			'meta' => $myMeta ? $myMeta->getAll() : array()
		);
	}
	
	public function executeJavascript(AppExecutionContext $context, MMapResponse $response) {
		if (!is_readable($this->getJavascriptPath())) {
			throw new EyeIOException('Unable to read applications\'s Javascript file at ' . $this->getJavascriptPath());
		}				
		$response->getHeaders()->append('Content-type: text/plain');
		
		// Avoid cache
		$response->getHeaders()->append('Last-Modified: ' . gmdate('D, j M Y H:i:s') . ' GMT');
		$response->getHeaders()->append('Expires: ' . gmdate('D, j M Y H:i:s') . ' GMT');
		$response->getHeaders()->append('Cache-Control: no-store, no-cache, must-revalidate');		// HTTP/1.1
		$response->getHeaders()->append('Pragma: no-cache');										// HTTP/1.0

		
		//IMPORTANT: this was fixed twice. If you don't knwo what you are doing, don't touch anything.
		if($context->getIncludeBody()) {
			$buffer = $this->loadTranslations($context, $response)."\n";
			$response->appendToBody($buffer);
		}
		
		$buffer = "";
		// 2nd step:  call MyApplication::__run()
		if (class_exists($this->getApplicationClassName())) {
			call_user_func(array($this->getApplicationClassName(), '__run'), $context, $response);
		}
		
		$buffer .= "\n";

		// 3rd step: include the main javascript file of the application
		if ($context->getIncludeBody()) {
			$buffer .= file_get_contents($this->getJavascriptPath());
		}

		// 4th and final step: add a call to myapplication_application() to the returned JS buffer
		// that will execute the application code on the client side once loaded
		if ($context->getExecuteJavascript()) {
			// We need to pass an _Array_ (numerically-indexed) as argument, and not a JSON object
			$jsArgs = $context->getArgs()->getArrayCopy();
			self::checkArgsValidity($jsArgs);
			$jsArgs = json_encode(array_values($jsArgs));
			
			// Append 
			$buffer .= "\n" . $this->getName() . '_application('
				. $context->getProcess()->getChecknum() . ', '
				. $context->getProcess()->getPid() . ', '
				. $jsArgs. ');';
		}

		$response->appendToBody($buffer);
	}
	
	public function getJavascriptPath() {
		return $this->getPath() . '/' . $this->getName() . '.js';
	}
	
	public function getMeta() {
		return MetaManager::getInstance()->retrieveMeta($this);
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function getPath() {
		return EYE_ROOT . '/' . APPS_DIR . '/' . $this->name;
	}
	
	public function getPhpPath() {
		return $this->getPath() . '/' . $this->getName() . '.php';
	}
	
	public function isJavascriptOnlyApplication() {
		if(!file_exists($this->getPath()) || !is_readable($this->getPhpPath())) {
			return true;
		} else {
			return false;
		}
	}
	
	private function loadTranslations(AppExecutionContext $context, MMapResponse $response) {
		$buffer = '';
		if($context->getProcess()->getLoginContext() !== null) {
			try {
				// Load the translations only if running as a regular (non-system) user
				$procGroup = $context->getProcess()->getLoginContext()->getEyeosGroup();
				if ($procGroup->getName() != 'sys') {
					$currentUser = $context->getProcess()->getLoginContext()->getEyeosUser();
					$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
					
					if($settings->exists('eyeos.user.language')) {
						$lang = basename($settings->get('eyeos.user.language'));
						if(is_dir($this->getPath() . '/lang/' . $lang . '/')) {
							$directory = new DirectoryIterator($this->getPath() . '/lang/' . $lang . '/');
							
							foreach ($directory as $fileInfo) {
								if ($fileInfo->isFile()) {
									$buffer .= file_get_contents($this->getPath() . '/lang/' . $lang . '/'. $fileInfo->getFilename());
								}
							}
						}
					}
				}
			} catch (EyeNullPointerException $e) {
				// No user in login context: skip translations
			}
		}
		return $buffer;
	}
	
	public function setMeta(IMetaData $metaData = null) {
		MetaManager::getInstance()->storeMeta($this, $metaData);
	}
}

/**
 * Application Descriptor for mobile version of eyeOS
 * 
 * @package kernel-frameworks
 * @subpackage Applications
 */
class EyeMobileApplicationDescriptor extends EyeosApplicationDescriptor {
	/**
	 *
	 * @param string $name The name of the eyeos application this object will describe.
	 */
	public function __construct($name) {
		if (empty($name)) {
			throw new EyeInvalidArgumentException('$name cannot be empty.');
		}
		$this->name = strtolower(basename($name));

		if (!$this->isJavascriptOnlyApplication() && !class_exists($this->getApplicationClassName())) {
			require $this->getPhpPath();
		}
	}

	public function getPath() {
		return parent::getPath() . '/mobile';
	}

	public function getApplicationClassName() {
		return ucfirst($this->getName()) . 'Mobile' . self::CLASS_SUFFIX;
	}
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Applications
 */
class ApplicationMetaData extends BasicMetaData {
	// nothing more here
}
?>