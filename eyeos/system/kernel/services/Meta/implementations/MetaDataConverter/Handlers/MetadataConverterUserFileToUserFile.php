<?php

class MetadataConverterUserFileToUserFile implements IMetaDataConverterHandler {
	private static $Instance = null;
	private $Logger = null;
	const OBJECT = 0;
	const METADATACLASS = 1;

	public function __construct() {
		$this->Logger = Logger::getLogger('MetaDataConverter.MetadataConverterUserFileToUserFile');
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new MetadataConverterUserFileToUserFile();
		}
		return self::$Instance;
	}

	public function canConvertThis($fromObject, $toObject) {
		if (('EyeUserFile' == get_class ($fromObject)) &&
			('EyeUserFile' == get_class ($toObject)) ) {
				return true;
		}
		return false;
	}
	public function convertMetaData($fromObject, $toObject) {
		// this failback converter simply copy the metadata "as is"
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " working...");
		try {
			$meta = $fromObject->getMeta();
		} catch (EyeMetaDataException $e) {
			throw new EyeMetaDataException("An error occured while coping metadatas from ".get_class($objectFrom)." to ". get_class($objectTo) , 0, $e);
		}
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " done");
		return $meta;
	}
}
?>
