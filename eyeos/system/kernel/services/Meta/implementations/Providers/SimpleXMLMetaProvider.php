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
 * Defines a MetaDataProvider able to store one IMetaData per XML file.
 * 
 * @package kernel-services
 * @subpackage Meta
 */
class SimpleXMLMetaProvider implements IMetaDataProvider {
	const PARAM_FILEPATH = 'filepath';
	const PARAM_FORMATOUTPUT = 'formatOutput';
	const PARAM_INREQUESTCACHE = 'useInRequestCache';
	
	/**
	 * @var array(array)
	 */
	private static $Cache = array();
	
	/**
	 * @var string
	 */
	protected $metaDataClass = 'BasicMetaData';
	
	/**
	 * @var string
	 */
	protected $filePath = null;
	
	/**
	 * @var bool
	 */
	protected $formatOutput = true;
	
	/**
	 * @var bool
	 */
	protected $useInRequestCache = true;
	
	/**
	 * Constructs a new instance of SimpleXMLMetaProvider using the given $metaDataClass.
	 * 
	 * @param string $metaDataClass
	 * @param array $params (PARAM_FILEPATH, PARAM_FORMATOUTPUT)
	 */
	public function __construct($metaDataClass, array $params = null) {
		try {
			$obj = new $metaDataClass();
		} catch (Exception $e) {
			throw new EyeInvalidArgumentException('Wrong argument $metaDataClass: must be the name of a class implementing IMetaData.', 0, $e);
		}
		if (!$obj instanceof IMetaData) {
			throw new EyeInvalidArgumentException('Wrong argument $metaDataClass: must be the name of a class implementing IMetaData.');
		}
		$this->metaDataClass = $metaDataClass;
		if (!isset($params[self::PARAM_FILEPATH])) {
			throw new EyeMissingArgumentException('Missing $params[' . self::PARAM_FILEPATH . ']');
		}
		$this->filePath = $params[self::PARAM_FILEPATH];
		if (isset($params[self::PARAM_FORMATOUTPUT])) {
			$this->formatOutput = $params[self::PARAM_FORMATOUTPUT] ? true : false;
		}
		if (isset($params[self::PARAM_INREQUESTCACHE])) {
			$this->useInRequestCache = $params[self::PARAM_INREQUESTCACHE] ? true : false;
		}
	}
	
	public function deleteMeta($id, $params = null) {
		unlink($this->filePath);
		if (isset(self::$Cache[$this->filePath])) {
			unset(self::$Cache[$this->filePath]);
		}
	}
	
	/**
	 * TODO
	 * 
	 * @param string $id The identifier used to find the right data to read.
	 * @param array $params Additional params implementation-dependant.
	 * @return IMetaData
	 */
	public function retrieveMeta($id, $params = null) {
		$metaDataCacheCell = null;
		if (isset(self::$Cache[$this->filePath])) {
			$metaDataCacheCell = self::$Cache[$this->filePath];
		} else {
			$xml = null;
			try {
				$xmlReader = new XmlStreamReader(new FileInputStream($this->filePath));
				$xmlReader->read($xml);
			} catch (EyeFileNotFoundException $e) {
				// file not found: no big deal, it means there's no metadata so return null
				return null;
			} catch(Exception $e) {
				// other type of exception: it might be a problem, log it
				$logger = Logger::getLogger('system.services.Meta.SimpleXMLMetaProvider');
				$logger->warn('Error trying to read XML metadata file at ' . $this->filePath);
				if ($logger->isDebugEnabled()) {
					$logger->debug((string) $e);
				}
				
				//close stream
				try {
					if (is_object($xmlReader)) {
						$xmlReader->close();
					}
				} catch (Exception $e) {}
				
				return null;
			}
			
			//close stream
			try {
				if (is_object($xmlReader)) {
					$xmlReader->close();
				}
			} catch (Exception $e) {}
			
			// Create cache cell (simple associative array)
			$metaDataCacheCell = array();
			foreach($xml->children() as $key => $value) {
				// Ommited keys are not allowed here
				if ((string) $value['key'] === '') {
					throw new EyeXMLInvalidDocumentException('Missing "key" attribute on node: ' . $value->asXml());
				}
				
				if (isset($value['type']) && $value['type'] == 'array') {
					$metaDataCacheCell[(string) $value['key']] = $this->readArray($value);
				} else {
					$metaDataCacheCell[(string) $value['key']] = (string) $value;
				}
			}
		}
		
		$metaDataClass = $this->metaDataClass;
		$metaData = new $metaDataClass();
		$metaData->setAll($metaDataCacheCell);
		return $metaData;
	}
	
	/**
	 * 
	 * FIXME: The following code overwrites values when elements with and without
	 * keys are found in the array.
	 * Ex: '' => 'zero', 0 => 'zero2', ... (the value 'zero2' will overwrite 'zero')
	 * 
	 * @return array
	 */
	protected function readArray(SimpleXMLElement $xml) {
		$array = array();
		$i = 0;
		foreach($xml->children() as $value) {
			// If no attribute "key" can be found, use next value from $i (integer)
			if ((string) $value['key'] === '') {
				$key = $i;
				$i++;
			} else {
				$key = (string) $value['key'];
			}
			if (isset($value['type']) && $value['type'] == 'array') {
				$array[$key] = $this->readArray($value);
			} else {
				$array[$key] = (string) $value;
			}
		}
		return $array;
	}
	
	/**
	 * TODO
	 * 
	 * @param string $id The identifier used to be able to retrieve data to be written afterwards.
	 * @param IMetaData The metadata to be written.
	 * @param array $params Additional params implementation-dependant.
	 */
	public function storeMeta($id, IMetaData $metaData, $params = null) {
		$xml = new SimpleXMLElement('<meta/>');
		$metaDatas = $metaData->getAll();
		foreach($metaDatas as $key => $value) {
			if (is_array($value)) {
				$node = $xml->addChild('entry');
				$node->addAttribute('key', $key);
				$node->addAttribute('type', 'array');
				$this->writeArray($node, $value);
			} else if (is_bool($value)) {
				$node = $xml->addChild('entry', $value ? 'true' : 'false');
				$node->addAttribute('key', $key);
			} else {
				$node = $xml->addChild('entry', $value);
				$node->addAttribute('key', $key);
			}
		}
		
		try {
			$xmlWriter = new XmlStreamWriter(
				new FileOutputStream($this->filePath),
				array(XmlStreamWriter::PARAM_FORMATOUTPUT => $this->formatOutput)
			);
			$xmlWriter->write($xml);
		} catch (Exception $e) {
			//close stream
			try {
				if (is_object($xmlWriter)) {
					$xmlWriter->close();
				}
			} catch (Exception $e) {}
			
			throw new EyeIOException('Unable to write meta file at ' . $this->filePath . '.', 0, $e);
		}
		//close stream
		try {
			if (is_object($xmlWriter)) {
				$xmlWriter->close();
			}
		} catch (Exception $e) {}
		
		//Update cache
		self::$Cache[$this->filePath] = $metaData->getAll();
	}
	
	/**
	 * 
	 * @return array
	 */
	protected function writeArray(SimpleXMLElement $node, array $value) {
		foreach($value as $subKey => $subValue) {
			if (is_array($subValue)) {
				$subNode = $node->addChild('entry');
				$subNode->addAttribute('key', $subKey);
				$subNode->addAttribute('type', 'array');
				$this->writeArray($subNode, $subValue);
			} else if (is_bool($subValue)) {
				$subNode = $xml->addChild('entry', $subValue ? 'true' : 'false');
				$subNode->addAttribute('key', $subKey);
			} else {
				$subNode = $node->addChild('entry', $subValue);
				$subNode->addAttribute('key', $subKey);
			}
		}
		return $node;
	}
}

?>