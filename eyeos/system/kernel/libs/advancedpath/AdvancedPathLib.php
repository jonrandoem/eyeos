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

//for PHP < 5.2.0
if (!defined('PATHINFO_FILENAME')) {
	define('PATHINFO_FILENAME', 8);
}

/**
 * Provides functions for paths/URL manipulations, improving the default ones
 * provided by PHP, or unifying their behaviour under the different platforms
 * (*NIX, Windows).
 * 
 * @version 0.5 / 10-Nov-2009
 * @package kernel-libs
 * @subpackage advancedpathlib
 */
abstract class AdvancedPathLib {
	const NONE = 0;
	const OS_WINDOWS = 2;
	const OS_UNIX = 4;
	
	const GLOB_NORMAL = 0;
	const GLOB_ONLY_DIR = 1;				//@see GLOB_ONLYDIR in PHP manual
	const GLOB_DIR_IGNORE_PATTERN = 2;
	const GLOB_DIR_FIRST = 4;
	const GLOB_RETURN_SIMPLE_PATH = 8;
	const GLOB_CASEINSENSITIVE = 16;
	const GLOB_FORCE_SCANDIR = 32;
	
	const PARSE_URL_NO_AUTOSET_SCHEME = 8;
	const PARSE_URL_KEEPFRAGMENT = 16;
	const PARSE_URL_FRAGMENT2PATH = 32;
	const PARSE_URL_DONTRESOLVE = 64;
	
	const RESOLVEPATH_RETURN_REFDIR_RELATIVE = 8;
	const RESOLVEPATH_NOT_LOCALHOST = 16;
	
	const WILDCARD_CHAR = '*';
	
	const URL_USERPASSWORD_TOKEN = '@';
	const URL_PASSWORD_TOKEN = ':';
	const URL_PORT_TOKEN = ':';
	const URL_QUERY_TOKEN = '?';
	const URL_FRAGMENT_TOKEN = '#';
	
	private static $CurrentOS = null;
	private static $ParseUrl_fragment2PathProtocols = array();
	
	
	/**
	 * Returns the full URL corresponding to the URL parts in argument
	 * 
	 * @param array $urlParts
	 * @param int $flags
	 * 				OS_WINDOWS: Set it to force processing assuming a Windows filesystem.
	 * 				OS_UNIX: Set it to force processing assuming a UNIX filesystem. 
	 * @return string
	 */
	public static function buildURL($urlParts, $flags = self::NONE) {
		if ($flags & self::OS_WINDOWS) {
			$isWindows = true;
		} elseif ($flags & self::OS_UNIX) {
			$isWindows = false;
		} else {
			$isWindows = self::isCurrentOS(self::OS_WINDOWS);
		}
		
		$scheme = (isset($urlParts['scheme']) && $urlParts['scheme'] != '') ? $urlParts['scheme'] : 'file';
		$scheme = trim($scheme);
		$userPass = (isset($urlParts['user']) && $urlParts['user'] != '') ? $urlParts['user'] : '';
		$userPass .= (isset($urlParts['pass']) && $urlParts['pass'] != '') ? self::URL_PASSWORD_TOKEN.$urlParts['pass'] : '';
		$userPass .= ($userPass) ? self::URL_USERPASSWORD_TOKEN : '';
		$host = (isset($urlParts['host']) && $urlParts['host'] != '') ? $urlParts['host'] : '';
		$port = (isset($urlParts['port']) && $urlParts['port'] != '') ? self::URL_PORT_TOKEN.$urlParts['port'] : '';
		$query = (isset($urlParts['query']) && $urlParts['query'] != '') ? self::URL_QUERY_TOKEN.$urlParts['query'] : '';
		$fragment = (isset($urlParts['fragment']) && $urlParts['fragment'] != '') ? self::URL_FRAGMENT_TOKEN.$urlParts['fragment'] : '';
		
		//if a user/pass has been specified, we automatically add default host: localhost
		if ($userPass != '' && $host == '') {
			$host = 'localhost';
		}
		if ($scheme == 'file' && $isWindows) {
			if (preg_match('/^[a-z]{1}:/i', $urlParts['path']) && $host) {
				$urlParts['path'] = '/'.$urlParts['path'];
			}
		}
		return $scheme.'://'.$userPass.$host.$port.AdvancedPathLib::unifyPath($urlParts['path']).$query.$fragment;
	}
	
	/**
	 * Copy directories recursively.
	 * 
	 * @param string $src The source path
	 * @param string $dst The target path
	 * @param boolean $includeHidden TRUE to include also copy hidden files/dirs (.*), FALSE otherwise
	 * @return boolean
	 * @throws Exception if $src is not a directory
	 * @throws Exception if $dst or one of its subfolders cannot be created
	 */
	public static function cpdirs($src, $dst, $includeHidden = true) {
		if(!is_dir($src)) {
			throw new Exception('"' . $src . '" is not a directory.');
		}
		if (!is_dir($dst) && !mkdir($dst)) {
			return false;
		}
		$dir = opendir($src);
		while (false !== ($file = readdir($dir))) {
			if ($file != '.' && $file != '..' && ($includeHidden || utf8_strpos($file, '.') !== 0)) {
				if (is_dir($src . '/' . $file)) {
					@self::cpdirs($src . '/' . $file, $dst . '/' . $file, $includeHidden);
				} else {
					@copy($src . '/' . $file, $dst . '/' . $file);
				}
			}
		}
		closedir($dir);
		return true;
	}
	
	public static function dirname($path) {
		return self::unifyPath(dirname($path));
	}
	
	/**
	 * Alias for fnmatch() if it is not available on the current platform.
	 * 
	 * @param string $pattern The pattern in shell-like form (*.txt, *log*, *.[cC], ...)
	 * @param string $filename The filename to check
	 * @return boolean TRUE if the given filename matches the pattern, FALSE otherwise
	 */
	public static function fnmatch($pattern, $filename) {
		if (!function_exists('fnmatch')) {
			//Windows does NOT have fnmatch() so we emulate it
			$pattern = strtr(preg_quote($pattern, '#'), array('\*' => '.*', '\?' => '.', '\[' => '[', '\]' => ']'));
			return preg_match('#^'.$pattern.'$#', $filename) > 0;
		}
		return fnmatch($pattern, $filename);
	}
	
	/**
	 * Returns a unified path without any trailing slashes.
	 * 
	 * @param string $path
	 * @return string
	 */
	public static function getCanonicalPath($path) {
		return self::removeLastSlash(self::unifyPath($path));
	}
	
	/**
	 * Returns the exact (canonical) URL of the given path:
	 * - resolving relative path if necessary,
	 * - adding scheme,
	 * - converting backslashes into slashes,
	 * - removing extra slashes,
	 * - removing trailing slash,
	 * - ...
	 * 
	 * @param mixed $path The path to be converted (string) or the urlParts corresponding to a URL (array).
	 * @param int $flags OS_WINDOWS | OS_UNIX | PARSE_URL_NO_AUTOSET_SCHEME | PARSE_URL_KEEPFRAGMENT
	 *            | PARSE_URL_FRAGMENT2PATH | PARSE_URL_DONTRESOLVE
	 * @return string The exact URL
	 */
	public static function getCanonicalURL($path, $flags = self::NONE) {
		$urlParts = null;
		if (is_string($path)) { 
			$urlParts = self::parse_url($path, $flags);
		} else if (is_array($path)) {
			$urlParts =& $path;
		} else {
			throw new InvalidArgumentException('$path must be either a string or an array containing URL parts (' . gettype($path) . ' given).');
		}
		$urlParts['path'] = self::removeLastSlash($urlParts['path']);
		return self::buildURL($urlParts, $flags);
	}
	
	public static function getCurrentOS() {
		if (self::$CurrentOS === null) {
			self::$CurrentOS = strncasecmp(PHP_OS, 'win', 3) === 0? self::OS_WINDOWS : self::OS_UNIX;
		}
		return self::$CurrentOS;
	}
	
	/**
	 * PHP path hack for local filesystem.
	 * @see http://bugs.php.net/45228
	 * 
	 * Windows: PHP library does not work well with *full* URL paths for local filesystem (like
	 *          "file://C:/myDir", or "file://localhost/C:/myDir"), so this function returns PHP
	 *          libraries compatible paths: "C:/myDir".<br />
	 * _NIX: PHP library does not work well with full URL paths containing hostname for local
	 *       filesystem (like "file://localhost/home/john/myFile.ext"), so here the function
	 *       returns "/home/john/myFile.ext".
	 * 
	 * @param string $path
	 * @param int $flags Flags for AdvancedPathLib::parse_url()
	 * @return string
	 */
	public static function getPhpLocalHackPath($path, $flags = self::NONE) {
		$urlParts = self::parse_url($path, $flags);
		if ($urlParts['scheme'] == 'file') {
			if (self::isCurrentOS(self::OS_WINDOWS)) {
				if (preg_match('/\/?([a-z]{1}:.*)/i', $urlParts['path'], $matches)) {
					return $matches[1];
				}
			} else {
				return $urlParts['path'];
			}
		}
		return $path;
	}
	
	/**
	 * Returns the given URL with hidden password for secured display.
	 * 
	 * @param string $url
	 * @return string
	 */
	public static function getURLForDisplay($url) {
		$urlParts = self::parse_url($url);
		if (isset($urlParts['pass'])) {
			$urlParts['pass'] = str_pad('', strlen($urlParts['pass']), '*');
		} else {
			return $url;
		}
		return self::buildUrl($urlParts);
	}	
	
	/**
	 * Finds pathnames matching a pattern.
	 * Note: This function does not return hidden files (.*) under *NIX with default pattern (*)
	 * 
	 * @see glob() in PHP manual
	 * @param string $path
	 * @param mixed $pattern A simple string or an array of strings representing the patterns.
	 * @param int $flags
	 * 			GLOB_ONLY_DIR: Set it to retrieve directories only.<br />
	 * 			GLOB_DIR_IGNORE_PATTERN: Set it to apply given $pattern on files only, and retrieve all directories.<br />
	 * 			GLOB_DIR_FIRST: Set it to force placing directories first in the returned list.<br />
	 * 			GLOB_RETURN_SIMPLE_PATH: Set it to force returning a simple path (from the root) instead of a URL.<br />
	 * 			GLOB_CASEINSENSITIVE: Set it to apply given $pattern in a case insensitive way.<br />
	 * 			GLOB_FORCE_SCANDIR: Set it to force direct use of scandir() instead of glob().
	 * @return array(string)
	 */
	public static function glob($path, $pattern = self::WILDCARD_CHAR, $flags = self::GLOB_NORMAL) {
		if (!is_string($path)) {
			throw new EyeInvalidArgumentException('$path must be a string (given: ' . gettype($pattern) . ').');
		}
		if (!is_string($pattern) && !is_array($pattern)) {
			throw new EyeInvalidArgumentException('$pattern must be a string or an array (given: ' . gettype($pattern) . ').');
		}
		if (is_array($pattern)) {
			if (count($pattern) === 0) {
				$pattern = self::WILDCARD_CHAR;
			} else if (count($pattern) === 1) {
				$pattern = $pattern[0];
			}
		}
		
		$globFlags = 0;
		if (is_array($pattern)) {
			// Clean original $pattern (common to glob & scandir)
			foreach($pattern as &$subPattern) {
				$subPattern = str_replace('/', '', $subPattern);
				if ($flags & self::GLOB_CASEINSENSITIVE) {
					$subPattern = mb_sql_regcase($subPattern);
				}
			}
			
			// Create a glob-compatible expression with multiple patterns using braces
			$globPattern = '{' . implode(',', $pattern) . '}';
			$globFlags |= GLOB_BRACE;
		} else {
			$globPattern =& $pattern;
			$pattern = str_replace('/', '', $pattern);
			if ($flags & self::GLOB_CASEINSENSITIVE) {
				$pattern = mb_sql_regcase($pattern);
			}
		}
		
		$return = array();
		$globFlags |= ($flags & self::GLOB_ONLY_DIR) ? GLOB_ONLYDIR : 0;
		$globPath = self::getPhpLocalHackPath(strtr($path, array('[' => '\[', ']' => '\]')), self::PARSE_URL_DONTRESOLVE);
		
		//first of all, let's try with the normal glob() function (works only on localhost, but faster)
		if (!($flags & self::GLOB_FORCE_SCANDIR)									//FORCE_SCANDIR flag must be off
				&& ($allFiles = glob($globPath . '/' . $globPattern, $globFlags))) {	//_and_ glob() must succeed (an empty array may indicate that glob() failed)
			$onlyDirs = array();
			if ($flags & self::GLOB_DIR_IGNORE_PATTERN) {
				$onlyDirs = glob($globPath . '/' . self::WILDCARD_CHAR, GLOB_ONLYDIR);
			} else {
				$onlyDirs = glob($globPath . '/' . $globPattern, GLOB_ONLYDIR);
			}

                        //in some servers glob is returning false, documentation says it shoul
                        //return an empty array, however, this is not happening.
                        if(!$onlyDirs) {
                                $onlyDirs = array();
                        }

			natcasesort($onlyDirs);
			$onlyFiles = array_diff($allFiles, $onlyDirs);
			$sortedFiles = array_merge($onlyDirs, $onlyFiles);	//dirs are placed first (alphab. sorted), then files (alphab. sorted)
			
			if (! ($flags & self::GLOB_DIR_FIRST)) {
				natcasesort($sortedFiles);
			}
			
			$scheme = '';
			if (!($flags & self::GLOB_RETURN_SIMPLE_PATH)) {
				//retrieve the original scheme
				$urlParts = self::parse_url($path, self::PARSE_URL_NO_AUTOSET_SCHEME);
				if (isset($urlParts['scheme'])) {
					$scheme = $urlParts['scheme'] . '://';
				}
			}
			
			foreach($sortedFiles as $filepath) {
				if (utf8_basename($filepath) != '.' && utf8_basename($filepath) != '..') {
					$return[] = $scheme . $filepath;
				}
			}
		}
		//glob() failed (out of filesystem), let's try with scandir()
		else {
			$files = @scandir($path);
			if ($files === false) {
				throw new EyeIOException('Unable to list files in directory "' . $path . '"');
			}
			
			$files_tmp = array();
			$dirs_tmp = array();
			foreach($files as $filepath) {
				if ($filepath != '.' && $filepath != '..') {
					// Single pattern (string)
					if (is_string($pattern)) {
						$fileNameMatches = self::glob_fnmatch($pattern, $filepath);
					}
					// Multiple pattern (array)
					else {
						$fileNameMatches = false;
						foreach($pattern as &$subPattern) {
							if (self::glob_fnmatch($subPattern, $filepath)) {
								$fileNameMatches = true;
								break;
							}
						}
					}
					
					if (is_dir($path . '/' . $filepath)) {
						if ($fileNameMatches || $flags & self::GLOB_DIR_IGNORE_PATTERN) {
							$dirs_tmp[] = $path . '/' . $filepath;
						}
					} else {
						if (!($flags & self::GLOB_ONLY_DIR) && $fileNameMatches) {
							$files_tmp[] = $path . '/' . $filepath;
						}
					}
				}
			}			
			$return = array_merge($dirs_tmp, $files_tmp);
			if (! ($flags & self::GLOB_DIR_FIRST)) {
				natcasesort($return);
				$return = array_values($return);
			}
		}
		return $return;
	}
	
	/**
	 * This special fnmatch() is designed to filter filenames just like glob() does regarding the
	 * hidden files:
	 * - With the pattern '*' and a hidden file, it will return FALSE
	 * - With the pattern '*.*' and a hidden file, it will return FALSE
	 * - With the pattern '.*' and a hidden file, it will return TRUE
	 * 
	 * @param string $pattern
	 * @param string $filename
	 * @return boolean
	 */
	private static function glob_fnmatch($pattern, $filename) {
		$hiddenFilesChar = ($pattern{0} === '.') ? '' : '[^\.]';
		$pattern = strtr(preg_quote($pattern, '#'), array('\*' => '.*', '\?' => '.', '\[' => '[', '\]' => ']'));
		return preg_match('#^' . $hiddenFilesChar . $pattern . '$#', $filename) > 0;
	}
	
	/**
	 * Checks if the current OS is the one represented by the given constant.
	 * 
	 * @param int $OS The AdvancedPathLib:OS_WINDOWS or AdvancedPathLib::OS_UNIX constant.
	 * @return boolean
	 */
	public static function isCurrentOS($OS) {
		if ($OS == self::getCurrentOS()) {
			return true;
		}
		return false;
	}
	
	/**
	 * Checks if the given path is relative or absolute.
	 * 
	 * @param string $path
	 * @return boolean TRUE if relative, FALSE otherwise.
	 */
	private static function isRelative($path) {
		if (self::isCurrentOS(self::OS_WINDOWS)) {
			return (preg_match('/^[a-z]{1}:/i', $path) == 0);
		} else {
			return (preg_match('/^\//', $path) == 0);
		}
	}
	
	/**
	 * Moves an uploaded file to a new location.
	 * 
	 * @param string $path
	 * @param string $newPath
	 */
	public static function move_uploaded_file($path, $newPath) {
		//TODO: find a way to correctly handle all possible encodings for filenames
		// => UTF-8 fails on Windows, etc.
		
		return move_uploaded_file($path, $newPath);
	}
	
	/**
	 * Parses a URL and return its components
	 * 
	 * @see parse_url() in PHP manual
	 * @param string $path The URL/path to parse
	 * @param int $flags
	 * 			OS_WINDOWS: Set it to force parsing assuming a Windows filesystem.<br />
	 * 			OS_UNIX: Set it to force parsing assuming a UNIX filesystem.<br />
	 * 			PARSE_URL_NO_AUTOSET_SCHEME: Set it to prevent autosetting scheme (file:// by default) in the returned components.<br />
	 * 			PARSE_URL_KEEPFRAGMENT: Set it to force keeping detected fragment even if the scheme may not support it.<br />
	 * 			PARSE_URL_FRAGMENT2PATH: Set it to force the fragment to be considered within the path component.<br />
	 * 			PARSE_URL_DONTRESOLVE: Set it to prevent resolving path (if file:// for example).
	 * @return array
	 */
	public static function parse_url($path, $flags = self::NONE) {
		if ($flags & self::OS_WINDOWS) {
			$isWindows = true;
		} elseif ($flags & self::OS_UNIX) {
			$isWindows = false;
		} else {
			$isWindows = self::isCurrentOS(self::OS_WINDOWS);
		}
		if ($isWindows) {
			$path = self::unifyPath($path, true);
		}
		
		//=========== URL ANALYZE (begin) ===========
		//We first try with PHP standard function parse_url() but this one may fail on unknown schemes
		//so in this case we try regexp (slower) to break it down into parts.
		$errorParsing = false;
		try {
			$urlParts = parse_url($path);
			if ($urlParts === false) {
				$errorParsing = true;
			}
		} catch (EyeErrorException $e) {
			$errorParsing = true;
		}
                
		if ($errorParsing) {
			$errorParsing = false;		// Reset flag
			
			/** @see http://www.ietf.org/rfc/rfc3986.txt */
			//(extracts only scheme, "authority" (user-pass-host-port), path, query and fragment)
			if (preg_match('`^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?`', $path, $matches)) {
				$urlParts = array();
				if (isset($matches[2])) { $urlParts['scheme'] = $matches[2]; }
				if (isset($matches[4]) && !empty($matches[4])) {
					//extract user, pass, host and port from authority
					if (preg_match('`^(([^:/?#]+)(:([^:/?#]+))?@)?([^:/?#@]+)(:([0-9]{1,5}))?$`', $matches[4], $matches2)) {
						if (isset($matches2[2]) && !empty($matches2[2])) { $urlParts['user'] = $matches2[2]; }
						if (isset($matches2[4]) && !empty($matches2[4])) { $urlParts['pass'] = $matches2[4]; }
						if (isset($matches2[5]) && !empty($matches2[5])) { $urlParts['host'] = $matches2[5]; }
						if (isset($matches2[7]) && !empty($matches2[7])) { $urlParts['port'] = $matches2[7]; }
					}
					else {
						$errorParsing = true;
					}
				}
				if (isset($matches[5]) && !empty($matches[5])) { $urlParts['path'] = $matches[5]; } else { $urlParts['path'] = '/'; }
				if (isset($matches[7]) && !empty($matches[7])) { $urlParts['query'] = $matches[7]; }
				if (isset($matches[9]) && !empty($matches[9])) { $urlParts['fragment'] = $matches[9]; }
			} else {
				$errorParsing = true;
			}
		}
		if ($errorParsing) {
			throw new InvalidArgumentException('Unable to parse given path/URL "' . $path . '"');
		}
		//=========== URL ANALYZE (end) ===========
		$path = urlencode($path); // FIXME!!!

		if (!($flags & self::PARSE_URL_NO_AUTOSET_SCHEME) && !isset($urlParts['scheme'])) {
			$urlParts['scheme'] = 'file';
		}
		
		//Windows platforms have the following special corrective behaviour
		if ($isWindows) {
			if (isset($urlParts['path'])) {
				$urlParts['path'] = self::unifyPath($urlParts['path']);
			}
			//misunderstood scheme? (Windows drive letter)
			if (isset($urlParts['scheme']) && preg_match('/^[a-z]{1}$/i', $urlParts['scheme'])) {
				//misunderstood path?
				if (isset($urlParts['host']) && $urlParts['host'] != 'localhost') {
					$urlParts['path'] = '/' . $urlParts['host'] . '/' . $urlParts['path'];
					unset($urlParts['host']);
				}
				$urlParts['path'] = strtoupper($urlParts['scheme']) . ':' . $urlParts['path'];
				
				//autoset scheme (file:// by default)
				if (!($flags & self::PARSE_URL_NO_AUTOSET_SCHEME)) {
					$urlParts['scheme'] = 'file';
				} else {
					unset($urlParts['scheme']);
				}
			}
			//misunderstood host? (Windows drive letter)
			if (isset($urlParts['host']) && preg_match('/^[a-z]{1}$/i', $urlParts['host'])) {
				if (!isset($urlParts['path']) || preg_match('/^([a-z]{1}):/i', $urlParts['path']) === 0) {
					$urlParts['path'] = strtoupper($urlParts['host']) . ':' . @$urlParts['path'];
					unset($urlParts['host']);
				}
				//autoset scheme (file:// by default)
				if (!($flags & self::PARSE_URL_NO_AUTOSET_SCHEME)) {
					$urlParts['scheme'] = 'file';
				}
			}
			//windows absolute path?
			if (isset($urlParts['path']) && preg_match('/^\/([a-z]{1})(:\/.*)$/i', $urlParts['path'], $matches)) {
				$urlParts['path'] = strtoupper($matches[1]) . $matches[2];
			}
		}		
		//autocomplete and unify result path
		if (isset($urlParts['path']) && $urlParts['path'] != '') {
			$urlParts['path'] = self::unifyPath($urlParts['path']);
		} else {
			$urlParts['path'] = '/';
		}
		
		//root path under Windows?
		if ($isWindows && isset($urlParts['scheme'])
			&& $urlParts['scheme'] == 'file'
			&& utf8_strpos($urlParts['path'], '/') === 0
			&& !(utf8_strpos($urlParts['path'], ':') === 2)) {
			$urlParts['path'] = utf8_strtoupper(utf8_substr(realpath('.'), 0, 2)) . $urlParts['path'];
		}
		
		if (!($flags & self::PARSE_URL_DONTRESOLVE)) {
			//relative path? (to PHP's current dir)
			if (utf8_strpos($urlParts['path'], './') === 0) {					//was: if (preg_match('/^\.\//', $urlParts['path'])) {
				$urlParts['path'] = self::realpath($urlParts['path'], true);
			}
			//relative path?
			elseif (preg_match('/\.{2}\//', $urlParts['path'])) {
				$urlParts['path'] = self::realpath($urlParts['path'], $urlParts['scheme'] == 'file');
			}
		}
		
		//no host provided? (file://)
		if (isset($urlParts['scheme']) && $urlParts['scheme'] == 'file' && isset($urlParts['host']) && $urlParts['host'] != 'localhost') {
			$urlParts['path'] = '/' . $urlParts['host'] . $urlParts['path'];
			unset($urlParts['host']);
		}
		
		//autocomplete and unify result path
		if (isset($urlParts['path']) && $urlParts['path'] != '') {
			$urlParts['path'] = self::getCanonicalPath($urlParts['path']);
		} else {
			$urlParts['path'] = '/';
		}
		
		//scheme to lowercase
		if (isset($urlParts['scheme'])) {
			$urlParts['scheme'] = utf8_strtolower($urlParts['scheme']);
		}
		
		//consider fragment (scheme://path#fragment) inside or outside path?
		if ($flags & self::PARSE_URL_FRAGMENT2PATH
			|| !($flags & self::PARSE_URL_KEEPFRAGMENT) && isset($urlParts['fragment']) && (in_array($urlParts['scheme'], self::$ParseUrl_fragment2PathProtocols))) {
			$urlParts['path'] .= '#' . $urlParts['fragment'];
			unset($urlParts['fragment']);
		}
//		var_dump($urlParts);
		return $urlParts;
	}
	
	/**
	 * Registers a handling style of fragments (parts of the URL after "#") for a specified protocol.<br />
	 * Example: The file:// protocol must consider the fragment inside the path<br />
	 * 			EXAMPLE URL:	file://my/path/My song #1.mp3<br />
	 * 			WRONG:			[path] "/my/path/My song "<br />
	 * 							[fragment] "1.mp3"<br />
	 * 			CORRECT:		[path] "/my/path/My song #1.mp3"<br />
	 * 							[fragment] (none)<br />
	 *
	 * @param array $schemes An array containing the schemes to set up
	 * @param boolean $enable TRUE to consider fragment as part of the path, FALSE to keep it as fragment
	 */
	public static function parse_url_registerFragment2PathProtocol(array $schemes, $register = true) {
		foreach($schemes as $scheme) {
			if ($register) {
				if (!in_array($scheme, self::$ParseUrl_fragment2PathProtocols)) {
					self::$ParseUrl_fragment2PathProtocols[] = $scheme;
				}
			} else {
				if (($key = array_search($scheme, self::$ParseUrl_fragment2PathProtocols)) !== false) {
					unset(self::$ParseUrl_fragment2PathProtocols[$key]);
				}
			}
		}
	}
	
	/**
	 * @see pathinfo() from PHP
	 * @param string $path
	 * @param int $options PATHINFO_DIRNAME | PATHINFO_BASENAME | PATHINFO_EXTENSION | PATHINFO_FILENAME
	 * @return mixed The following associative array elements are returned: dirname, basename, extension
	 * 				(if any), and filename. If options is used, this function will return a string if not
	 * 				all elements are requested.
	 */
	public static function pathinfo($path, $options = 15) {
		if (!($options & PATHINFO_FILENAME)) {
			return pathinfo($path, $options);
		}
		$pathinfo = pathinfo($path, $options);
		if (!isset($pathinfo['filename'])) {
			if (isset($pathinfo['extension'])) {
				$pathinfo['filename'] = utf8_substr($pathinfo['basename'], 0, -(utf8_strlen($pathinfo['extension']) + 1));
			}
		}
		return $pathinfo;
	}
	
	/**
	 * Converts given UNIX-like permissions to octal (-rwxrwxrwx => 0777).
	 * 
	 * @param string $perms
	 * @return int
	 */
	public static function permsToOctal($perms) {
		if (! is_string($perms)) {
			throw new InvalidArgumentException($perms . ' is not a valid permissions value (example: "-rwxr-xr--").');
		}
		if (utf8_strlen($perms) != 10) {
			throw new LengthException('Permission value ' . $perms . ' must be 10 characters long. (example: "-rwxr-xr--")');
		}
		$mode = 0;
		if ($perms{1} == 'r') $mode += 0400;
		if ($perms{2} == 'w') $mode += 0200;
		if ($perms{3} == 'x') $mode += 0100;
		elseif ($perms{3} == 's') $mode += 04100;
		elseif ($perms{3} == 'S') $mode += 04000;
		
		if ($perms{4} == 'r') $mode += 040;
		if ($perms{5} == 'w') $mode += 020;
		if ($perms{6} == 'x') $mode += 010;
		elseif ($perms{6} == 's') $mode += 02010;
		elseif ($perms{6} == 'S') $mode += 02000;
		
		if ($perms{7} == 'r') $mode += 04;
		if ($perms{8} == 'w') $mode += 02;
		if ($perms{9} == 'x') $mode += 01;
		elseif ($perms{9} == 't') $mode += 01001;
		elseif ($perms{9} == 'T') $mode += 01000;
		return $mode;
	}
	
	/**
	 * Converts given octal permissions to UNIX-like (0777 => -rwxrwxrwx).
	 * 
	 * @param int $perms
	 * @return string
	 */
	public static function permsToUnix($perms) {
		if (($perms & 0xC000) == 0xC000) {
			$info = 's';
		} elseif (($perms & 0xA000) == 0xA000) {
			$info = 'l';
		} elseif (($perms & 0x8000) == 0x8000) {
			$info = '-';
		} elseif (($perms & 0x6000) == 0x6000) {
			$info = 'b';
		} elseif (($perms & 0x4000) == 0x4000) {
			$info = 'd';
		} elseif (($perms & 0x2000) == 0x2000) {
			$info = 'c';
		} elseif (($perms & 0x1000) == 0x1000) {
			$info = 'p';
		} else {
			//not exactly right, but should be enough for our needs :)
			$info = '-';		// was: $info = 'u';
		}
		
		//owner
		$info .= (($perms & 0x0100) ? 'r' : '-');
		$info .= (($perms & 0x0080) ? 'w' : '-');
		$info .= (($perms & 0x0040) ? (($perms & 0x0800) ? 's' : 'x' ) : (($perms & 0x0800) ? 'S' : '-'));
		
		//group
		$info .= (($perms & 0x0020) ? 'r' : '-');
		$info .= (($perms & 0x0010) ? 'w' : '-');
		$info .= (($perms & 0x0008) ? (($perms & 0x0400) ? 's' : 'x' ) : (($perms & 0x0400) ? 'S' : '-'));
		
		//others
		$info .= (($perms & 0x0004) ? 'r' : '-');
		$info .= (($perms & 0x0002) ? 'w' : '-');
		$info .= (($perms & 0x0001) ? (($perms & 0x0200) ? 't' : 'x' ) : (($perms & 0x0200) ? 'T' : '-'));
		
		return $info;
	}
	
	/**
	 * Return the absolute path corresponding to the given mixed path in
	 * argument, even if the file/folder does not exist.
	 * 
	 * @param string $path
	 * @param boolean $resolveFromLocalhost TRUE to take into account the server's filesystem to
	 *                                       resolve absolute path (useful on Windows), FALSE otherwise
	 * @return string The resolved path.
	 */
	public static function realpath($path, $resolveFromLocalhost = true) {
		if (self::isRelative($path) && $resolveFromLocalhost) {
			$curdir = self::unifyPath(realpath('.') . '/');
			$path = $curdir.$path;
		}
		/*
		 * This is the starting point of the system root.
		 * Left empty for UNIX based and Mac.
		 * For Windows this is drive letter and semicolon.
		 */
		$startPoint = '';
		if (self::isCurrentOS(self::OS_WINDOWS) && $resolveFromLocalhost) {
			$path = self::unifyPath($path);
			list($startPoint, $path) = explode(':', $path, 2);
			$startPoint .= ':';
		}
		// From now processing is the same for WIndows and Unix, and hopefully for others.
		$realparts = array();
		$parts = explode('/', $path);
		$nbparts = count($parts);
		for ($i = 0; $i < $nbparts; $i++) {
			if (strlen($parts[$i]) == 0 || $parts[$i] == '.') {
				continue;
			}
			if ($parts[$i] == '..') {
				if (count($realparts) > 0) {
					array_pop($realparts);
				}
			} else {
				$realparts[] = $parts[$i];
			}
		}
		return $startPoint.'/'.implode('/', $realparts);
	}
	
	/**
	 * Removes the final slash from given $path only it is not the only character in the string.
	 * 
	 * @param string $path
	 * @return string
	 */
	protected static function removeLastSlash($path) {
		if ($path != '/' && utf8_substr($path, -1) == '/') {
		    $path = utf8_substr($path, 0, -1);
		}
		return $path;
	}
	
	/**
	 * Resolves a given $path into given $referenceDirPath if possible.
	 * <b>WARNING:</b>
	 * <ul>
	 * 	<li>This function is not to be used on URL as (file://..., ftp://..., etc.), only *simple* paths (/my/simple/path).</li>
	 * 	<li>This function may output incorrect results on Windows platforms when $path is located on a different drive letter
	 *      from $referenceDirPath.</li>
	 * </ul>
	 * 
	 * @param string $path The path of a file to resolve<br />
	 *                                         (e.g. "/Documents/Images/..",<br />
	 *                                           or  "./users/john/files/Documents/Images/..",<br />
	 *                                           or  "/home/john/eyeos/users/john/files/Documents/Images/..",<br />
	 *                                           or  "C:\My Documents\john\eyeos\users\john\files\Documents\Images\..")
	 * @param string $referenceDirPath The path of the directory used as a reference for resolution
	 * @param int $flags
	 * 				OS_WINDOWS: Set it to force resolution assuming a Windows filesystem.<br />
	 * 				OS_UNIX: Set it to force resolution assuming a UNIX filesystem. <br />
	 * 				RESOLVEPATH_RETURN_REFDIR_RELATIVE:	Set it to get a resolved path from current PHP directory (getcwd)
	 *                                              	(e.g. "./users/john/files/Documents"),
	 * 													or don't to get a resolved path in the reference folder (e.g. "/Documents")<br />
	 * 				RESOLVEPATH_NOT_LOCALHOST: Set it to resolve the given path as a normal file on the filesystem,
	 * 										   or don't to resolve it according to the reference path only.<br />
	 * @return mixed The resolved path or FALSE if the given path is not in the reference directory or if an error occured
	 * @throws InvalidArgumentException
	 */	
	public static function resolvePath($path, $referenceDirPath, $flags = self::NONE) {
		if ($flags & self::OS_WINDOWS) {
			$isWindows = true;
		} elseif ($flags & self::OS_UNIX) {
			$isWindows = false;
		} else {
			$isWindows = self::isCurrentOS(self::OS_WINDOWS);
		}
		$path = AdvancedPathLib::unifyPath($path);
		$resolveOnLocalHost = !($flags & self::RESOLVEPATH_NOT_LOCALHOST);
		
		//both following var are used in the next different parts to analyze its structure, but we initialize them
		//now to avoid multiple calls to self::realpath()
		$absolutePath = self::realpath($path, $resolveOnLocalHost);
		$absolutePathReferenceDir = self::realpath($referenceDirPath, $resolveOnLocalHost);
						
		//$path is a relative path to the current PHP dir
		// -OR-  $path is a full absolute path
		if (stripos($path, './') === 0 || $path == $absolutePath) {
			//designated path is NOT in the reference directory => ERROR
			if (stripos($absolutePath, $absolutePathReferenceDir) !== 0) {
				throw new InvalidArgumentException('Unable to process paths resolution: ' . $path . ' is not located in ' . $referenceDirPath . '.');
			}
			$path = $absolutePath;
		}
		
		//$path is an absolute path
		// UN*X: /home/john/eyeos/eyeos/users/john/files/Documents
		// WIN:  C:\My Documents\john\eyeos\eyeos\users\john\files\Documents
		if (stripos($path, $absolutePathReferenceDir) === 0) {	
			$relativePath = utf8_substr($absolutePath, utf8_strlen($absolutePathReferenceDir));
			$path = $relativePath;
		}
		
		//$path is a relative path
		if (stripos($path, $referenceDirPath) === 0) {
			$relativePath = utf8_substr($path, utf8_strlen($referenceDirPath));
			$path = $relativePath;
		}
		
		if ($isWindows) {
			//$path starts with a Windows drive letter but referenceDir doesn't => ERROR
			if (preg_match('/^([a-z]{1}):/i', $path)) {
				throw new InvalidArgumentException('Unable to process paths resolution: ' . $path . ' starts with a Windows drive letter but ' . $referenceDirPath . ' does not.');
			}
		}
		
		//designated path is NOT in the reference directory => ERROR
		if (stripos(self::realpath($referenceDirPath.self::dirname($path)), $absolutePathReferenceDir) === false) {
			throw new InvalidArgumentException('Unable to process paths resolution: ' . $path . ' is not located in ' . $referenceDirPath . '.');
		}
		$resolvedPath = '';
		if ($flags & self::RESOLVEPATH_RETURN_REFDIR_RELATIVE) {
			$resolvedPath = '/'.utf8_substr(self::realpath($referenceDirPath.'/'.$path),
							utf8_strlen(self::unifyPath($absolutePathReferenceDir.'/')));
		} else {
			$resolvedPath = '.'.utf8_substr(self::realpath($referenceDirPath.'/'.$path),
							utf8_strlen(self::realpath('.')));
		}
		return $resolvedPath;
	}
	
	/**
	 * Deletes a directory recursively, even if it is not empty.
	 * 
	 * @param string $path
	 * @param boolean $onlyContents
	 * @return boolean
	 * @throws Exception if an error occurs while trying to delete a file
	 */
	public static function rmdirs($path, $onlyContents = false) {
		if (!file_exists($path)) {
			return true;
		}
		if (!is_dir($path) || is_link($path)) {
			if(!unlink($path)) {
				throw new Exception('Unable to delete file or link "' . $path . '".');
			}
			return true;
		}
		foreach (scandir($path) as $item) {
			if ($item != '.' && $item != '..') {
				if (!self::rmdirs($path . '/' . $item, false)) {
					@chmod($path . '/' . $item, 0777);
				}
				if (!self::rmdirs($path . '/' . $item, false)) {
					throw new Exception('Unable to delete "' . $path . '/' . $item . '".');
				}
			}
		}
		if(!$onlyContents) {
			return @rmdir($path);
		}
		return true;
	}
	
	/**
	 * Replaces all backslashes (Windows separator) with slashes, then
	 * replaces all multiple slashes with single ones.
	 * @param string $path
	 * @param boolean $backslashesOnly TRUE to replace backslashes only without then checking double slashes
	 *                                  (useful for full URL file://... as path), FALSE otherwise
	 * @return string
	 */
	public static function unifyPath($path, $backslashesOnly = false) {
		$path = strtr($path, '\\', '/');
		if (!$backslashesOnly) {
			$path = preg_replace('`//+`', '/', $path);
		}
		return $path;
	}
}
?>