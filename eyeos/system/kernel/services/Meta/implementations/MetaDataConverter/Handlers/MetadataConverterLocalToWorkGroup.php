<?php

class MetadataConverterLocalToWorkGroup implements IMetaDataConverterHandler {
	private static $Instance = null;
	private $Logger = null;
	const OBJECT = 0;
	const METADATACLASS = 1;

	public function __construct() {
		$this->Logger = Logger::getLogger('MetaDataConverter.MetadataConverterLocalToWorkGroup');
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new MetadataConverterLocalToWorkGroup();
		}
		return self::$Instance;
	}

	public function canConvertThis($fromObject, $toObject) {
		// EyeLocalFile => EyeWorkgroupFile
		if (('EyeLocalFile' == get_class ($fromObject)) &&
			('EyeWorkgroupFile' == get_class ($toObject)) ) {
				return true;
		}
		// EyeWorkgroupFile => EyeLocalFile
		if (('EyeWorkgroupFile' == get_class ($fromObject)) &&
			('EyeLocalFile' == get_class ($toObject)) ) {
				return true;
		}
		return false;
	}

	private function convertFromFileToWorkGroup($fromObject, $toObject) {
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " working...");
		//@todo this code is under testing
		$this->Logger->debug("WARNING THIS CODE IS UNDER TESTING");
		if (('EyeLocalFile' != get_class ($fromObject)) ||
			('EyeWorkgroupFile' != get_class ($toObject)) ) {
							throw new EyeMetaDataException("This handler can't do conversion from ".get_class($objectFrom)." to ". get_class($objectTo) , 0, null);
		}

		$meta = "";
		try {
			$meta = $fromObject->getMeta();
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException("An error occured while coping metadatas from ".get_class($objectFrom)." to ". get_class($objectTo) , 0, $e);
		}
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " done");
		// cleaning listeners of metadata
		$meta->set('id', null);
		$meta->set('listeners', null);
		return $meta;
	}

	private function convertFromWorkGroupToFile($fromObject, $toObject) {
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " working...");
		//@todo this code is under testing
		$this->Logger->debug("WARNING THIS CODE IS UNDER TESTING");
		if (('EyeWorkgroupFile' != get_class ($fromObject)) ||
			('EyeLocalFile' != get_class ($toObject)) ) {
							throw new EyeMetaDataException("This handler can't do conversion from ".get_class($objectFrom)." to ". get_class($objectTo) , 0, null);
		}

		$meta = "";
		try {
			$meta = $fromObject->getMeta();
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException("An error occured while coping metadatas from ".get_class($objectFrom)." to ". get_class($objectTo) , 0, $e);
		}
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " done");
		// cleaning listeners of metadata
		//$meta->set('id', null);
		//$meta->set('listeners', null);
		return $meta;
	}

	public function convertMetaData($fromObject, $toObject) {
		// EyeLocalFile => EyeWorkgroupFile
		if (('EyeLocalFile' == get_class ($fromObject)) &&
			('EyeWorkgroupFile' == get_class ($toObject)) ) {
				return convertFromFileToWorkGroup($fromObject, $toObject);
		}
		// EyeWorkgroupFile => EyeLocalFile
		else if (('EyeWorkgroupFile' == get_class ($fromObject)) &&
			('EyeLocalFile' == get_class ($toObject)) ) {
				return convertFromWorkGroupToFile($fromObject, $toObject);
		}
		else {
			throw new EyeMetaDataException("This handler can't do conversion from ".get_class($objectFrom)." to ". get_class($objectTo) , 0, null);
		}
	}
}
?>
