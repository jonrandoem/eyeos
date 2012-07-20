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
 * @subpackage MMap
 */
interface IMMap {
	public function checkRequest(MMapRequest $request);
	public function processRequest(MMapRequest $request, MMapResponse $response);
}

/**
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class MMapRequest {
	protected $url;
	protected $browser;
	protected $ip;
	protected $referer;
	protected $getVar;
	protected $postVar;
	protected $cookieVar;
	protected $serverVar;
	
	public function __construct() {
		$this->ip = $_SERVER['REMOTE_ADDR'];
		$this->browser = $_SERVER['HTTP_USER_AGENT'];
		$this->referer = (isset($_SERVER['HTTP_REFERER'])) ? $_SERVER['HTTP_REFERER'] : '';
		$this->url = $_SERVER['REQUEST_URI'];
		
		$this->getVar = $_GET;
		$this->postVar = $_POST;
		$this->cookieVar = $_COOKIE;
		$this->serverVar = $_SERVER;
	}
	
	public function getBrowser() {
		return $this->browser;
	}
	
	public function getCOOKIE($key = null) {
		if ($key !== null) {
			return $this->cookieVar[$key];
		}
		return $this->cookieVar;
	}
	
	public function getGET($key = null) {
		if ($key !== null) {
			return $this->getVar[$key];
		}
		return $this->getVar;
	}
	
	public function getIp() {
		return $this->ip;
	}
	
	public function getPOST($key = null) {
		if ($key !== null) {
			return $this->postVar[$key];
		}
		return $this->postVar;
	}
	
	public function getReferer() {
		return $this->referer;
	}
	
	public function getSERVER($key = null) {
		if ($key !== null) {
			return $this->serverVar[$key];
		}
		return $this->serverVar;
	}
	
	public function getUrl() {
		return $this->url;
	}
	
	public function issetGET($key) {
		return isset($this->getVar[$key]);
	}
	
	public function issetPOST($key) {
		return isset($this->postVar[$key]);
	}

	public function issetSERVER($key) {
		return isset($this->serverVar[$key]);
	}
	
	public function setBrowser($browser) {
		$this->browser = $browser;
	}
	
	public function setGET($key, $value) {
		$this->getVar[$key] = $value;
	}
	
	public function setIp($ip) {
		$this->ip = $ip;
	}
	
	public function setPOST($key, $value) {
		$this->postVar[$key] = $value;
	}
	
	public function setReferer($referer) {
		$this->referer = $referer;
	}
	
	public function setUrl($url) {
		$this->url = $url;
	}
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
			}
		}
		$string = utf8_substr($string, 0, -1) . ']';
		return $string;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class MMapResponse {
	/**
	 * @var ISet
	 */
	protected $headers;
	
	/**
	 * @var string
	 */
	protected $body = '';
	
	/**
	 * @var IMMapResponseBodyRenderer
	 */
	protected $bodyRenderer = null;
	
	/**
	 * @var bool
	 */
	protected $valid = true;
	
	
	/**
	 * Constructs a new MMapResponse object, optionally with the given $headers.
	 *  
	 * @param mixed $headers An array or an ISet object containing the header fields definitions.
	 */
	public function __construct($headers = null) {
		if ($headers !== null) {
			if (is_array($headers)) {
				$this->headers = new Set($headers);
			} else if ($headers instanceof ISet) {
				$this->headers = $headers;
			} else {
				throw new EyeInvalidArgumentException('$headers must be an array or an ISet object.');
			}
		} else {
			$this->headers = new Set();
		}
	}
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
			}
		}
		$string = utf8_substr($string, 0, -1) . ']';
		return $string;
	}
	
	public function appendToBody($data) {
		$this->body .= $data;
	}
	
	public function getBody() {
		return $this->body;
	}
	
	public function getBodyRenderer() {
		return $this->bodyRenderer;
	}
	
	public function getHeaders() {
		return $this->headers;
	}
	
	public function isValid() {
		return $this->valid;
	}
	
	public function setBody($body) {
		if (!is_string($body)) {
			throw new EyeInvalidArgumentException('$body must be a string.');
		}
		$this->body = $body;
	}
	
	public function setBodyRenderer(IMMapResponseBodyRenderer $bodyRenderer) {
		$this->bodyRenderer = $bodyRenderer;
	}
	
	public function setValid($valid) {
		$valid = $valid ? true : false;
		if (!$this->valid && $valid) {
			throw new EyeLogicException('Cannot set valid a response that was previously set invalid.');
		}
		$this->valid = $valid;
	}

        public function clear() {
            $this->bodyRenderer = null;
            $this->body = null;
        }
}

/**
 * 
 * @package kernel-services
 * @subpackage MMap
 */
interface IMMapResponseBodyRenderer {
	/**
	 * TOOD
	 */
	public function __toString();
	
	/**
	 * TODO
	 */
	public function doRender();
	
	/**
	 * TODO
	 */
	public function getRenderedBody();
}

/**
 * TODO May be moved to a special folder for all BodyRenderers
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class FileReaderBodyRenderer implements IMMapResponseBodyRenderer {
	private $fileInputStream = null;
	
	public function __construct(FileInputStream $fileInputStream) {
		$this->fileInputStream = $fileInputStream;
	}
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		$doSubstr = false;
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
				$doSubstr = true;
			}
		}
		$string = ($doSubstr ? utf8_substr($string, 0, -1) : $string) . ']';
		return $string;
	}
	
	public function doRender() {
		$reader = new FileReader($this->fileInputStream);
		$reader->echoFile();
	}
	
	public function getRenderedBody() {
		$reader = new FileReader($this->fileInputStream);
		return $reader->readAll();
	}
}

/**
 * TODO May be moved to a special folder for all BodyRenderers
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class MultipleReadersBodyRenderer implements IMMapResponseBodyRenderer {
	private $inputStreams = null;
	
	public function __construct(array $inputStreams) {
		$this->inputStreams = $inputStreams;
	}
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		$doSubstr = false;
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
				$doSubstr = true;
			}
		}
		$string = ($doSubstr ? utf8_substr($string, 0, -1) : $string) . ']';
		return $string;
	}
	
	public function doRender() {
		foreach($this->inputStreams as $inputStream) {
			$reader = new BasicInputStreamReader($inputStream);
			$reader->doEcho();
			unset($reader);
		}
	}
	
	public function getRenderedBody() {
		$buffer = '';
		foreach($this->inputStreams as $inputStream) {
			$reader = new BasicInputStreamReader($inputStream);
			$buffer .= $reader->readAll();
			unset($reader);
		}
		return $buffer;
	}
}

/**
 * TODO May be moved to a special folder for all BodyRenderers
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class DataManagerBodyRenderer implements IMMapResponseBodyRenderer {
	private $data = null;
	
	public function __construct($data) {
		$this->data = $data;
	}
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		$doSubstr = false;
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
				$doSubstr = true;
			}
		}
		$string = ($doSubstr ? utf8_substr($string, 0, -1) : $string) . ']';
		return $string;
	}
	
	public function doRender() {
		echo $this->getRenderedBody();
	}
	
	public function getRenderedBody() {
		return DataManager::getInstance()->doOutput($this->getBodyData());
	}
	
	public function getBodyData() {
		return $this->data;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class ControlMessageBodyRenderer extends DataManagerBodyRenderer {
	const HEADER = '__eyeos_specialControlMessage_header';
	const BODY = '__eyeos_specialControlMessage_body';
	const OPTIONS = '__eyeos_specialControlMessage_options';
	
	const TYPE_EXCEPTION = '__control_exception';
	const TYPE_DEBUG = '__control_debug';
	const TYPE_ENHANCEDDATA = '__control_enhancedData';
	const TYPE_SESSION_EXPIRED = '__control_expiration';
	
	const EXCEPTION_KEY_CODE = 'code';
	const EXCEPTION_KEY_NAME = 'name';
	const EXCEPTION_KEY_MESSAGE = 'message';
	const EXCEPTION_KEY_STACKTRACE = 'stackTrace';
	
	/**
	 * @var string
	 */
	private $type = null;
	
	/**
	 * @var mixed
	 */
	private $body = null;
	
	/**
	 * @var array
	 */
	private $options = null;
	
	/**
	 * 
	 * @param string $type
	 * @param mixed $body
	 * @param array $options
	 */
	public function __construct($type, $body = null, $options = null) {
		$this->type = $type;
		
		if ($body instanceof Exception) {
			$this->body = self::convertExceptionToJson($body);
		} else if (is_array($body)) {
			$this->body = $body;
		} else {
			$this->body = (string) $body;
		}
		$this->options = $options;
	}
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		$doSubstr = false;
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
				$doSubstr = true;
			}
		}
		$string = ($doSubstr ? utf8_substr($string, 0, -1) : $string) . ']';
		return $string;
	}
	
	/**
	 * Provides a JSON-compatible summary of the given exception.
	 * 
	 * @param Exception $e
	 * @return array
	 */
	public static function convertExceptionToJson(Exception $e) {
		$error = array(
			self::EXCEPTION_KEY_CODE => $e->getCode(),
			self::EXCEPTION_KEY_NAME => get_class($e),		//TODO: Add a "translation" of exceptions (e.g. EyeSecurityException => "Security error")
			self::EXCEPTION_KEY_MESSAGE => $e->getMessage()
		);
		
		if ($e instanceof IChainableException && SYSTEM_TYPE == 'debug') {
			$error[self::EXCEPTION_KEY_STACKTRACE] = $e->getChainedTrace();
		} else {
			$error[self::EXCEPTION_KEY_STACKTRACE] = '(Stack trace not available)';
		}
		return $error;
	}
	
	public function getBody() {
		return $this->body;
	}
	
	public function getBodyData() {
		return $this->toArray();
	}
	
	public function getOptions() {
		return $this->options;
	}
	
	public function getType() {
		return $this->type;
	}
	
	/**
	 * Returns an array containing all the data of this control message in an array
	 * that can be later encoded into JSON.
	 * 
	 * @return array
	 */
	public function toArray() {
		return array(
			self::HEADER => $this->type,
			self::BODY => $this->body,
			self::OPTIONS => $this->options
		);
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage MMap
 */
final class ClientMessageBusController {
	/**
	 * @var ArrayList
	 */
	private $messageQueue;
	
	private static $Instance = null;
	
	protected function __construct() {
		$this->messageQueue = new ArrayList();
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new ClientMessageBusController();
		}
		return self::$Instance;
	}
	
	/**
	 * @return ArrayList
	 */
	public function getQueue() {
		return $this->messageQueue;
	}
	
	/**
	 * @param ClientBusMessage $message
	 */
	public function queueMessage(ClientBusMessage $message) {
		$this->messageQueue[] = $message;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class ClientBusMessage {
	/**
	 * @var string
	 */
	protected $type = null;
	
	/**
	 * @var string
	 */
	protected $eventName = null;
	
	/**
	 * @var mixed
	 */
	protected $eventData = null;
	
	/**
	 * Constructs a new ClientBusMessage.
	 * 
	 * @param string $type
	 * @param string $eventName
	 * @param mixed $eventData
	 */
	public function __construct($type, $eventName, $eventData) {
		$this->type = $type;
		$this->eventName = $eventName;
		$this->eventData = $eventData;
	}
	
	public function getEventData() {
		return $this->eventData;
	}
	
	public function getEventName() {
		return $this->eventName;
	}
	
	public function getType() {
		return $this->type;
	}
	
	public function toArray() {
		return array(
			'type' => $this->type,
			'eventName' => $this->eventName,
			'eventData' => $this->eventData
		);
	}
}
?>