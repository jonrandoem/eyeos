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
 * Defines a kind of exception class handling chaining.
 * 
 * @package kernel-libs
 * @subpackage exceptions
 */
interface IChainableException {

	/**
	 * @return string The exception message.
	 */
	public function getMessage();

	/**
	 * @return array(array) The IChainableException stack trace as a multidimensional
	 *               array of primitive types describing the exceptions, using the
	 *               chainabability of the exceptions to provide a better report.
	 */
	public function getChainedTrace();

	/**
	 * @return int The exception code
	 */
	public function getCode();

	/**
	 * @return string The filename in which the exception was thrown.
	 */
	public function getFile();

	/**
	 * @return string The line number where the exception was thrown.
	 */
	public function getLine();

	/**
	 * @return array(array) The IChainableException stack trace as a multidimensional
	 *               array of primitive types describing the exceptions.
	 */
	public function getTrace();

	/**
	 * @return array The IChainableException stack trace as an array of strings.
	 */
	public function getTraceAsString();

	/**
	 * @return IChainableException The previous exception.
	 */
	public function getPrevious();

	/**
	 * @return array(IChainableException) The IChainableException stack trace as an array
	 *               of IChainableException objects.
	 */
	public function getStackTrace();
	
	/**
	 * Prints the stack trace.
	 * @param boolean $htmlFormat Set to TRUE to use an HTML format in the output (<br/> separators)
	 *        or leave it to FALSE for a plain text output (\n separator).
	 * @return void
	 */
	public function printStackTrace($htmlFormat = false);

}

abstract class ExceptionStackUtil {
	const STRING_PREVIEW_MAXLENGTH = 40;
	
	protected static function getBeautifiedArgument($arg) {
		if (is_int($arg) || is_double($arg)) {
			return $arg;
		}
		if (is_string($arg)) {
			if (mb_strlen($arg) > self::STRING_PREVIEW_MAXLENGTH) {
				return '"' . mb_substr($arg, 0, self::STRING_PREVIEW_MAXLENGTH) . '"[..]';
			}
				return '"' . $arg . '"';
		}
		if (is_bool($arg)) {
			return $arg ? 'true' : 'false';
		}
		if (is_array($arg)) {
			return 'array(' . count($arg) . ')';
		}
		if (is_object($arg)) {
			return get_class($arg);
		}
		return gettype($arg);
	}
	
	public function getChainedTrace(Exception $e) {
		$stackTrace = $e->getStackTrace();
		
		$trace = array();
		foreach($stackTrace as $exception) {
			$exceptionTrace = $exception->getTrace();
			$trace[] = array(
				'exception' => get_class($exception),
				'code' => $exception->getCode(),
				'message' => $exception->getMessage(),
				'function' => $exceptionTrace[0]['function'],
				'file' => self::getSafeFilePath($exception->getFile()),
				'line' => $exception->getLine(),
				'trace' => $exception->getTraceAsString()
			);
			if (isset($exceptionTrace['class'])) {
				$trace['class'] = $exceptionTrace[0]['class'];
				$trace['type'] = $exceptionTrace[0]['type'];
			}
		}
		return $trace;
	}
	/**
	 * @param Exception $e
	 * @param bool $htmlFormat
	 * @return string
	 */
	protected static function getExceptionSummary($e, $htmlFormat) {
		$separator = $htmlFormat ? '<br/>' : "\n";
		$spacer = $htmlFormat ? '&nbsp;&nbsp;&nbsp;&nbsp;' : "\t";
		
		$emphasizer_begin = $htmlFormat ? '<b>' : '';
		$emphasizer_end = $htmlFormat ? '</b>' : '';
		
		$summary = $emphasizer_begin . get_class($e) . ': ' . $e->getMessage() . $emphasizer_end . $separator
			. $spacer . self::getSafeFilePath($e->getFile()) . ' (line ' . $e->getLine() . ') ';
		
		$fullTrace = $e->getTrace();
		$fullTraceSize = count($fullTrace);
		$i = 1;
		foreach($fullTrace as $trace) {
			// We skip the latest entry of the trace (the original include/require instruction)
			if ($i == $fullTraceSize) {
				break;
			}
			
			if (isset($trace['args'])) {
				$flatArgs = implode(', ', array_map(array(__CLASS__, 'getBeautifiedArgument'), $trace['args']));
			} else {
				$flatArgs = 'void';
			}
			
			//if [file] and [line] are not set, it means it's the trace of the last function that has been
			//started before the foreach(), so we skip the line separator (and spacer) here
			if (!isset($trace['file']) && !isset($trace['line'])) {
				$summary .= $trace['function'] . '(' . $flatArgs . ')';
			} else {
				$file = isset($trace['file']) ? self::getSafeFilePath($trace['file']) : '';
				$line = isset($trace['line']) ? ' (line ' . $trace['line'] . ') ' : '';
				$summary .= $separator . $spacer . $file . $line . $trace['function'] . '(' . $flatArgs . ')';
			}
			$i++;
		}
		return $summary;
	}
	
	public static function getSafeFilePath($filePath) {
		if (! LIB_EXCEPTIONS_USE_REALPATH) {
			$filePath = str_replace(realpath(EYE_ROOT . '/..'), '', $filePath);
		}
		return str_replace('\\', '/', $filePath);
	}
	
	/**
	 * Returns a formatted string of the stack trace contained in the given exception.
	 * 
	 * @param IChainableException
	 * @param bool $htmlFormal
	 * @return string
	 */
	public static function getStackTrace(Exception $e, $htmlFormat = false) {
		$separator = $htmlFormat ? '<br/>' : "\n";
		$stackTrace = '';
		
		$currentException = $e;
		while($currentException !== null) {
			$stackTrace .= self::getExceptionSummary($currentException, $htmlFormat) . $separator;
			if (method_exists($currentException, 'getPrevious') && $currentException->getPrevious() !== null) {
				$stackTrace .= $separator . 'Caused by:' . $separator;
				$currentException = $currentException->getPrevious();
			} else {
				$currentException = null;
			}
		}
		return $stackTrace;
	}
	
	/**
	 * @param IChainableException
	 * @param bool $htmlFormal
	 */
	public static function printStackTrace(Exception $e, $htmlFormat = false) {
		echo self::getStackTrace($e, $htmlFormat);
	}
}

?>
