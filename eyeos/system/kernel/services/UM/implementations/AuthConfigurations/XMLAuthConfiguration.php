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
 * @subpackage UM
 */
class XMLAuthConfiguration extends AuthConfiguration {
	private $path;
	
	/**
	 * @var array(appName => array(AppConfigurationEntry))
	 */
	private $appEntry = array();
	
	public function __construct($path) {
		if (!is_string($path)) {
			throw new EyeInvalidArgumentException($path);
		}
		if (!is_file($path)) {
			throw new EyeFileNotFoundException($path);
		}
		$this->path = $path;
		$this->refresh();
	}
	
	public function __clone() {
		$this->appEntry = array();
		$this->refresh();
	}
	
	/**
	 * @return array
	 */
	public function getAppConfigurationEntry($name) {
		if (!isset($this->appEntry[$name])) {
			throw new EyeMissingConfigurationException('No entry for "' . $name . '" in "' . $this->path . '".');
		}
		return $this->appEntry[$name];
	}
	
	public function refresh() {
		try {
			if (!is_readable($this->path)) {
				$logger = Logger::getLogger('system.services.UM.XMLAuthConfiguration');
				$logger->error($this->path . ' is not readable. Try to change permissions first.');
				
				throw new EyeIOException($this->path . ' is not readable. Try to change permissions first.');
			}
			$xml = simplexml_load_file($this->path);
			foreach($xml->appEntry as $appEntry) {
				$loginModules = array();
				foreach($appEntry->module as $module) {
					$loginModules[] = new AppConfigurationEntry((string) $module['name'], (string) $module['flag'], (string) $module['options']);
				}
				$this->appEntry[(string) $appEntry['name']] = $loginModules;
			}
		} catch (Exception $e) {
			$this->appEntry = array();
			throw new EyeException('Unable to load AuthConfiguration file at ' . $this->path . '.', 0, $e);
		}
	}
}
?>