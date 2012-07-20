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

// This class search in plugins
class SearchManager {

	private static $SearchPluginsImplementations = null;

	// Class variables
	private $compatiblePlugins;
	private $results;

	public function getResults() {
		return $this->results;
	}

	private function executeSearch(SearchQuery $obj) {
		foreach ($this->compatiblePlugins as $pluginObj) {
			$temp = $pluginObj->search($obj);
			$this->results[$pluginObj->getCategory()]['amount'] = $temp[0];
			$this->results[$pluginObj->getCategory()]['results'] = $temp[1];
		}
	}

	private static function getAllSearchPluginClassNames() {
		if (self::$SearchPluginsImplementations === null) {
			self::$SearchPluginsImplementations = array();
			
			$dir = new DirectoryIterator(FRAMEWORK_SEARCH_PLUGINS_PATH);
			foreach ($dir as $subFile) {
				$pluginName = $subFile->getFilename();
				if ($subFile->isDir() && $pluginName{0} != '.') {	
					if (is_file(FRAMEWORK_SEARCH_PLUGINS_PATH . '/' . $pluginName . '/' . $pluginName . '.php')) {
						require FRAMEWORK_SEARCH_PLUGINS_PATH . '/' . $pluginName . '/' . $pluginName . '.php';
						if (class_exists($pluginName)) {
							self::$SearchPluginsImplementations[] = $pluginName;
						}
					}
				}
			}
		}
		return self::$SearchPluginsImplementations;
	}
	
	public static function init() {
		foreach (self::getAllSearchPluginClassNames() as $pluginClassName) {
			if (method_exists($pluginClassName, 'init')) {
				try {
					call_user_func(array($pluginClassName, 'init'));
				} catch (Exception $e) {
					throw new EyeException('Unable to initiliaze plugin ' . $pluginClassName . '.', 0, $e);
				}
			}
		}
	}

	// Function: it takes care about preparing the search process,
	// parsing all the plugins which are able to understand and
	// process a given set of tokens.
	private function prepareSearch(SearchQuery $obj) {
		foreach(self::getAllSearchPluginClassNames() as $className) {
			$searchPlugin = new $className;
	
			// and we call the checkQuery function, to see if this plugin can accept
			// the queryString and the queryToken we are looking for.
			if ($searchPlugin->checkQuery($obj)) {
				$this->compatiblePlugins[] = $searchPlugin;
			}
		}
	}

	// Function: the public search function,
	// it just calls the prepare and the execute functions.
	public function search(SearchQuery $obj) {
		$this->prepareSearch($obj);
		$this->executeSearch($obj);
		return $this->results;
	}
}
?>
