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
 * @package kernel-services
 * @subpackage Meta
 */

// dirty hack
require_once(SERVICE_UM_PATH . '/interface.php');
require_once(SERVICE_UM_PATH . '/implementations/UMManager.php');


class MetaManager extends Kernel implements IMetaDataManager {
	const OBJECT = 0;
	const METADATACLASS = 1;
	const DEFAULT_METADATA_CLASS = 'BasicMetaData';

	/**
	 * @var array(string => SimpleXMLElement)
	 */
	private static $ConfigurationFiles = array();
	private static $Logger = null;

	/**
	 * @var array(className => array(IMetaDataHandler, array parameters))
	 */
	private static $MetaHandlerInfos = array();

	private static $Instance = null;
	private static $MetaDataConverter = null;


	protected function __construct() {
		$this->loadProviders();
		$this->MetaDataConverter = MetaDataConverter::getInstance();
		self::$Logger = Logger::getLogger('meta.MetaManager');
		UMManager::getInstance()->addUMListener(MetaManagerUMListener::getInstance());
		self::$Logger->debug("Registered MetaManagerUMListener to UMManager");
	}

	/**
	 * Reads the XML file with specified name $filename and located in the directory
	 * SERVICE_META_CONFIGURATION_PATH and keeps the result in an internal cache to
	 * speed up next request for the same file.
	 *
	 * @param string $filename
	 * @return SimpleXMLElement
	 * @throws EyeFileNotFoundException
	 * @throws EyeIOException
	 */
	public static function getConfiguration($filename) {
		if (!is_string($filename)) {
			throw new EyeInvalidArgumentException($filename . ' is not a valid filename.');
		}

		$filename .= SERVICE_META_CONFIGURATION_FILE_EXTENSION;

		if (!isset(self::$ConfigurationFiles[$filename])) {
			if (!is_file(SERVICE_META_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeFileNotFoundException($filename . ' does not exist.');
			}

			if (!$xmlObject = simplexml_load_file(SERVICE_META_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeIOException('Unable to load configuration file ' . $filename);
			}
			self::$ConfigurationFiles[$filename] = $xmlObject;
		}

		return self::$ConfigurationFiles[$filename];
	}
	/**
	 * Returns an array containing the instance of the handler and its configuration for
	 * the specified $object.
	 *
	 * @param object $object
	 * @return array(
	 * 		self::OBJECT => IMetaDataHandler,
	 * 		self::METADATACLASS => SimpleXMLElement
	 * )
	 */
	private function getHandlerInfo($object) {
		$xml = self::getConfiguration(__CLASS__);
		foreach($xml->handlers->children() as $node) {
			$handlerObjectClass = (string) $node['objectClass'];
			if ($object instanceof $handlerObjectClass) {
				$handlerClass = (string) $node['handlerClass'];
				if (!isset(self::$MetaHandlerInfos[$handlerClass])) {
					try {
						self::loadHandler($handlerClass, $node);
					} catch(EyeErrorException $e) {
						throw new EyeException('Unable to create instance of the MetaDataManager class ' . $handlerClass, 0, $e);
					}
				}
				return self::$MetaHandlerInfos[$handlerClass];
			}
		}
	}

	private static function loadHandler($handlerClass, $node) {
		require_once SERVICE_META_HANDLERS_PATH . '/' . $handlerClass . '.php';

		if (!class_exists($handlerClass)) {
			throw new EyeClassNotFoundException($handlerClass);
		}

		$handlerObj = call_user_func(array($handlerClass, 'getInstance'));
		if ($handlerObj === false) {
			throw new EyeBadMethodCallException('Unable to create instance of class ' . $handlerClass);
		}

		if (!isset($node['metaDataClass'])) {
			$node->addAttribute('metaDataClass', self::DEFAULT_METADATA_CLASS);
		}

		self::$MetaHandlerInfos[$handlerClass] = array(
				self::OBJECT => $handlerObj,
				self::METADATACLASS => $node['metaDataClass']
		);
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new MetaManager();
		}
		return self::$Instance;
	}

	/**
	 * Returns an instance of the metadata to use with the specified object,
	 * optionnally initializing it from specified $metaData, or empty if none given.
	 *
	 * @param mixed $object
	 * @param IMetaData The metadata to create a copy from
	 * @return IMetaData
	 * @throws EyeException
	 */
	public function getNewMetaDataInstance($object, IMetaData $metaData = null) {
		$handlerInfo = $this->getHandlerInfo($object);
		$metaDataClass = (string) $handlerInfo[self::METADATACLASS];
		return new $metaDataClass($metaData);
	}

	protected static function loadProviders() {
		$dir = new DirectoryIterator(SERVICE_META_PROVIDERS_PATH);
		foreach($dir as $file) {
			if ($file->isFile()) {
				require_once SERVICE_META_PROVIDERS_PATH . '/' . $file->getFilename();
			}
		}
	}

	/**
	 * Copies metadata from $objectFrom to $objectTo.
	 *
	 * @param mixed $objectFrom
	 * @param mixed $objectTo
	 * @return boolean
	 * @throws EyeException
	 */
	public function copyMeta($objectFrom, $objectTo) {
		//$Logger = Logger::getLogger('metaManager.copyMeta');
		self::$Logger->debug("copyMeta from " . get_class($objectFrom) . " => " . get_class($objectTo));

		// ask to MetaDataConverte to return the new metadata
		$newMetadata = MetaDataConverter::getInstance()->convertThis($objectFrom, $objectTo);
		if ($newMetadata === null) {
			throw new EyeMetaDataNotFoundException('Unable to retrieve metadata for ' . get_class($objectFrom));
		}
		self::$Logger->debug("MetaDataConverter returns:");
		self::$Logger->debug($newMetadata);

		//self::storeMeta($objectTo, $newMetadata);
		//$handlerTo = $this->getHandlerInfo($objectTo);

		//$handlerTo[self::OBJECT]->storeMeta($objectTo, $newMetadata, $handlerTo[self::METADATACLASS]);
		try {
			$handlerFrom = $this->getHandlerInfo($objectFrom);
			$meta = $handlerFrom[self::OBJECT]->retrieveMeta($objectFrom, $handlerFrom[self::METADATACLASS]);

			if ($meta === null) {
				throw new EyeMetaDataNotFoundException('Unable to retrieve metadata for ' . get_class($objectFrom));
			}

			$handlerTo = $this->getHandlerInfo($objectTo);
			$handlerFrom[self::OBJECT]->storeMeta($objectTo, $newMetadata, $handlerTo[self::METADATACLASS]);
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException('An error occured while coping metadatas from the $objectFrom to the $objectTo.', 0, $e);
		}
	}

	/**
	 * Deletes metadata associated to specified $object.
	 *
	 * @param mixed $object
	 * @return boolean
	 * @throws EyeException
	 */
	public function deleteMeta($object) {
		try {
			$handlerInfo = $this->getHandlerInfo($object);
			$handlerInfo[self::OBJECT]->deleteMeta($object, $handlerInfo[self::METADATACLASS]);
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException('An error occured while deleting metadatas for $object.', 0, $e);
		}
	}

	/**
	 * Returns the metadata currently associated to specified $object.
	 *
	 * @param mixed $object
	 * @return IMetaData
	 * @throws EyeException
	 */
	public function retrieveMeta($object) {
		try {
			$handlerInfo = $this->getHandlerInfo($object);
			return $handlerInfo[self::OBJECT]->retrieveMeta($object, $handlerInfo[self::METADATACLASS]);
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException('An error occured while retrieving metadatas for $object.', 0, $e);
		}
	}

	/**
	 * Stores specified $metaData by associating it to given $object.
	 *
	 * @param mixed $object
	 * @param IMetaData $metaData
	 * @throws EyeException
	 */
	public function storeMeta($object, IMetaData $metaData = null) {
		try {
			$handlerInfo = $this->getHandlerInfo($object);
			$handlerInfo[self::OBJECT]->storeMeta($object, $metaData, $handlerInfo[self::METADATACLASS]);
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException('An error occured while storing metadatas for $object.', 0, $e);
		}
	}

	/**
	 * Updates the metadata associated to specified $object according to given $changes.
	 * The format and the purpose of the $changes argument depends on the type of the $object.
	 * For more information, please consult the documentation of the corresponding handler.
	 *
	 * @param mixed $object
	 * @param mixed $changes
	 * @return boolean
	 * @throws EyeException
	 */
	public function updateMeta($object, $changes) {
		try {
			$handlerInfo = $this->getHandlerInfo($object);
			return $handlerInfo[self::OBJECT]->updateMeta($object, $changes, $handlerInfo[self::METADATACLASS]);
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException('An error occured while updating metadatas for $object.', 0, $e);
		} catch (EyeNotImplementedException $e) {
			throw $e;
		}
	}

	public function searchMeta($object, IMetaData $metaData) {
		try {
			$handlerInfo = $this->getHandlerInfo($object);

			if($handlerInfo[self::OBJECT] instanceof ISearchableMetaDataHandler) {
				return $handlerInfo[self::OBJECT]->searchMeta($object, $metaData, $handlerInfo[self::METADATACLASS]);
			} else  {
				throw new EyeUnsupportedOperationException(__METHOD__);
			}
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException('An error occured while updating metadatas for $object.', 0, $e);
		}
	}
}

class MetaManagerUMListener extends AbstractUMAdapter {
	private static $Instance = null;
	private static $Logger = null;

	protected function __construct() {}

	public static function getInstance() {
		if ( self::$Instance === null) {
			self::$Instance = new MetaManagerUMListener();
		}
		if ( self::$Logger === null) {
			self::$Logger = Logger::getLogger('meta.MetaManagerUMListener');
		}
		return self::$Instance;
	}
	public function userDeleted(UMEvent $e) {
		self::$Logger->debug("User deleted! " . $e->getSource()->getId());
		//self::$Logger->debug($e);
		$dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
		try {
			$sql = 'DELETE FROM `messages` WHERE `from` = \''. $e->getSource()->getId() .'\'';
			$dao->send($sql);
		}
		catch(Exception $e)
		{
			self::$Logger->debug("Error trying to delete garbage of user in messages (from)");
			self::$Logger->debug($e);
		}

		try {
			$sql = 'DELETE FROM `messages` WHERE `to` = \''. $e->getSource()->getId() .'\'';
			$dao->send($sql);
		}
		catch(Exception $e)
		{
			self::$Logger->debug("Error trying to delete garbage of user in messages (to)");
			self::$Logger->debug($e);
		}

		try {
			$sql = 'DELETE FROM `ShareableVirtualFilesHandler` WHERE `shareableObjectId` = \''. $e->getSource()->getId().'\'';
			$dao->send($sql);
		}
		catch(Exception $e)
		{
			self::$Logger->debug("Error trying to delete garbage of user in ShareableVirtualFilesHandler");
			self::$Logger->debug($e);
		}
	}
}

?>
