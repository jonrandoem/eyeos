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
class DefaultEyeosUserPDOMetaHandler implements ISearchableMetaDataHandler {
	protected static $Instance;
	private $provider = null;


	protected function __construct() {
		if($this->provider === null) {
			$this->provider = new DAOMetaProvider(null, array(
								DAOMetaProvider::PARAM_TABLENAME => 'eyeosmetadata'
							));
		}
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new DefaultEyeosUserPDOMetaHandler();
		}

		return self::$Instance;
	}

	/**
	 * @param mixed $object
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 * @throws EyeErrorException
	 */

	// to be completed...
	public function deleteMeta($object, $metaDataClass) {
		try {
			if (!$object instanceof EyeosUser) {
				throw new EyeInvalidArgumentException('$object must be an EyeosUser.');
			}

			$this->provider->setMetaDataClass($metaDataClass);
			$this->provider->deleteMeta($object->getId());
		} catch (EyeDBException $e) {
			throw new EyeMetaDataException('An error occured while deleting metadatas for the $object.', 0, $e);
		}
	}

	/**
	 * @param mixed $object
	 * @param String $metaDataClass
	 * @return IMetaData
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function retrieveMeta($object, $metaDataClass) {
		try {
			if (!$object instanceof EyeosUser) {
				throw new EyeInvalidArgumentException('$object must be an EyeosUser.');
			}

			$this->provider->setMetaDataClass($metaDataClass);
			$meta = $this->provider->retrieveMeta($object->getId());
			return $meta;
		} catch (EyeDBException $e) {
			throw new EyeMetaDataException('An error occured while retrieving metadatas for the $object.', 0, $e);
		}
	}

	/**
	 * @param mixed $object
	 * @param IMetaData $metaData
	 * @param String $metaDataClass
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function storeMeta($object, IMetaData $metaData = null, $metaDataClass) {
		try {
			if (!$object instanceof EyeosUser) {
				throw new EyeInvalidArgumentException('$object must be an EyeosUser.');
			}

			$this->provider->setMetaDataClass($metaDataClass);
			$this->provider->storeMeta($object->getId(), $metaData);
		} catch (EyeDBException $e) {
			throw new EyeMetaDataException('An error occured while storing metadatas for the $object.', 0, $e);
		}
	}

	/**
	 * @param mixed $object
	 * @param mixed $changes
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 */
	public function updateMeta($object, $changes, $params) {
		throw new EyeNotImplementedException(__METHOD__);
	}

	public function searchMeta($object, IMetaData $metaData, $metaDataClass) {
		try {
			if (!$object instanceof EyeObject) {
				throw new EyeInvalidArgumentException('$object must be an EyeObject.');
			}

			$this->provider->setMetaDataClass($metaDataClass);

			if($this->provider instanceof ISearchableMetaDataProvider) {
				return $this->provider->searchMeta($object->getId(), $metaData);
			} else {
				throw new EyeUnsupportedOperationException(__METHOD__);
			}
		} catch (EyeDBException $e) {
			throw new EyeMetaDataException('An error occured while searching metadatas for the $object.', 0, $e);
		}
	}
}
?>
