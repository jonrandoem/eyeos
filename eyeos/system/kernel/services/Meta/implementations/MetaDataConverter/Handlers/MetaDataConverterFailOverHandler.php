<?php
class MetaDataConverterFailOverHandler implements IMetaDataConverterHandler {
	private static $Instance = null;
	private $Logger = null;
	const OBJECT = 0;
	const METADATACLASS = 1;

	public function __construct() {
		$this->Logger = Logger::getLogger('MetaDataConverter.MetaDataConverterFailOverHandler');
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new MetaDataConverterFailOverHandler();
		}
		return self::$Instance;
	}

	public function canConvertThis($fromObject, $toObject) {
		// faliback metadata converter always is capable
		return true;
	}
	public function convertMetaData($fromObject, $toObject) {
		// this failback return void metadata
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " working...");
		$this->Logger->debug("Conversion from " . get_class($fromObject) .
				" => " . get_class($toObject) . " done");
		// create empty metadata
		$newMeta = MetaManager::getInstance()->getNewMetaDataInstance($toObject);
		$newMeta->set('creationTime', time());
		$newMeta->set('modificationTime', time());
		return $newMeta;
	}
}
?>
