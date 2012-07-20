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
 * @subpackage FileSystem
 */
class XMLMountpointDescriptorsProvider implements IMountpointDescriptorProvider {
	const PARAM_FILEPATH = 'filePath';
	
	protected $filePath = null;
	
	/**
	 * 
	 * @param array $params Optional parameters depending on the implementation.
	 */
	public function __construct(array $params = null) {
		if (!isset($params[self::PARAM_FILEPATH])) {
			throw new EyeMissingArgumentException('Missing parameter $params[' . $params[self::PARAM_FILEPATH] . ']');
		}
		$this->filePath = $params[self::PARAM_FILEPATH];
	}
	
	/**
	 * Deletes given mountpoint descriptor.
	 * 
	 * @param MountpointDescriptor $md
	 */
	public function deleteMountpointDescriptor(MountpointDescriptor $md) {
		$xml = $this->loadMountpointsFile();
		
		$i = 0;
		foreach($xml->children() as $mdData) {
			if (((string) $mdData['mountpoint']) == $md->getMountpointPath()) {
				unset($xml->mountpoint[$i]);
				break;
			}
			$i++;
		}
		$this->saveMountpointsFile($xml);
	}
	
	/**
	 * 
	 * @return SimpleXmlElement
	 */
	protected function loadMountpointsFile() {
		try {
			if (!is_file($this->filePath)) {
				throw new EyeFileNotFoundException($this->filePath);
			}
			$xmlReader = new XmlStreamReader(new FileInputStream($this->filePath));
			$xml = null;
			$xmlReader->read($xml);
			$xmlReader->close();
			return $xml;
		} catch(Exception $e) {
			throw new EyeIOException('Unable to load mountpoints configuration at ' . $this->filePath . '.', 0, $e);
		}
	}
	
	/**
	 * Returns the mountpoint descriptors that is located at the given path.
	 * 
	 * @return MountpointDescriptor
	 */
	public function retrieveMountpointDescriptor($path) {
		$xml = $this->loadMountpointsFile();
		
		$mdList = array();
		foreach($xml->children() as $mdData) {
			if (((string) $mdData['mountpoint']) == $path) {
				return new MountpointDescriptor(
					(string) $mdData['mountpoint'],
					(string) $mdData['target'],
					((string) $mdData['active'] == 'true') ? true : false
				);
			}
		}
		throw new EyeException($path . ' is not a registered mountpoint.');
	}
	
	/**
	 * Returns the list of all the mountpoint descriptors that are located in
	 * the given path or one of its subfolders.
	 * 
	 * @return array(MountpointDescriptor)
	 */
	public function retrieveAllMountpointDescriptors($path) {
		$xml = $this->loadMountpointsFile();
		
		$mdList = array();
		foreach($xml->children() as $mdData) {
			$mdList[] = new MountpointDescriptor(
				(string) $mdData['mountpoint'],
				(string) $mdData['target'],
				((string) $mdData['active'] == 'true') ? true : false
			);
		}
		return $mdList;
	}
	
	/**
	 * 
	 * @param SimpleXmlElement $xml
	 */
	protected function saveMountpointsFile(SimpleXmlElement $xml) {
		try {
			if (!is_file($this->filePath)) {
				throw new EyeFileNotFoundException($this->filePath);
			}
			$xmlWriter = new XmlStreamWriter(
				new FileOutputStream($this->filePath),
				array(XmlStreamWriter::PARAM_FORMATOUTPUT => true)
			);
			$xmlWriter->write($xml);
			$xmlWriter->close();
		} catch (Exception $e) {
			throw new EyeIOException('Unable to save mountpoints configuration at ' . $this->filePath . '.', 0, $e);
		}
	}
	
	/**
	 * Stores given mountpoint descriptor.
	 * 
	 * @param MountpointDescriptor $md
	 */
	public function storeMountpointDescriptor(MountpointDescriptor $md) {
		$xml = $this->loadMountpointsFile();
		
		// check for already existing descriptor (update)
		$updateDone = false;
		foreach($xml->children() as $mdData) {
			if (((string) $mdData['mountpoint']) == $md->getMountpointPath()) {
				$mdData['target'] = $md->getTargetPath();
				$mdData['active'] = $mdData->getIsActive();
				
				$updateDone = true;
			}
		}
		if (!$updateDone) {
			// add new descriptor
			$node = $xml->addChild('mountpoint');
			$node->addAttribute('mountpoint', $md->getMountpointPath());
			$node->addAttribute('target', $md->getTargetPath());
			$node->addAttribute('active', $md->getIsActive());
		}
		$this->saveMountpointsFile($xml);
	}
}
?>
