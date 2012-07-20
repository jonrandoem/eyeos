<?php
/**
 * Wraps a string to a given number of characters
 *
 * @author Lars Knickrehm <mail@lars-sh.de>
 * @category Library
 * @copyright Copyright © 2009 Lars Knickrehm
 * @license http://www.fsf.org/licensing/licenses/agpl-3.0.html GNU Affero General Public License
 * @link http://php.net/manual/function.wordwrap.php
 * @package UTF-8
 * @param string $str The input string.
 * @param int $width The column width (default: 75)
 * @param string $break The line is broken using the optional break parameter. (default: "\n")
 * @param bool $cut If the cut is set to true, the string is always wrapped at or before the specified width. So if you have a word that is larger than the given width, it is broken apart. (default: false)
 * @return string Given string wrapped at the specified column
 * @since Version 0.5.0
 * @version 0.5.0
 */
function utf8_wordwrap($str, $width = 75, $break = "\n", $cut = false) {
	$return = '';
	$line = '';
	foreach (explode(' ', $str) as $part) {
		$length = utf8_strlen($part);
		if (utf8_strlen($line) + $length <= $width) {
			$line .= $part . ' ';
		} else {
			$return .= utf8_substr($line, 0, -1) . $break;
			while ($cut === true && $length > $width) {
				$return .= utf8_substr($part, 0, $width) . $break;
				$part = utf8_substr($part, $width);
				$length = utf8_strlen($part);
			}
			$line = $part . ' ';
		}
	};
	if ($line !== '') {
		$return .= utf8_substr($line, 0, -1);
	}
	
	return $return;
}
?>