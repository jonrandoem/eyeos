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
class MMapManager extends Kernel implements IMMap {
	private static $Logger = null;
	
	/**
	 * @var MMapRequest
	 */
	private static $CurrentRequest = null;
	
	/**
	 * @var MMapResponse
	 */
	private static $CurrentResponse = null;
	
	 
	public function checkRequest(MMapRequest $request) {
		return false;
	}
	
	/**
	 * @throws EyeSessionExpiredException
	 */
	public static function checkSessionExpiration() {
		Kernel::enterSystemMode();
		$regenerated = MemoryManager::getInstance()->get('regenerated', 1);
		Kernel::exitSystemMode();
		if($regenerated == 1) {
			MemoryManager::getInstance()->reset();
			throw new EyeSessionExpiredException('Session expired.');
		}
	}
	
	private function getAllMMapManagers() {
		$directory = new DirectoryIterator(SERVICE_MMAP_PATH . '/' . IMPLEMENTATIONS_DIR);
		$MMapImplementations = array();
		foreach ($directory as $fileInfo) {
    		if(!$fileInfo->isDot() && $fileInfo->getFilename() != '.svn' 
    			&& $fileInfo->getFilename() != 'MMapManager.php' && $fileInfo->getFilename() != 'MMapScreen.php') {
    			$MMapImplementations[] = $fileInfo->getBasename('.php');
    		}
		}
		return $MMapImplementations;
	}
	
	/**
	 * Returns the request currently processed by the system.
	 * 
	 * @return MMapRequest
	 */
	public static function getCurrentRequest() {
		//TODO maybe some security checks here
		return self::$CurrentRequest;
	}
	
	/**
	 * Returns the response currently processed by the system.
	 * 
	 * @return MMapResponse
	 */
	public static function getCurrentResponse() {
		//TODO maybe some security checks here
		return self::$CurrentResponse;
	}
	
	public static function getInstance() {
		self::$Logger = Logger::getLogger('system.services.MMap.MMapManager');
		return parent::getInstance(__CLASS__);
	}

        /*
         * every time a data message for the client dbus is sent from php,
         * it's stored in a buffer, an it's not sent until calling this function.
         */
	private function handleClientMessageQueue(MMapResponse $response) {
		$messages = ClientMessageBusController::getInstance()->getQueue();
		
		// Check for client bus messages to be appended to the response
		if ($messages->count() > 0) {
			self::$Logger->info($messages->count() . ' client bus message(s) found, processing...');
			
			// Only if the current body/bodyrenderer is mappable to a control message
			$currentBodyRenderer = $response->getBodyRenderer();
			if ($currentBodyRenderer !== null && !$currentBodyRenderer instanceof DataManagerBodyRenderer) {
				self::$Logger->error('Cannot append client bus messages: unable to replace current BodyRenderer from class ' . get_class($currentBodyRenderer) . ', ignoring.');
				return;
			}
			
			$messages = $messages->getArrayCopy();
			foreach($messages as &$message) {
				$message = $message->toArray();
			}
			
			if ($currentBodyRenderer !== null) {
				if ($currentBodyRenderer instanceof ControlMessageBodyRenderer) {
					$data = $currentBodyRenderer->getBodyData();
				} else {
					$data = $currentBodyRenderer->getRenderedBody();
				}
			} else {
				$data = $response->getBody();
			}			
			
			$newBody = array(
				'messages' => $messages,
				'data' => $data
			);
			
			$controlMessageBodyRenderer = new ControlMessageBodyRenderer(ControlMessageBodyRenderer::TYPE_ENHANCEDDATA, $newBody);
			$response->setBodyRenderer($controlMessageBodyRenderer);
		}
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response) {
		self::$Logger->debug('Processing request: ' . $request);
		
		self::$CurrentRequest = $request;
		self::$CurrentResponse = $response;
		
		try {
			$managerFound = false;
			foreach($this->getAllMMapManagers() as $MMapManagerName) {
				$myManager = call_user_func(array($MMapManagerName, 'getInstance'));
				if($myManager->checkRequest($request)) {
					$managerFound = true;
					$myManager->processRequest($request, $response);
                                        break;
				}
			}
			
			// default manager => draw initial screen
			if (!$managerFound) {
				$myManager = MMapScreen::getInstance();
				$myManager->processRequest($request, $response);
			}
		} catch (Exception $e) {
			$response->getHeaders()->append('Content-type:text/plain');
			self::$Logger->error('Uncaught exception while processing request: ' . $request);
			self::$Logger->error('Exception message: ' . $e->getMessage() . ' [' . $e->getFile() . ' - l.' . $e->getLine() . ']');
			self::$Logger->error(ExceptionStackUtil::getStackTrace($e, false));
			
			if ($e instanceof EyeSessionExpiredException) {
				$controlMessageBodyRenderer = new ControlMessageBodyRenderer(ControlMessageBodyRenderer::TYPE_SESSION_EXPIRED);
			} else {
				$controlMessageBodyRenderer = new ControlMessageBodyRenderer(ControlMessageBodyRenderer::TYPE_EXCEPTION, $e);
			}
			
			$response->setBodyRenderer($controlMessageBodyRenderer);
		}
		
		if (self::$Logger->isInfoEnabled()) {
			self::$Logger->info('Finished processing request: ' . $request . ', preparing to render response...');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug((string) $response);
			}
		}
		
		$this->handleClientMessageQueue($response);
		
		$this->renderResponse($response);
		
		if (self::$Logger->isInfoEnabled()) {
			self::$Logger->info('Finished rendering response');
		}
	}

        public function doResponse(MMapResponse $response) {
            $this->handleClientMessageQueue($response);
            $this->renderResponse($response);
        }
	
	private function renderResponse(MMapResponse $response) {
		if (!$response->isValid()) {
			if (self::$Logger->isInfoEnabled()) {
				self::$Logger->info('Skipping invalid response: ' . $response);
			}
			return;
		}
		try {
            // headers
			foreach($response->getHeaders() as $headerField) {
				self::$Logger->info($headerField);
				if (is_array($headerField)) {
					if (isset($headerField[1])) {
						if (isset($headerField[2])) {
							header($headerField[0], $headerField[1], $headerField[2]);
						} else {
							header($headerField[0], $headerField[1]);
						}
					} else {
						header($headerField[0]);
					}
				} else {
                    //if ( !ob_get_status() ) {
                    header($headerField);
                    //}
				}
			}
			
			// body
			$bodyRenderer = $response->getBodyRenderer();
			if ($bodyRenderer !== null) {
				self::$Logger->info('Using BodyRenderer: ' . $bodyRenderer);
				$bodyRenderer->doRender();
			} else {
				self::$Logger->info('Using raw body');
				echo $response->getBody();
			}
		} catch (Exception $e) {
			self::$Logger->error('Exception caught while rendering response!');
			self::$Logger->error('Exception message: ' . $e->getMessage());
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
				self::$Logger->debug((string) $response);
			}
			
			// the exception will be finally caught by the general try/catch block in index.php
			throw $e;
		}
	}
	
	/**
	 * Starts or restore the session from the cookie if it has not already been started.
	 */
	public static function startSession() {
		if (session_id() === '') {
			session_name(COOKIE_NAME);
			/**
			 * In Debian we need root permission to clean session with the garbage
			 * collector. We hide this error because we save session on our
			 * directory on eyeos/tmp
			 */
			@session_start();
			self::$Logger->info('Session started/restored: ID=' . session_id());
		}
	}
}
?>