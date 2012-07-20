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

define('SERVICE_SHARING_CONFIGURATION_FILE_EXTENSION', '.xml');
define('SERVICE_SHARING_SHAREABLEOBJECTSHANDLERS_DIR', 'ShareableObjectsHandlers');
define('SERVICE_SHARING_SHAREABLEOBJECTSHANDLERS_PATH', SERVICE_SHARING_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_SHARING_SHAREABLEOBJECTSHANDLERS_DIR);
define('SERVICE_SHARING_SHARINGMANAGERS_PROVIDERS_DIR', 'ShareInfoProviders');
define('SERVICE_SHARING_SHARINGMANAGERS_PROVIDERS_PATH', SERVICE_SHARING_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_SHARING_SHARINGMANAGERS_PROVIDERS_DIR);
define('SERVICE_SHARING_SHARINGMANAGERS_MANAGERS_DIR', 'SharingManagers');
define('SERVICE_SHARING_SHARINGMANAGERS_MANAGERS_PATH', SERVICE_SHARING_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_SHARING_SHARINGMANAGERS_MANAGERS_DIR);

/**
 * 
 * @package kernel-services
 * @subpackage Sharing
 */
class SharingManager extends Kernel implements ISharingManager {
	const SHAREINFO_KEY_ID = 'id';
	const SHAREINFO_KEY_OWNERID = 'ownerId';
	const SHAREINFO_KEY_SHAREABLEID = 'shareableObjectId';
	const SHAREINFO_KEY_COLLABORATORID = 'collaboratorId';
	const SHAREINFO_KEY_PERMISSIONACTIONS = 'permissionActions';
	const SHAREINFO_KEY_HANDLERCLASSNAME = 'handlerClassName';
	
	/**
	 * @var Logger
	 */
	private static $Logger = null;
	
	/**
	 * @var array(SimpleXMLElement)
	 */
	private static $ConfigurationFiles = array();
	
	/**
	 * @var array(IShareableObjectHandler)
	 */
	private static $ShareableObjectsHandlers = null;
	
	/**
	 * @var bool
	 */
	private static $IsManagerLoaded = false;
	
	/**
	 * @var IShareInfoProvider
	 */
	protected $provider = null;
	
	/**
	 * @var ArrayList(ISharingListener)
	 */
	private $listeners = null;
	
	
	protected function __construct() {
		$this->listeners = new ArrayList();
	}
	
	public function addCollaborator(IShareable $object, AbstractEyeosPrincipal $collaborator, IPermission $permission) {
		try {
			$handler = null;
			$handlerClassName = null;
			$objectData = null;
			foreach(self::getAllShareableObjectsHandlers() as $currentHandler) {
				if ($currentHandler->checkType($object)) {
					$handler = $currentHandler;
					$objectData = array(self::SHAREINFO_KEY_SHAREABLEID => $object->getId());
					$objectData = $handler->getShareableObjectData($object, $objectData);
					$handlerClassName = get_class($handler);
					break;
				}
			}
			if ($handlerClassName === null) {
				throw new EyeHandlerNotFoundException('Unable to find a ShareableObjectHandler for object of class ' . get_class($object) . '.');
			}
			if ($object->getId() === null) {
				throw new EyeNullPointerException('$object ID is null.');
			}
			$owner = $object->getShareOwner();
			
			SecurityManager::getInstance()->checkPermission(
				$object,
				new SharePermission(array('addcollaborator'), $collaborator)
			);
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_OWNERID => $owner->getId(),
				self::SHAREINFO_KEY_SHAREABLEID => $object->getId(),
				self::SHAREINFO_KEY_COLLABORATORID => $collaborator->getId(),
				self::SHAREINFO_KEY_PERMISSIONACTIONS => $permission->getActionsAsString(),
				self::SHAREINFO_KEY_HANDLERCLASSNAME => $handlerClassName
			);
			$this->getProvider()->storeShareInfo($owner, $shareInfoQuery, $objectData);
			$handler->notifySharingStarted($object);
			
			$event = new SharingEvent(new BasicShareInfo(
				$owner,
				$object,
				$collaborator,
				$permission,
				$handlerClassName
			));
			foreach($this->listeners as $listener) {
				$listener->collaboratorAdded($event);
			}
		} catch (Exception $e) {
			self::$Logger->warn('Unable to add collaborator ' . $collaborator->getName() . ' to object of class ' . get_class($object) . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	/**
	 * @param ISharingListener $listener
	 */
	public function addListener(ISharingListener $listener) {
		$this->listeners->append($listener);
	}
	
	private static function getAllShareableObjectsHandlers() {
		if (self::$ShareableObjectsHandlers === null) {
			$directory = new DirectoryIterator(SERVICE_SHARING_SHAREABLEOBJECTSHANDLERS_PATH);
			self::$ShareableObjectsHandlers = array();
			foreach ($directory as $fileInfo) {
	    		if($fileInfo->isFile()) {
	    			$className = $fileInfo->getBasename('.php');
	    			try {
		    			//FIXME: the require_once here was necessary to be able to run the unit tests on Mac platforms => find why!
		    			require_once SERVICE_SHARING_SHAREABLEOBJECTSHANDLERS_PATH . '/' . $fileInfo->getBasename();
		    			$obj = call_user_func(array($className, 'getInstance'));
		    			if ($obj === false) {
		    				throw new EyeBadMethodCallException('Unable to create instance of class ' . $className);
		    			}
	    			} catch(EyeErrorException $e) {
	    				throw new EyeException('Unable to create instance of the ShareableObjectHandler class ' . $className . '.', 0, $e);
	    			}
	    			self::$ShareableObjectsHandlers[$className] = $obj;
	    		}
			}
		}
		return self::$ShareableObjectsHandlers;
	}
	
	/**
	 * @return ArrayList(ISharingListener)
	 */
	public function getAllListeners() {
		return $this->listeners;
	}
	
	public function getAllShareInfo(IShareable $object) {
		// the object has no ID, so no shareinfo attached
		if ($object->getId(false) === null) {
			return array();
		}
		
		try {
			if ($object->getId() === null) {
				throw new EyeNullPointerException('$object ID cannot be null.');
			}
			$owner = $object->getShareOwner();
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_OWNERID => $owner->getId(),
				self::SHAREINFO_KEY_SHAREABLEID => $object->getId()
			);
			
			$shareInfoList = $this->getProvider()->retrieveShareInfo($shareInfoQuery);
			$shareInfoObjectsList = array();
			foreach($shareInfoList as $shareInfo) {
				$shareInfoObjectsList[] = new BasicShareInfo(
					$owner,
					$object,
					UMManager::getInstance()->getPrincipalById($shareInfo[self::SHAREINFO_KEY_COLLABORATORID]),
					new SharePermission($shareInfo[self::SHAREINFO_KEY_PERMISSIONACTIONS]),
					$shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME]
				);
			}
			return $shareInfoObjectsList;
		} catch (Exception $e) {
			self::$Logger->warn('Unable to retrieve all ShareInfo from object of class ' . get_class($object) . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function getAllShareInfoFromOwner(AbstractEyeosUser $owner, $classType = null) {
		try {
			$handlerClassName = null;
			$shareableObjectsHandlers = self::getAllShareableObjectsHandlers();
			if ($classType !== null) {
				foreach($shareableObjectsHandlers as $handler) {
					if (is_object($classType)) {
						$classType = get_class($classType);
					}
					
					if ($handler->checkType($classType)) {
						$handlerClassName = get_class($handler);
						break;
					}
				}
				if ($handlerClassName === null) {
					throw new EyeHandlerNotFoundException('Unable to find a ShareableObjectHandler for ' . $classType . '.');
				}
			}
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_OWNERID => $owner->getId()
			);
			if ($handlerClassName !== null) {
				$shareInfoQuery[self::SHAREINFO_KEY_HANDLERCLASSNAME] = $handlerClassName;
			}
			
			$shareInfoList = $this->getProvider()->retrieveShareInfo($shareInfoQuery);
			$shareInfoObjectsList = array();
			foreach($shareInfoList as $shareInfo) {
				if (!isset($shareableObjectsHandlers[$shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME]])) {
					throw new EyeHandlerNotFoundException('Cannot find handler ' . $shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME] . '.');
				}
				$shareableObjectHandler = $shareableObjectsHandlers[$shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME]];
				$shareableObject = $shareableObjectHandler->createShareableObject($shareInfo);
				$shareInfoObjectsList[] = new BasicShareInfo(
					$owner,
					$shareableObject,
					UMManager::getInstance()->getPrincipalById($shareInfo[self::SHAREINFO_KEY_COLLABORATORID]),
					new SharePermission($shareInfo[self::SHAREINFO_KEY_PERMISSIONACTIONS]),
					$shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME]
				);
			}
			return $shareInfoObjectsList;
		} catch (Exception $e) {
			self::$Logger->warn('Unable to retrieve all ShareInfo from owner ' . $owner->getName() . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function getAllShareInfoFromCollaborator(AbstractEyeosPrincipal $collaborator, AbstractEyeosUser $owner = null, $classType = null) {
		try {
			$handlerClassName = null;
			$shareableObjectsHandlers = self::getAllShareableObjectsHandlers();
			if ($classType !== null) {
				if (is_object($classType)) {
					$classType = get_class($classType);
				}
		
				foreach($shareableObjectsHandlers as $handler) {
					if ($handler->checkType($classType)) {
						$handlerClassName = get_class($handler);
						break;
					}
				}
				if ($handlerClassName === null) {
					throw new EyeHandlerNotFoundException('Unable to find a ShareableObjectHandler for ' . $classType . '.');
				}
			}
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_COLLABORATORID => $collaborator->getId(),
			);
			if ($owner !== null) {
				$shareInfoQuery[self::SHAREINFO_KEY_OWNERID] = $owner->getId();
			}
			if ($handlerClassName !== null) {
				$shareInfoQuery[self::SHAREINFO_KEY_HANDLERCLASSNAME] = $handlerClassName;
			}
			
			$shareInfoList = $this->getProvider()->retrieveShareInfo($shareInfoQuery);
			$shareInfoObjectsList = array();
			foreach($shareInfoList as $shareInfo) {
				if (!isset($shareableObjectsHandlers[$shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME]])) {
					throw new EyeHandlerNotFoundException('Cannot find handler ' . $shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME] . '.');
				}
				$shareableObjectHandler = $shareableObjectsHandlers[$shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME]];
				$shareableObject = $shareableObjectHandler->createShareableObject($shareInfo);
				
				// Retrieve the owner if dynamic (not passed in argument)
				if ($owner === null) {
					$owner = $shareableObject->getShareOwner();
				}
				
				$shareInfoObjectsList[] = new BasicShareInfo(
					$owner,
					$shareableObject,
					$collaborator,
					new SharePermission($shareInfo[self::SHAREINFO_KEY_PERMISSIONACTIONS]),
					$shareInfo[self::SHAREINFO_KEY_HANDLERCLASSNAME]
				);
			}
			return $shareInfoObjectsList;
		} catch (Exception $e) {
			self::$Logger->warn('Unable to retrieve all ShareInfo' . ($owner !== null ? ' from owner ' . $owner->getName() : '')
				. ' with collaborator ' . $collaborator->getName() . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	/**
	 * @param string $filename
	 * @return SimpleXMLElement
	 * @throws EyeFileNotFoundException
	 * @throws EyeIOException
	 */
	public static function getConfiguration($filename) {
		if (!is_string($filename)) {
			throw new EyeInvalidArgumentException($filename . ' is not a valid filename.');
		}
		if (!isset(self::$ConfigurationFiles[$filename])) {
			$filename .= SERVICE_SHARING_CONFIGURATION_FILE_EXTENSION;
			if (!is_file(SERVICE_SHARING_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeFileNotFoundException($filename . ' does not exist.');
			}
			if (!$xmlObject = simplexml_load_file(SERVICE_SHARING_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeIOException('Unable to load configuration file ' . $filename);
			}
			self::$ConfigurationFiles[$filename] = $xmlObject;
		}
		return self::$ConfigurationFiles[$filename];
	}
	
	public static function getInstance() {
		if (!self::$IsManagerLoaded) {
			self::$Logger = Logger::getLogger('system.services.Sharing.SharingManager');
			require SERVICE_SHARING_SHARINGMANAGERS_MANAGERS_PATH . '/' . SERVICE_SHARING_MANAGERCLASSNAME . '.php';
			self::$IsManagerLoaded = true;
		}
		return parent::getInstance(SERVICE_SHARING_MANAGERCLASSNAME);
	}
	
	protected function getProvider() {
		if ($this->provider === null) {
			$xmlConf= null;
			try {
				$xmlConf = self::getConfiguration(get_class($this));
			} catch (EyeException $e) {
				$xmlConf = self::getConfiguration(__CLASS__);
			}
			$providerClassName = (string) $xmlConf->providerClassName[0];
			if ($providerClassName == '') {
				throw new EyeUnexpectedValueException('No ShareInfoProvider class has been specified in the configuration file.');
			}
			if (!is_file(SERVICE_SHARING_SHARINGMANAGERS_PROVIDERS_PATH . '/' . $providerClassName . '.php')) {
				throw new EyeFileNotFoundException('Unable to find specified ShareInfoProvider class file: ' . $providerClassName . '.php.');
			}
			require_once SERVICE_SHARING_SHARINGMANAGERS_PROVIDERS_PATH . '/' . $providerClassName . '.php';
			if (!class_exists($providerClassName)) {
				throw new EyeClassNotFoundException('Unable to find ' . $providerClassName);
			}
			try {
				$this->provider = call_user_func(array($providerClassName, 'getInstance'));
				if ($this->provider === false) {
					throw new EyeBadMethodCallException('Unable to create instance of the ShareInfoProvider class ' . $providerClassName);
				}
			} catch(EyeErrorException $e) {
				throw new EyeSharingException('Unable to create instance of the ShareInfoProvider class ' . $providerClassName, 0, $e);
			}
		}
		return $this->provider;
	}
	
	public function getShareInfo(IShareable $object, AbstractEyeosPrincipal $collaborator) {
		// the object has no ID, so no shareinfo attached
		if ($object->getId(false) === null) {
			return array();
		}
		try {
			if ($object->getId() === null) {
				throw new EyeNullPointerException('$object ID cannot be null.');
			}
			$owner = $object->getShareOwner();
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_OWNERID => $owner->getId(),
				self::SHAREINFO_KEY_SHAREABLEID => $object->getId(),
				self::SHAREINFO_KEY_COLLABORATORID => $collaborator->getId(),
			);
			
			$shareInfoData = current($this->getProvider()->retrieveShareInfo($shareInfoQuery));
			$shareInfo = new BasicShareInfo(
				$owner,
				$object,
				$collaborator,
				new SharePermission($shareInfoData[self::SHAREINFO_KEY_PERMISSIONACTIONS]),
				$shareInfoData[self::SHAREINFO_KEY_HANDLERCLASSNAME]
			);
			return $shareInfo;
		} catch(Exception $e) {
			self::$Logger->warn('Unable to retrieve ShareInfo with object of class ' . get_class($object) . ' and collaborator ' . $collaborator->getName() . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function notifyShareableObjectDeleted(IShareable $object) {
		try {
			if ($object->getId(false) === null) {
				throw new EyeNullPointerException('$object ID cannot be null.');
			}
			$handlerClassName = null;
			$objectData = null;
			foreach(self::getAllShareableObjectsHandlers() as $currentHandler) {
				if ($currentHandler->checkType($object)) {
					$handlerClassName = get_class($currentHandler);
					break;
				}
			}
			$owner = $object->getShareOwner();
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_OWNERID => $owner->getId(),
				self::SHAREINFO_KEY_SHAREABLEID => $object->getId()
			);
			if ($handlerClassName !== null) {
				$shareInfoQuery[self::SHAREINFO_KEY_HANDLERCLASSNAME] = $handlerClassName;
			}
			$this->getProvider()->deleteShareInfo($owner, $shareInfoQuery);
		} catch (Exception $e) {
			self::$Logger->warn('Unable to delete ShareInfo on object ' . $object . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function notifyShareableObjectUpdated(IShareable $object, AbstractEyeosUser $oldOwner = null) {
		try {
			if ($object->getId(false) === null) {
				throw new EyeNullPointerException('$object ID cannot be null.');
			}
			if ($oldOwner === null) {
				$oldOwner = $object->getShareOwner();
			}
			$newOwner = $object->getShareOwner();
			
			$handlerClassName = null;
			$objectData = null;
			foreach(self::getAllShareableObjectsHandlers() as $currentHandler) {
				if ($currentHandler->checkType($object)) {
					$objectData = array(self::SHAREINFO_KEY_SHAREABLEID => $object->getId());
					$objectData = $currentHandler->getShareableObjectData($object, $objectData);
					$handlerClassName = get_class($currentHandler);
					break;
				}
			}
			if ($handlerClassName === null) {
				throw new EyeHandlerNotFoundException('Unable to find a ShareableObjectHandler for object of class ' . get_class($object) . '.');
			}
			
			//owner has changed => update shareInfo data first
			if ($oldOwner->getId() != $newOwner->getId()) {
				//prepare query array
				$shareInfoQuery = array(
					self::SHAREINFO_KEY_OWNERID => $newOwner->getId(),
					self::SHAREINFO_KEY_SHAREABLEID => $object->getId(),
					self::SHAREINFO_KEY_HANDLERCLASSNAME => $handlerClassName
				);
				$this->getProvider()->updateShareInfo($oldOwner, $shareInfoQuery);
			}
			$this->getProvider()->updateShareableObjectsData($newOwner, $objectData);
		} catch (Exception $e) {
			self::$Logger->warn('Unable to update ShareInfo on object ' . $object . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function removeCollaborator(IShareable $object, AbstractEyeosPrincipal $collaborator) {
		try {
			if ($object->getId() === null) {
				throw new EyeNullPointerException('$object ID cannot be null.');
			}
			$handler = null;
			$handlerClassName = null;
			$objectData = null;
			foreach(self::getAllShareableObjectsHandlers() as $currentHandler) {
				if ($currentHandler->checkType($object)) {
					$handler = $currentHandler;
					$handlerClassName = get_class($handler);
					break;
				}
			}
			$owner = $object->getShareOwner();
			
			SecurityManager::getInstance()->checkPermission(
				$object,
				new SharePermission(array('removecollaborator'), $collaborator)
			);
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_OWNERID => $owner->getId(),
				self::SHAREINFO_KEY_SHAREABLEID => $object->getId(),
				self::SHAREINFO_KEY_COLLABORATORID => $collaborator->getId()
			);
			if ($handlerClassName !== null) {
				$shareInfoQuery[self::SHAREINFO_KEY_HANDLERCLASSNAME] = $handlerClassName;
			}
			$noMoreShareInfo = $this->getProvider()->deleteShareInfo($owner, $shareInfoQuery);
			if ($noMoreShareInfo) {
				$handler->notifySharingStopped($object);
			}
			
			$event = new SharingEvent(new BasicShareInfo(
				$owner,
				$object,
				$collaborator,
				new SharePermission(array()),
				$handlerClassName
			));
			foreach($this->listeners as $listener) {
				$listener->collaboratorRemoved($event);
			}
		} catch (Exception $e) {
			self::$Logger->warn('Unable to remove collaborator ' . $collaborator->getName() . ' from object of class ' . get_class($object) . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	/**
	 * @param ISharingListener $listener
	 */
	public function removeListener(ISharingListener $listener) {
		$this->listeners->remove($listener);
	}
	
	public function updateCollaboratorPermission(IShareable $object, AbstractEyeosPrincipal $collaborator, IPermission $permission) {
		try {
			if ($object->getId() === null) {
				throw new EyeNullPointerException('$object ID cannot be null.');
			}
			$handlerClassName = null;
			foreach(self::getAllShareableObjectsHandlers() as $handler) {
				if ($handler->checkType($object)) {
					$handlerClassName = get_class($handler);
					break;
				}
			}
			if ($handlerClassName === null) {
				throw new EyeHandlerNotFoundException('Unable to find a ShareableObjectHandler for object of class ' . get_class($object) . '.');
			}
			$owner = $object->getShareOwner();
			
			SecurityManager::getInstance()->checkPermission(
				$object,
				new SharePermission(array('updatecollaborator'), $collaborator)
			);
			
			//prepare query array
			$shareInfoQuery = array(
				self::SHAREINFO_KEY_OWNERID => $owner->getId(),
				self::SHAREINFO_KEY_SHAREABLEID => $object->getId(),
				self::SHAREINFO_KEY_COLLABORATORID => $collaborator->getId(),
				self::SHAREINFO_KEY_PERMISSIONACTIONS => $permission->getActionsAsString(),
				self::SHAREINFO_KEY_HANDLERCLASSNAME => $handlerClassName
			);
			$this->getProvider()->updateShareInfo($owner, $shareInfoQuery);
			
			// TODO: we could also add the ShareInfo object containing the old permission as a
			// "related source" of the event
			$event = new SharingEvent(new BasicShareInfo(
				$owner,
				$object,
				$collaborator,
				$permission,
				$handlerClassName
			));
			foreach($this->listeners as $listener) {
				$listener->collaboratorPermissionUpdated($event);
			}
		} catch (Exception $e) {
			self::$Logger->warn('Unable to update collaborator ' . $collaborator->getName() . ' permissions for object of class ' . get_class($object) . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
}
?>