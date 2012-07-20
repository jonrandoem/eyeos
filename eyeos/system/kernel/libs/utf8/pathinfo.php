<?php
/**
 * Returns information about a file path
 *
 * @author Lars Knickrehm <mail@lars-sh.de>
 * @category Library
 * @copyright Copyright © 2009 Lars Knickrehm
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 * @link http://php.net/manual/function.pathinfo.php
 * @package UTF-8
 * @param string $path The path being checked.
 * @return array The following associative array elements are returned: dirname, basename, extension (if any), and filename.
 * @since Version 0.5.0
 * @version 0.5.0
 */
function utf8_pathinfo($path) {
	$return['dirname'] = dirname($path);
	$return['basename'] = utf8_basename($path);
	
	$position = utf8_strrpos($return['basename'], '.');
	if ($position !== false) {
		$return['extension'] = utf8_substr($return['basename'], $position + 1);
		$return['filename'] = $return['basename'];
		$return['filename'] = utf8_substr($return['filename'], 0, $position);
	} else {
		$return['filename'] = $return['basename'];
	}
	
	return $return;
}
?>