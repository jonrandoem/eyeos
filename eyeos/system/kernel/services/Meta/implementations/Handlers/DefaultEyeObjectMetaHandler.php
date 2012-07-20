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
class DefaultEyeObjectMetaHandler implements ISearchableMetaDataHandler {
	const METADATA_TABLE_NAME = 'eyeosmetadata';

	protected static $Instance;
	protected static $Provider; // to be completed...

	protected function __construct() {

	}

	public static function getInstance() {
		if (self::$Instance === null) {
			$class = __CLASS__;
			self::$Instance = new $class();
		}
		return self::$Instance;
	}

	public static function getProvider($metaDataClass) {
		if(self::$Provider === null) {
			self::$Provider = new DAOMetaProvider((string) $metaDataClass, array(
							DAOMetaProvider::PARAM_TABLENAME => self::METADATA_TABLE_NAME
			));
		}

		self::$Provider->setMetaDataClass((string) $metaDataClass);
		return self::$Provider;
	}

	/**
	 * @param mixed $object
	 * @param String $metaDataClass
	 * @return boolean
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function deleteMeta($object, $metaDataClass) {
		if (!$object instanceof EyeObject) {
			throw new EyeInvalidArgumentException('$object must be an EyeObject.');
		}

		$provider = $this->getProvider($metaDataClass);
		$provider->deleteMeta($object->getId());
	}

	/**
	 * @param mixed $object
	 * @param String $metaDataClass
	 * @return IMetaData
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function retrieveMeta($object, $metaDataClass) {
		if (!$object instanceof EyeObject) {
			throw new EyeInvalidArgumentException('$object must be an EyeObject.');
		}

		$provider = $this->getProvider($metaDataClass);
		return $provider->retrieveMeta($object->getId());
	}

	/**
	 * @param mixed $object
	 * @param IMetaData $metaData
	 * @param String $metaDataClass
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function storeMeta($object, IMetaData $metaData, $metaDataClass) {
		if (!$object instanceof EyeObject) {
			throw new EyeInvalidArgumentException('$object must be an EyeObject.');
		}

		$provider = $this->getProvider($metaDataClass);
		$provider->storeMeta($object->getId(), $metaData);
	}

	/**
	 * @param mixed $object
	 * @param mixed $changes
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 */
	public function updateMeta($object, $changes, $metaDataClass) {
		throw new EyeUnsupportedOperationException(__METHOD__);
	}

	public function searchMeta($object, IMetaData $metaData, $metaDataClass) {
		if (!$object instanceof EyeObject) {
			throw new EyeInvalidArgumentException('$object must be an EyeObject.');
		}

		$provider = $this->getProvider($metaDataClass);
		if($provider instanceof ISearchableMetaDataProvider) {
			return $provider->searchMeta($object->getId(), $metaData);
		} else {
			throw new EyeUnsupportedOperationException(__METHOD__);
		}
		
	}
}

?>
