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

define('SERVICE_SECURITY_HANDLERS_DIR', 'Handlers');
define('SERVICE_SECURITY_HANDLERS_PATH', SERVICE_SECURITY_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_SECURITY_HANDLERS_DIR);

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
class SecurityManager extends Kernel implements IBasicSecurityManager {
	/**
	 * @var array(SimpleXMLElement)
	 */
	private static $ConfigurationFiles = array();
	
	/**
	 * @var array(string)
	 */
	private static $HandlersLoaded = array();
	
	/**
	 * @var Logger
	 * @access package
	 */
	public static $Logger = null;
	
	
	protected function __construct() {
		self::$Logger = Logger::getLogger('system.services.Security.SecurityManager');
	}
	
	public function checkAccess($object) {
		$this->checkPermission($object, new SimplePermission('', array('access')));
	}
	
	public function checkAdmin($object) {
		$this->checkPermission($object, new SimplePermission('', array('admin')));
	}
	
	public function checkConnect($object) {
		$this->checkPermission($object, new SimplePermission('', array('connect')));
	}
	
	public function checkDelete($object) {
		$this->checkPermission($object, new SimplePermission('', array('delete')));
	}
	
	public function checkExecute($object) {
		$this->checkPermission($object, new SimplePermission('', array('execute')));
	}
	
	public function checkPermission($object, IPermission $perm, LoginContext $context = null) {
		try {
			if ($object === null) {
				throw new EyeNullPointerException('$object cannot be null.');
			}
			if ($perm === null) {
				throw new EyeNullPointerException('$perm cannot be null.');
			}
			if ($context === null) {
				$currentProcess = ProcManager::getInstance()->getCurrentProcess();
				if ($currentProcess === null) {
					self::$Logger->warn('Cannot check permission on object of class ' . get_class($object) . ': No current process.');
					throw new EyeAccessControlException('Access denied: No current process.');
				}
				$context = $currentProcess->getLoginContext();
				if ($context === null) {
					//self::$Logger->warn('Cannot check permission on object of class ' . get_class($object) . ': No LoginContext found in current process.');
					//throw new EyeAccessControlException('Access denied: No LoginContext found in current process.');
					self::$Logger->info('Initializing blank login context for permission check on object of class ' . get_class($object) . '.');
					$context = new LoginContext('eyeos-login', new Subject());
				}
			}
			
			$checker = new SecurityChecker();
			$checker->doCheck($object, $perm, $context);
		} catch (Exception $e) {
			self::$Logger->error('Cannot perform permission check: ' . $e->getMessage());
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function checkRead($object) {
		$this->checkPermission($object, new SimplePermission('', array('read')));
	}
	
	public function checkWrite($object) {
		$this->checkPermission($object, new SimplePermission('', array('write')));
	}
	
	/**
	 * @param string $filename
	 * @return SimpleXMLElement
	 */
	public static function getConfiguration($filename) {
		if (!is_string($filename)) {
			throw new EyeInvalidArgumentException($filename . ' is not a valid filename.');
		}
		if (!isset(self::$ConfigurationFiles[$filename])) {
			$filename .= SERVICE_SECURITY_CONFIGURATION_FILE_EXTENSION;
			if (!is_file(SERVICE_SECURITY_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeFileNotFoundException(SERVICE_SECURITY_CONFIGURATION_PATH . '/' . $filename . ' does not exist.');
			}
			if (!$xmlObject = simplexml_load_file(SERVICE_SECURITY_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeIOException('Unable to load configuration file ' . $filename);
			}
			self::$ConfigurationFiles[$filename] = $xmlObject;
		}
		return self::$ConfigurationFiles[$filename];
	}
	
	public static function getInstance() {
		return parent::getInstance(__CLASS__);
	}
	
	public static function getNewHandlerInstance($handlerClassName, array $handlerParams) {
		if (!in_array($handlerClassName, self::$HandlersLoaded)) {
			if (!is_file(SERVICE_SECURITY_HANDLERS_PATH . '/' . $handlerClassName . '.php')) {
				throw new EyeFileNotFoundException(SERVICE_SECURITY_HANDLERS_PATH . '/' . $handlerClassName . '.php');
			}
			require SERVICE_SECURITY_HANDLERS_PATH . '/' . $handlerClassName . '.php';
			if (!class_exists($handlerClassName)) {
				throw new EyeClassNotFoundException($handlerClassName);
			}
			self::$HandlersLoaded[] = $handlerClassName;
		}
		$obj = new $handlerClassName($handlerParams);
		if (!$obj instanceof ISecurityHandler) {
			throw new EyeUnexpectedValueException('Invalid SecurityHandler: "' . $handlerClassName . '". Must implement ISecurityHandler.');
		}
		return $obj;
	}
	
	public static function init() {
		$dir = new DirectoryIterator(SERVICE_SECURITY_POLICYCONFIGURATIONS_PATH);
		foreach ($dir as $file) {
			if ($file->isFile()) {
				require SERVICE_SECURITY_POLICYCONFIGURATIONS_PATH . '/' . $file;
			}
		}
		PolicyConfiguration::setConfiguration(new XMLPolicyConfiguration(SERVICE_SECURITY_POLICYCONFIGURATIONS_DEFAULTCONF_PATH));
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage Security
 * @access package
 */
final class SecurityChecker {
	/**
	 * @var SecurityException
	 */
	private $firstError = null;
	
	/**
	 * @var SecurityException
	 */
	private $firstRequiredError = null;
	
	/**
	 * @var bool
	 */
	private $success = false;
	
	
	public function __construct() {}
		
	public function doCheck($object, IPermission $perm, LoginContext $context = null) {
		if (SecurityManager::$Logger->isDebugEnabled()) {
			SecurityManager::$Logger->debug('Preparing to check permission with login context:');
			SecurityManager::$Logger->debug(print_r($context, true));
		}
		
		// A little "hack" here to avoid any lock to the root user due to configuration problem
		// in the next steps (= even without any configuration or with a broken configuration file,
		// the root will always have all the permissions on everything)
		$eyeosUser = null;
		try {
			$eyeosUser = $context->getEyeosUser();
			if ($eyeosUser->getName() === 'root') {
				if (SecurityManager::$Logger->isInfoEnabled()) {
					SecurityManager::$Logger->info('Root user found in login context: bypassing any further security check for requested permission ' . $perm . '.');
				}
				return;
			}
		} catch (EyeNullPointerException $e) {}
		
		$configuration = PolicyConfiguration::getConfiguration();
		
		// Browse policy entries until we find one that matches the class of our object
		foreach($configuration->getPolicyEntries() as $policyEntry) {
			$objectClass = $policyEntry->getObjectClass();
			if ($object instanceof $objectClass) {
				
				// Check permission using each handler defined for this entry
				foreach($policyEntry->getHandlerEntries() as $handlerEntry) {
					try {
						$handler = SecurityManager::getNewHandlerInstance($handlerEntry->getHandlerClass(), $handlerEntry->getParams());
						
						try {
							$status = $handler->checkPermission($object, $perm, $context);
							
							// SUCCESS (access granted byt the current handler)
							if ($status === true) {
								if ($handlerEntry->getFlag() == PolicyHandlerEntry::FLAG_SUFFICIENT) {
									if ($this->firstRequiredError === null) {
										return;
									}
								}
								$this->success = true;
							}
							// FAILURE (the current handler cannot check given permission)
							else {
								if (SecurityManager::$Logger->isInfoEnabled()) {
									$failureExceptionMessage = '(none available)';
									if ($handler->getFailureException() !== null) {
										$failureExceptionMessage = $handler->getFailureException()->getMessage();
									}
									SecurityManager::$Logger->debug($handlerEntry->getHandlerClass() . ' failure message: ' . $failureExceptionMessage);
								}
							}
						} catch (EyeSecurityException $e) {
							if ($handlerEntry->getFlag() == PolicyHandlerEntry::FLAG_REQUISITE) {
								if (SecurityManager::$Logger->isInfoEnabled()) {
									SecurityManager::$Logger->info('Requested permission ' . $perm . ' denied object of class ' . get_class($object)
										. ' (REQUISITE handler ' . $handlerEntry->getHandlerClass() . ' failed).');
									SecurityManager::$Logger->info($e->getMessage());
								}
								
								$this->throwException($this->firstRequiredError, $e);
							} else if ($handlerEntry->getFlag() == PolicyHandlerEntry::FLAG_REQUIRED) {
								if ($this->firstRequiredError === null) {
									$this->firstRequiredError = $e;
								}
							} else {
								if ($this->firstError === null) {
									$this->firstError = $e;
								}
							}
						}
					} catch (EyeException $e) {
						$this->throwException(null, $e);
					}
				}
				if ($this->firstRequiredError !== null) {
					// A required handler failed
					if (SecurityManager::$Logger->isInfoEnabled()) {
						SecurityManager::$Logger->info('Requested permission ' . $perm . ' denied on object of class ' . get_class($object) . ' (a REQUIRED handler failed).');
						SecurityManager::$Logger->info($this->firstRequiredError->getMessage());
					}
					$this->throwException($this->firstRequiredError, null);
				} else if (!$this->success && $this->firstError !== null) {
					// No handler succeeded: return the first error
					if (SecurityManager::$Logger->isInfoEnabled()) {
						SecurityManager::$Logger->info('Requested permission ' . $perm . ' denied on object of class ' . get_class($object) . '.');
						SecurityManager::$Logger->info($this->firstError->getMessage());
					}
					$this->throwException($this->firstError, null);
				} else if (!$this->success) {
					// All handlers returned FALSE (= they could not perform permission checks for any reason)
					SecurityManager::$Logger->warn('All SecurityHandlers have been ignored for object of class ' . get_class($object) . '.');
					$this->throwException(new EyeSecurityException('Permission check failure: all handlers ignored on object of class "' . $objectClass . '".'), null);
				} else {
					if (SecurityManager::$Logger->isDebugEnabled()) {
						SecurityManager::$Logger->debug('Permission ' . $perm . ' granted on object of class ' . get_class($object) . '.');
					}
					return;
				}
			}
		}
		// No matching policy entry has been found for given $object: report it in the log and allow access
		if(!$this->success) {
			SecurityManager::$Logger->warn('No matching policy entry for object of class ' . get_class($object) . ' has been found.');
		}
	}
	
	private function throwException($originalError, $error) {
		$e = $originalError === null ? $error : $originalError;
		throw $e;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
abstract class PolicyConfiguration {
	private static $Configuration = null;
	
	/**
	 * @return array(PolicyEntry)
	 */
	public abstract function getPolicyEntries();
	
	public static function getConfiguration() {
		return self::$Configuration;
	}
	
	public abstract function refresh();
	
	public static function setConfiguration(PolicyConfiguration $configuration) {
		self::$Configuration = $configuration;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
class PolicyEntry {
	private $objectClass = null;
	
	private $handlerEntries = array();
	
	public function __construct($objectClass, array $handlerEntries) {
		$this->objectClass = $objectClass;
		$this->handlerEntries = $handlerEntries;
	}
	
	public function getHandlerEntries() {
		return $this->handlerEntries;
	}
	
	public function getObjectClass() {
		return $this->objectClass;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
class PolicyHandlerEntry {
	const FLAG_REQUIRED = 'required';
	const FLAG_REQUISITE = 'requisite';
	const FLAG_SUFFICIENT = 'sufficient';
	const FLAG_OPTIONAL = 'optional';
	
	private $handlerClass = null;
	
	private $flag = null;
	
	private $params = array();
	
	public function __construct($handlerClass, $flag, array $params = null) {
		$this->handlerClass = $handlerClass;
		$this->flag = $flag;
		if (is_array($params)) {
			$this->params = $params;
		}
	}
	
	public function getFlag() {
		return $this->flag;
	}
	
	public function getHandlerClass() {
		return $this->handlerClass;
	}
	
	public function getParams() {
		return $this->params;
	}
}

SecurityManager::init();
?>