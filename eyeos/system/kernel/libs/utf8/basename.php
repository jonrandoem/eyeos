<?php
/**
 * Returns filename component of path
 *
 * @author Lars Knickrehm <mail@lars-sh.de>
 * @category Library
 * @copyright Copyright © 2009 Lars Knickrehm
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 * @link http://php.net/manual/function.basename.php
 * @package UTF-8
 * @param string $path A path. Both slash (/) and backslash (\) are used as directory separator character.
 * @param string $suffix If the filename ends in suffix  this will also be cut off.
 * @return string Base name of the given path
 * @since Version 0.5.0
 * @version 0.5.0
 */
function utf8_basename($path, $suffix = '') {
	// Change backslash (\) to slash (/)
	$path = utf8_trim(strtr($path, array('\\' => '/')), '/');
	
	// Get basename
	$i = utf8_strrpos($path, '/');
	if ($i !== false) {
		$path = utf8_substr($path, $i + 1);
	}
	
	// Handle suffix
	if ($suffix !== '') {
		$position = utf8_strrpos($path, $suffix);
		if ($position !== false) {
			$path = utf8_substr($path, 0, $position);
		}
	}
	return $path;
}
?>