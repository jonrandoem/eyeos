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
 * @subpackage Security
 */
class XMLPolicyConfiguration extends PolicyConfiguration {
	/**
	 * @var string
	 */
	private $path;
	
	/**
	 * @var array(PolicyEntry)
	 */
	private $policyEntries = array();
	
	
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
	
	/**
	 * @return array(PolicyEntry)
	 */
	public function getPolicyEntries() {
		return $this->policyEntries;
	}
	
	public function refresh() {
		try {
			if (!is_readable($this->path)) {
				$logger = Logger::getLogger('system.services.Security.XMLPolicyConfiguration');
				$logger->error($this->path . ' is not readable. Try to change permissions first.');
				
				throw new EyeIOException($this->path . ' is not readable. Try to change permissions first.');
			}
			$xml = simplexml_load_file($this->path);
			$policiesNode = $xml->policies;
			
			$this->policyEntries = array();
			foreach($policiesNode->policy as $policy) {
				$handlerEntries = array();
				foreach($policy->handler as $handlerEntry) {
					$params = array();
					foreach($handlerEntry->param as $param) {
						$params[(string) $param['name']] = (string) $param['value'];
					}
					$handlerEntries[] = new PolicyHandlerEntry((string) $handlerEntry['class'], (string) $handlerEntry['flag'], $params);
				}
				$this->policyEntries[] = new PolicyEntry((string) $policy['objectClass'], $handlerEntries);
			}
		} catch (Exception $e) {
			$this->policyEntries = array();
			throw new EyeException('Unable to load PolicyConfiguration file at ' . $this->path . '.', 0, $e);
		}
	}
}
?>
