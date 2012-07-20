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
 * @subpackage Tags
 */
class TagManager implements ITagManager {
	const KEY_TAGID = 'tagid';
	const KEY_PRINCIPALID = 'principalId';
	const KEY_LABEL = 'label';
	const KEY_COLOR = 'color';
	const KEY_TAGGABLEID = 'taggableObjectId';
	const KEY_HANDLERCLASSNAME = 'handlerClassName';
	const KEY_OBJECTDATA = 'objectData';
	
	/**
	 * @var Logger
	 */
	private static $Logger = null;
	
	/**
	 * @var TagManager
	 */
	private static $Instance = null;
	
	/**
	 * @var array(SimpleXMLElement)
	 */
	private static $ConfigurationFiles = array();
	
	/**
	 * @var array(ITaggableObjectHandler)
	 */
	private static $TaggableObjectsHandlers = null;
	
	/**
	 * @var ITagProvider
	 */
	protected $provider = null;
	
	
	protected function __construct() {
		self::$Logger = Logger::getLogger('system.frameworks.Tags.TagManager');
	}
	
	public function addAllTags(ITaggable $object, array $tags) {
		try {
			$handler = null;
			$handlerClassName = null;
			$objectData = null;
			foreach(self::getAllTaggableObjectsHandlers() as $currentHandler) {
				if ($currentHandler->checkType($object)) {
					$handler = $currentHandler;
					$objectData = array(self::KEY_TAGGABLEID => $object->getId());
					$handler->getTaggableObjectData($object, $objectData);
					$handlerClassName = get_class($handler);
					break;
				}
			}
			if ($handlerClassName === null) {
				throw new EyeHandlerNotFoundException('Unable to find a TaggableObjectHandler for object of class ' . get_class($object) . '.');
			}
			if ($object->getId() === null) {
				throw new EyeNullPointerException('$object ID is null.');
			}
			
			SecurityManager::getInstance()->checkPermission(
				$object,
				new SimplePermission(null, array('addtag'))
			);
			
			$this->getProvider()->addAllTags($objectData, $handlerClassName, $tags);
		} catch (Exception $e) {
			self::$Logger->error('Unable to add tag(s) to object of class ' . get_class($object) . '.');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function addTag(ITaggable $object, ITag $tag) {
		$this->addAllTags($object, array($tag));
	}
	
	public function clearTags(IPrincipal $principal, ITaggable $object) {
		$tags = $this->getAllTags($principal, $object);
		$this->removeAllTags($principal, $object, $tags);
	}
	
	public function createTag(IPrincipal $principal, ITag $tag) {
		SecurityManager::getInstance()->checkPermission(
			$tag,
			new SimplePermission(null, array('create'), $principal)
		);
		
		$this->getProvider()->createTag($principal->getId(), $tag);
	}
	
	public function deleteTag(ITag $tag) {
		SecurityManager::getInstance()->checkPermission(
			$tag,
			new SimplePermission(null, array('delete'))
		);
		
		$this->getProvider()->deleteTag($tag);
	}
	
	private static function getAllTaggableObjectsHandlers() {
		if (self::$TaggableObjectsHandlers === null) {
			$directory = new DirectoryIterator(FRAMEWORK_TAGS_HANDLERS_PATH);
			self::$TaggableObjectsHandlers = array();
			foreach ($directory as $fileInfo) {
	    		if($fileInfo->isFile()) {
	    			$className = $fileInfo->getBasename('.php');
	    			try {
		    			//FIXME: the require_once here was necessary to be able to run the unit tests on Mac platforms => find why!
		    			require_once FRAMEWORK_TAGS_HANDLERS_PATH . '/' . $fileInfo->getBasename();
		    			$obj = call_user_func(array($className, 'getInstance'));
		    			if ($obj === false) {
		    				throw new EyeBadMethodCallException('Unable to create instance of class ' . $className);
		    			}
	    			} catch(EyeErrorException $e) {
	    				throw new EyeException('Unable to create instance of the TaggableObjectHandler class ' . $className . '.', 0, $e);
	    			}
	    			self::$TaggableObjectsHandlers[$className] = $obj;
	    		}
			}
		}
		return self::$TaggableObjectsHandlers;
	}
	
	public function getAllTags(IPrincipal $principal, ITaggable $object = null) {
		$tags = null;
		
		// Retrieve ALL TAGS from a PRINCIPAL
		if ($object === null) {
			try {
				$tags = $this->getProvider()->getAllTags($principal->getId());
			} catch (Exception $e) {
				self::$Logger->error('Unable to retrieve tags from object from principal "' . $principal . '": ' . $e->getMessage());
				if (self::$Logger->isDebugEnabled()) {
					self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
				}
				throw $e;
			}
			
			if (count($tags) > 0) {
				SecurityManager::getInstance()->checkPermission(
					$tags[0],
					new SimplePermission(null, array('read'), $principal)
				);
			}
		}
		// Retrieve ALL TAGS associated to a GIVEN OBJECT by a PRINCIPAL
		else {
			try {
				$objectId = $object->getId();
				if ($objectId === null) {
					throw new EyeNullPointerException('$object ID is null.');
				}
				
				SecurityManager::getInstance()->checkPermission(
					$object,
					new SimplePermission(null, array('readtags'))
				);
				
				$tags = $this->getProvider()->getAllTags($principal->getId(), $objectId);
			} catch (Exception $e) {
				self::$Logger->error('Unable to retrieve tags from object of class ' . get_class($object) . ': ' . $e->getMessage());
				if (self::$Logger->isDebugEnabled()) {
					self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
				}
				throw $e;
			}
		}
		return $tags;
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
			$filename .= FRAMEWORK_TAGS_CONFIGURATION_FILE_EXTENSION;
			if (!is_file(FRAMEWORK_TAGS_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeFileNotFoundException($filename . ' does not exist.');
			}
			if (!$xmlObject = simplexml_load_file(FRAMEWORK_TAGS_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeIOException('Unable to load configuration file ' . $filename);
			}
			self::$ConfigurationFiles[$filename] = $xmlObject;
		}
		return self::$ConfigurationFiles[$filename];
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
		}
		return self::$Instance;
	}
	
	protected function getProvider() {
		if ($this->provider === null) {
			$xmlConf = null;
			try {
				$xmlConf = self::getConfiguration(get_class($this));
			} catch (EyeException $e) {
				$xmlConf = self::getConfiguration(__CLASS__);
			}
			$providerClassName = (string) $xmlConf->providerClassName[0];
			if ($providerClassName == '') {
				throw new EyeUnexpectedValueException('No TagProvider class has been specified in the configuration file.');
			}
			if (!is_file(FRAMEWORK_TAGS_PROVIDERS_PATH . '/' . $providerClassName . '.php')) {
				throw new EyeFileNotFoundException('Unable to find specified TagProvider class file: ' . $providerClassName . '.php.');
			}
			require FRAMEWORK_TAGS_PROVIDERS_PATH . '/' . $providerClassName . '.php';
			if (!class_exists($providerClassName)) {
				throw new EyeClassNotFoundException('Unable to find ' . $providerClassName);
			}
			try {
				$this->provider = call_user_func(array($providerClassName, 'getInstance'));
				if ($this->provider === false) {
					throw new EyeBadMethodCallException('Unable to create instance of the TagProvider class ' . $providerClassName);
				}
			} catch(EyeErrorException $e) {
				throw new EyeSharingException('Unable to create instance of the TagProvider class ' . $providerClassName, 0, $e);
			}
		}
		return $this->provider;
	}
	
	public function getTag(IPrincipal $principal, ITag $tag) {
		try {
			$tag = $this->getProvider()->getTag($principal->getId(), $tag);
		} catch (Exception $e) {
			self::$Logger->error('Unable to retrieve tags from object from principal "' . $principal . '": ' . $e->getMessage());
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
		
		SecurityManager::getInstance()->checkPermission(
			$tag,
			new SimplePermission(null, array('read'), $principal)
		);
	}
	
	public function removeAllTags(ITaggable $object, array $tags) {
		try {
			if ($object->getId() === null) {
				throw new EyeNullPointerException('$object ID is null.');
			}
			$objectData = array(self::KEY_TAGGABLEID => $object->getId());
			
			foreach($tags as $tag) {
				SecurityManager::getInstance()->checkPermission(
					$object,
					new SimplePermission(null, array('removetag'), $tag)
				);
			}
			
			$this->getProvider()->removeAllTags($objectData, $tags);
		} catch (Exception $e) {
			self::$Logger->error('Unable to remove tag(s) from object of class ' . get_class($object) . ': ' . $e->getMessage());
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function removeTag(ITaggable $object, ITag $tag) {
		$this->removeAllTags($object, array($tag));
	}
	
	/**
	 * 
	 * @param string $string A string or a tag
	 * @param array(IPrincipal) $principals
	 * @return array(EyeObject)
	 */
	public function search($string, array $principals = null) {
		try {
			if (is_array($principals)) {
				foreach($principals as &$principal) {
					$principal = $principal->getId();
				}
			}
			$results = $this->getProvider()->search((string) $string, $principals);
			
			$taggableObjectsHandlers = self::getAllTaggableObjectsHandlers();
			
			$return = array();
			foreach($results as $result) {
				if (!isset($taggableObjectsHandlers[$result[self::KEY_HANDLERCLASSNAME]])) {
					throw new EyeHandlerNotFoundException('Cannot find handler ' . $result[self::KEY_HANDLERCLASSNAME] . '.');
				}
				$handler = $taggableObjectsHandlers[$result[self::KEY_HANDLERCLASSNAME]];
				
				// Unserialize object data in order to build it up back again (ID + handler-dependant data)
				$objectData = unserialize($result[self::KEY_OBJECTDATA]);
				$objectData[self::KEY_TAGGABLEID] = $result[self::KEY_TAGGABLEID];
				
				$object = $handler->createTaggableObject($objectData);
				$return[] = $object;
			}
			return $return;
		} catch (Exception $e) {
			self::$Logger->error('Unable to search tagged objects from string/tag "' . ((string) $string) . '": ' . $e->getMessage());
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function updateTag(ITag $tag, ITag $newTag) {
		SecurityManager::getInstance()->checkPermission(
			$tag,
			new SimplePermission(null, array('update'))
		);
		
		try {
			$this->getProvider()->updateTag($tag, $newTag);
		} catch (Exception $e) {
			self::$Logger->error('Unable to update tag "' . $tag . '": ' . $e->getMessage());
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
}
?>