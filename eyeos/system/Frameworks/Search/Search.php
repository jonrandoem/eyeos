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

define('FRAMEWORK_SEARCH_TOKENS_DIR', 'Tokens');
define('FRAMEWORK_SEARCH_TOKENS_PATH', FRAMEWORK_SEARCH_PATH . '/' . FRAMEWORK_SEARCH_TOKENS_DIR);
define('FRAMEWORK_SEARCH_PLUGINS_DIR', 'SearchPlugins');
define('FRAMEWORK_SEARCH_PLUGINS_PATH', FRAMEWORK_SEARCH_PATH . '/' . FRAMEWORK_SEARCH_PLUGINS_DIR);
define('FRAMEWORK_SEARCH_UTILS_DIR', 'utils');
define('FRAMEWORK_SEARCH_UTILS_PATH', FRAMEWORK_SEARCH_PATH . '/' . FRAMEWORK_SEARCH_UTILS_DIR);

require_once FRAMEWORK_SEARCH_PATH . '/interfaces.php';

require_once FRAMEWORK_SEARCH_PATH . '/SearchController.php';

require_once FRAMEWORK_SEARCH_PATH . '/SearchQuery.php';

require_once FRAMEWORK_SEARCH_PATH . '/ParserManager.php';

require_once FRAMEWORK_SEARCH_PATH . '/SearchManager.php';


// FIXME: to be putted inside Searchmanager class!!
$tokens = new DirectoryIterator(FRAMEWORK_SEARCH_TOKENS_PATH);
foreach ($tokens as $fileInfo) {
	$fileInfoName = $fileInfo->getFileName();

	if (!$fileInfo->isDot() && strpos($fileInfoName, '.php')) {
		require_once FRAMEWORK_SEARCH_TOKENS_PATH . '/' . $fileInfoName;
	}
}

// FIXME: to be deleted ?!?!
$abstractPlugins = new DirectoryIterator(FRAMEWORK_SEARCH_PLUGINS_PATH);
foreach ($abstractPlugins as $plugin) {
	$fileName = $plugin->getFilename();

	if ($plugin->isFile() && $fileName{0} != '.') {
		require FRAMEWORK_SEARCH_PLUGINS_PATH . '/' . $plugin->getFilename();
	}
}

SearchManager::init();
?>