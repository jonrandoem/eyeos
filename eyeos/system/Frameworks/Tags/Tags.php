<?php
/*

				                   ____  _____
				  ___  __  _____  / __ \/ ___/
				 / _ \/ / / / _ \/ / / /\__ \
				/  __/ /_/ /  __/ /_/ /___/ /
				\___/\__, /\___/\____//____/
				    /____/        2.0 Future

               Cloud Computing Operating System
                        www.eyeos.org

                  eyeos is released under the
		GNU Affero General Public License Version 3 (AGPL3)
         provided with this release in the file "LICENSE"
        or via web at http://gnu.org/licenses/agpl-3.0.txt

        Copyright 2005-2009 eyeos Team (team@eyeos.org)
*/

define('FRAMEWORK_TAGS_CONFIGURATION_FILE_EXTENSION', '.xml');
define('FRAMEWORK_TAGS_PROVIDERS_DIR', 'Providers');
define('FRAMEWORK_TAGS_PROVIDERS_PATH', FRAMEWORK_TAGS_PATH . '/' . FRAMEWORK_TAGS_PROVIDERS_DIR);
define('FRAMEWORK_TAGS_HANDLERS_DIR', 'TaggableObjectsHandlers');
define('FRAMEWORK_TAGS_HANDLERS_PATH', FRAMEWORK_TAGS_PATH . '/' . FRAMEWORK_TAGS_HANDLERS_DIR);

require dirname(__FILE__) . '/interfaces.php';
require dirname(__FILE__) . '/TagManager.php';

/*$directory = new DirectoryIterator(dirname(__FILE__));
foreach ($directory as $fileInfo) {
	if ($fileInfo->isFile() && $fileInfo->getFilename() != basename(__FILE__)) {
		require $fileInfo->getPathname();
	}
}*/
?>