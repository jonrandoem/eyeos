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
 * Specifies a class that is able to manage the association of metadata with objects.
 * 
 * @package kernel-services
 * @subpackage Meta
 */
interface IMetaDataManager {
	/**
	 * Copies metadata from $objectFrom to $objectTo.
	 * 
	 * @param mixed $objectFrom
	 * @param mixed $objectTo
	 * @return boolean
	 * @throws EyeException
	 */
	public function copyMeta($objectFrom, $objectTo);
	
	/**
	 * Deletes metadata associated to specified $object.
	 * 
	 * @param mixed $object
	 * @return boolean
	 */
	public function deleteMeta($object);
	
	/**
	 * Returns an instance of the metadata to use with the specified object,
	 * optionnally initializing it from specified $metaData, or empty if none given. 
	 * 
	 * @param mixed $object
	 * @param IMetaData The metadata to create a copy from
	 * @return IMetaData
	 */
	public function getNewMetaDataInstance($object, IMetaData $metaData = null);
	
	/**
	 * Returns the metadata currently associated to specified $object.
	 * 
	 * @param mixed $object
	 * @return IMetaData
	 */
	public function retrieveMeta($object);
	
	/**
	 * Stores specified $metaData by associating it to given $object.
	 * 
	 * @param mixed $object
	 * @param IMetaData $metaData
	 */
	public function storeMeta($object, IMetaData $metaData = null);
	
	/**
	 * Updates the metadata associated to specified $object according to given $changes.
	 * The format and the purpose of the $changes argument depends on the type of the $object.
	 * For more information, please consult the documentation of the corresponding handler.
	 * 
	 * @param mixed $object
	 * @param mixed $changes
	 * @return boolean
	 */
	public function updateMeta($object, $changes);
}

/**
 * Gives a default implementation for most of the methods from IMetaDataManager.
 * 
 * @package kernel-services
 * @subpackage Meta
 */
abstract class AbstractMetaManager implements IMetaDataManager {
	
	protected function __construct() {}
	
	/**
	 * Copies metadata from $objectFrom to $objectTo.
	 * 
	 * @param mixed $objectFrom
	 * @param mixed $objectTo
	 * @return boolean
	 * @throws EyeException
	 */
	public final function copyMeta($objectFrom, $objectTo) {
		// this method should not be called, only the one in the MetaManager class.
		throw new EyeUnsupportedOperationException();
	}
	
	/**
	 * Deletes metadata associated to specified $object.
	 * 
	 * @param mixed $object
	 * @return boolean
	 * @throws EyeException
	 */
	public function deleteMeta($object) {
		$xmlConf = null;
		$providerClassName = $this->getProviderClassName($object, $xmlConf);
		call_user_func(array($providerClassName, 'getInstance'))->deleteMeta($object, $xmlConf->parameters);
	}
	
	/**
	 * Returns the class name of the provider (usually singleton) used to store and
	 * retrieve metadata with this MetaManager. The implemented method may need to read
	 * the class to use in a XML configuration file.
	 * 
	 * @param mixed $object
	 * @param SimpleXMLElement $xmlConf A reference to the SimpleXmlElement of the configuration.
	 * @return string The name of the provider class
	 */
	protected abstract function getProviderClassName($object, &$xmlConf);
	
	/**
	 * Returns the metadata currently associated to specified $object.
	 * 
	 * @param mixed $object
	 * @return IMetaData
	 * @throws EyeException
	 */
	public function retrieveMeta($object) {
		$xmlConf = null;
		$providerClassName = $this->getProviderClassName($object, $xmlConf);
		return call_user_func(array($providerClassName, 'getInstance'))->retrieveMeta($object, $xmlConf->parameters);
	}
	
	/**
	 * Stores specified $metaData by associating it to given $object.
	 * 
	 * @param mixed $object
	 * @param IMetaData $metaData
	 * @throws EyeException
	 */
	public function storeMeta($object, IMetaData $metaData = null) {
		$xmlConf = null;
		$providerClassName = $this->getProviderClassName($object, $xmlConf);
		call_user_func(array($providerClassName, 'getInstance'))->storeMeta($object, $metaData, $xmlConf->parameters);
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
		$xmlConf = null;
		$providerClassName = $this->getProviderClassName($object, $xmlConf);
		call_user_func(array($providerClassName, 'getInstance'))->updateMeta($object, $changes, $xmlConf->parameters);
	}
}


/**
 * Specifies a class that is able to access and manage metadata of a particular type
 * of object, using a pre-defined provider.
 * A class implementing this interface may know exactly how works the $objects it
 * manipulates, in order to be able to keep synchronization of data, consistency, etc.
 * 
 * @package kernel-services
 * @subpackage Meta
 */
interface IMetaDataHandler {
	/**
	 * Deletes metadata associated to specified $object.
	 * 
	 * @param mixed $object
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function deleteMeta($object, $params);
	
	/**
	 * Returns the instance of this handler.
	 * 
	 * @param mixed $params
	 * @return PermissionProvider
	 */
	public static function getInstance();
	
	/**
	 * Returns the metadata currently associated to specified $object,
	 * using a pre-defined provider.
	 * 
	 * @param mixed $object
	 * @param String $params
	 * @return IMetaData
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function retrieveMeta($object, $params);
	
	/**
	 * Stores specified $metaData by associating it to given $object,
	 * using a pre-defined provider.
	 * 
	 * @param mixed $object
	 * @param IMetaData $metaData
	 * @param String $params
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function storeMeta($object, IMetaData $metaData = null, $params);
	
	/**
	 * Updates the metadata associated to specified $object according to given $changes.
	 * The format and the purpose of the $changes argument depends on the type of the $object.
	 * For more information, please consult the documentation of the corresponding handler.
	 * 
	 * @param mixed $object
	 * @param mixed $changes
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 */
	public function updateMeta($object, $changes, $params);
}

interface ISearchableMetaDataHandler extends IMetaDataHandler {
	public function searchMeta($object, IMetaData $metaData, $metaDataClass);
}

/**
 * 
 * @package kernel-services
 * @subpackage Meta
 */
interface IMetaDataProvider {
	/**
	 * Constructs a new IMetaDataProvider instance using specified $params.
	 * 
	 * @param string $metaDataClass
	 * @param array $params
	 */
	public function __construct($metaDataClass, array $params = null);
	
	/**
	 * TODO
	 * 
	 * @param string $id The identifier used to find the right data to delete.
	 * @param array $params Additional params implementation-dependant.
	 */
	public function deleteMeta($id, $params = null);
	
	/**
	 * TODO
	 * 
	 * @param string $id The identifier used to find the right data to read.
	 * @param array $params Additional params implementation-dependant.
	 * @return IMetaData
	 */
	public function retrieveMeta($id, $params = null);
	
	/**
	 * TODO
	 * 
	 * @param string $id The identifier used to be able to retrieve data to be written afterwards.
	 * @param IMetaData The metadata to be written.
	 * @param array $params Additional params implementation-dependant.
	 */
	public function storeMeta($id, IMetaData $metaData, $params = null);
}

interface ISearchableMetaDataProvider extends IMetaDataProvider {
	public function searchMeta($id, IMetaData $metaData);
}

/**
 * 
 * @package kernel-services
 * @subpackage Meta
 */
class MetaDataPermission extends SimplePermission {
	/**
	 * @var IMetaData
	 */
	private $originalMetaData = null;
	
	public function __construct($actions, $originalMetaData = null, $relatedObject = null) {
		if ($originalMetaData !== null && !$originalMetaData instanceof IMetaData) {
			throw new EyeInvalidClassException('$originalMetaData must be an instance of IMetaData.');
		}
		
		parent::__construct('', $actions, $relatedObject);
		$this->originalMetaData = $originalMetaData;
	}
	
	public function getOriginalMetaData() {
		return $this->originalMetaData;
	}
}

/**
 *
 * @package kernel-services
 * @subpackage MetaDataConverter
 */
interface IMetaDataConverter {
	public function __construct();
}

/**
 *
 * @package kernel-services
 * @subpackage MetaDataConverter
 */
interface IMetaDataConverterHandler {
	public function __construct();
	public static function getInstance();
	public function canConvertThis($fromObject, $toObject);
	public function convertMetaData($fromObject, $toObject);
}
?>
