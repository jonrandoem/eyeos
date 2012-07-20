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
 * TODO
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IInputStream {	
	const DEFAULT_READ_LENGTH = 8192;
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close();
	
	/**
	 * Reads $length bytes from this input stream (8192 by default, depending on PHP configuration)
	 * and puts the result in $data.
	 * 
	 * @param mixed &$data
	 * @return int
	 * @throws EyeIOException
	 */
	public function read(&$data, $length = IInputStream::DEFAULT_READ_LENGTH);
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function reset();
	
	/**
	 * 
	 * @param int $offset
	 * @param int $whence
	 * @throws EyeIOException
	 */
	public function seek($offset, $whence = SEEK_SET);
	
	/**
	 * 
	 * @param int $n
	 * @throws EyeIOException
	 */
	public function skip($n);
}

/**
 * TODO
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IOutputStream {	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close();
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function flush();
	
	/**
	 * 
	 * @param mixed &$data
	 * @param int $length
	 * @throws EyeIOException
	 */
	public function write(&$data, $length = null);
}

/**
 * TODO
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IReader {	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close();
	
	/**
	 * Reads $length bytes from specified input stream (8192 by default, depending on PHP configuration)
	 * and echoes the result to the output buffer.
	 * 
	 * @param int $length The total length of bytes to read or NULL to read data until the end.
	 * @param int $chunkSize The length of the chunks (in bytes) that will be read in the
	 *            loop until the end of the file.
	 * @return int
	 * @throws EyeIOException
	 */
	public function doEcho($length = null, $chunkSize = IInputStream::DEFAULT_READ_LENGTH);
	
	/**
	 * Reads $length bytes from specified input stream (8192 by default, depending on PHP configuration)
	 * and puts the result in $data.
	 * 
	 * @param mixed &$data
	 * @param int $length
	 * @return int
	 * @throws EyeIOException
	 */
	public function read(&$data, $length = null);
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function reset();
	
	/**
	 * @param int $n
	 * @param int
	 * @throws EyeIOException
	 */
	public function skip($n);
}

/**
 * TODO
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IWriter {	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close();
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function flush();
	
	/**
	 * 
	 * @param mixed &$data
	 * @param int $length
	 * @throws EyeIOException
	 */
	public function write(&$data, $length = null);
}

/**
 * TODO
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class BasicInputStreamReader implements IReader {
	/**
	 * @var IInputStream
	 */
	protected $in;
	
	/**
	 * @var array
	 */
	protected $params = null;
	
	/**
	 * 
	 * @param IInputStream $in
	 * @param array $params
	 */
	public function __construct(IInputStream $in, array $params = null) {
		$this->in = $in;
		$this->params = $params;
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close() {
		$this->in->close();
	}
	
	/**
	 * Reads $length bytes from specified input stream (8192 by default, depending on PHP configuration)
	 * and echoes the result to the output buffer.
	 * Note: At the end of the operation, the input stream will be closed.
	 * 
	 * @param int $length The total length of bytes to read or NULL to read data until the end.
	 * @param int $chunkSize The length of the chunks (in bytes) that will be read in the
	 *            loop until the end of the file.
	 * @return int The number of bytes read.
	 * @throws EyeIOException
	 */
	public function doEcho($length = null, $chunkSize = IInputStream::DEFAULT_READ_LENGTH) {
		if ($length !== null && (!is_int($length) || $length < 0)) {
			throw new EyeInvalidArgumentException('$length must be a positive integer.');
		}
		if (!is_int($chunkSize) || $chunkSize < 0) {
			throw new EyeInvalidArgumentException('$chunkSize must be a positive integer.');
		}
		
		$return = null;
		try {
			$data = null;
			$nbBytes = 0;
			
			if ($length === null) {
				while (($nbBytes = $this->in->read($data, $chunkSize)) !== 0) {
					$return += $nbBytes;
					echo $data;
					ob_flush();
					flush();
				}
			} else {
				if ($length < $chunkSize) {
					$chunkSize = $length;
				}
				while ($return < $length && ($nbBytes = $this->in->read($data, $chunkSize)) !== 0) {
					$return += $nbBytes;
					echo $data;
					ob_flush();
					flush();
					if ($length - $return < $chunkSize) {
						$chunkSize = $length - $return;
					}
				}
			}
			
			$this->close();
		} catch (Exception $e) {
			throw new EyeIOException('Unable to echo data from input stream.', 0, $e);
		}
		return $return;
	}
	
	/**
	 * Reads $length bytes from specified input stream (8192 by default, depending on PHP configuration)
	 * and puts the result in $data.
	 * 
	 * @param mixed &$data
	 * @param int $length
	 * @return int
	 * @throws EyeIOException
	 */
	public function read(&$data, $length = IInputStream::DEFAULT_READ_LENGTH) {
		return $this->in->read($data, $length);
	}
	
	/**
	 * Reads data from input stream and returns its content.
	 * Note: At the end of the operation, the handler on the file will be closed.
	 * 
	 * @param int $chunkSize The length of the chunks (in bytes) that will be read in the
	 *            loop until the end of the stream.
	 * @return string The data read.
	 * @throws EyeIOException
	 */
	public function readAll($chunkSize = IInputStream::DEFAULT_READ_LENGTH) {
		$return = '';
		try {
			$data = null;
			while ($this->in->read($data, $chunkSize) !== 0) {
				$return .= $data;
			}
			$this->close();
		} catch (Exception $e) {
			throw new EyeIOException('Unable to read data from input stream.', 0, $e);
		}
		return $return;
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function reset() {
		$this->in->reset();
	}
	
	/**
	 * @param int $n
	 * @throws EyeIOException
	 */
	public function skip($n) {
		$this->in->skip($n);
	}
}

/**
 * TODO
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class BasicOutputStreamWriter implements IWriter {
	/**
	 * @var IOutputStream
	 */
	protected $out;
	
	/**
	 * @var array
	 */
	protected $params = null;
	
	/**
	 * 
	 * @param IOutputStream $out
	 * @param array $params
	 */
	public function __construct(IOutputStream $out, array $params = null) {
		$this->out = $out;
		$this->params = $params;
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close() {
		$this->out->close();
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function flush() {
		$this->out->flush();
	}
	
	/**
	 * @param mixed &$data
	 * @param int $length
	 * @throws EyeIOException
	 */
	public function write(&$data, $length = null) {
		$this->out->write($data, $length);
	}
}
?>