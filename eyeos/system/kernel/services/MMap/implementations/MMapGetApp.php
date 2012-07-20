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
class MMapGetApp extends Kernel implements IMMap {
	private static $Logger = null;
	
	public static function getInstance() {
		self::$Logger = Logger::getLogger('system.services.MMap.MMapGetApp');
		return parent::getInstance(__CLASS__);
	}
	 
	public function checkRequest(MMapRequest $request) {
		if ($request->issetGET('getApplication') && $request->issetGET('checknum') && (!$request->issetGET('mobile')))  {
			return true;
		}
		return false;
	}
	
	private function handleClientMessageQueue(MMapResponse $response) {
		$messages = ClientMessageBusController::getInstance()->getQueue();
		
		// Check for client bus messages to be appended to the response
		if ($messages->count() > 0) {
			self::$Logger->info($messages->count() . ' client bus message(s) found, processing...');
			
			// Only if the current body/bodyrenderer is mappable to a control message
			$currentBodyRenderer = $response->getBodyRenderer();
			if ($currentBodyRenderer !== null && !$currentBodyRenderer instanceof DataManagerBodyRenderer) {
				self::$Logger->error('Cannot append client bus messages: unable to replace current BodyRenderer from class ' . get_class($currentBodyRenderer) . ', ignoring.');
				ClientMessageBusController::getInstance()->getQueue()->clear();
				return;
			}
			
			$messages = $messages->getArrayCopy();
			foreach($messages as &$message) {
				$message = $message->toArray();
			}
			$data = $currentBodyRenderer !== null ? $currentBodyRenderer->getRenderedBody() : $response->getBody();
			
			$newBody = array(
				'messages' => $messages,
				'data' => $data
			);
			
			// When using qx.io.ScriptLoader on the JS side, no callback proxy is available
			// to intercept control messages, so we're using a little workaround here by
			// calling directly eyeos._callbackProxyWithContent() with the messages queue in
			// argument.
			$controlMessageBodyRenderer = new ControlMessageBodyRenderer(ControlMessageBodyRenderer::TYPE_ENHANCEDDATA, $newBody);
			$responseContent = $controlMessageBodyRenderer->getRenderedBody();
			$response->appendToBody('eyeos._callbackProxyWithContent(null, null, null, ' . $responseContent . ');');
			
			ClientMessageBusController::getInstance()->getQueue()->clear();
		}
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response, AppExecutionContext $appContext = null) {
		$status = ob_get_status();
		$response->getHeaders()->append('Content-type:text/javascript');
		if(isset($status['name']) && $status['name'] != 'ob_gzhandler') {
		     ob_start("ob_gzhandler");
		}
		
		try {
			MMapManager::startSession();
			
			if (!$appContext instanceof AppExecutionContext) {
				$appContext = new AppExecutionContext();
				$appContext->initFromRequest($request);
			}
			
			$appDesc = $appContext->getApplicationDescriptor();
			
			// Check if the session has expired only if the application we want to execute is not "init" nor "logout"
			// FIXME: Not sure this way for checking session is the best here (maybe a flag in the metadata instead?)
			if ($appDesc->getName() != 'init' && $appDesc->getName() != 'logout') {
				MMapManager::checkSessionExpiration();
			}
			
			// Restore parent process if available
			try {
				$checknum = (int) $request->getGET('checknum');
				$procFather = ProcManager::getInstance()->getProcessByChecknum($checknum);
				ProcManager::getInstance()->setCurrentProcess($procFather);
				
				// Access control is based on current user, contained in the login context of
				// the current process, so we can only perform security checks when a process
				// is active.
				// In case no login context is defined, we can be sure that almost nothing unsafe
				// will be done, because this element is required in most of the operations.
				if ($procFather->getLoginContext() !== null) {
					SecurityManager::getInstance()->checkExecute($appDesc);
				}
			} catch (EyeProcException $e) {}
			
			// Start process (PHP)
			$this->startProcess($appContext);
			
			// Append necessary scripts and execute JS code (actually, only append it to the $response body)
			$appDesc->executeJavascript($appContext, $response);

		} catch (Exception $e) {
			self::$Logger->error('Uncaught exception while processing request: ' . $request);
			self::$Logger->error('Exception message: ' . $e->getMessage());
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			
			// Special processing on session expiration
			if ($e instanceof EyeSessionExpiredException) {
				$controlMessageBodyRenderer = new ControlMessageBodyRenderer(ControlMessageBodyRenderer::TYPE_SESSION_EXPIRED);
			}
			// Other type of error
			else {
				// Remove incomplete process
				$proc = $appContext->getProcess();
				if ($proc instanceof Process) {
					try {
						ProcManager::getInstance()->kill($proc);
					} catch (Exception $e) {
						self::$Logger->error('Cannot kill incomplete process: ' . $proc);
						self::$Logger->error('Exception message: ' . $e->getMessage());
					}
				}
				
				$controlMessageBodyRenderer = new ControlMessageBodyRenderer(ControlMessageBodyRenderer::TYPE_EXCEPTION, $e);
			}
			
			// When using qx.io.ScriptLoader on the JS side, no callback proxy is available
			// to intercept control messages, so we're using a little workaround here by
			// calling directly eyeos._callbackProxyWithContent() with the exception summary
			// in argument.
			$responseContent = $controlMessageBodyRenderer->getRenderedBody();
			$response->setBody('eyeos._callbackProxyWithContent(null, null, null, ' . $responseContent . ');');
		}
		
		$this->handleClientMessageQueue($response);
	}
	
	private function startProcess(AppExecutionContext $appContext) {
		$appProcess = $appContext->getProcess();
		
		// if no process is already present in the context, create a new one
		if ($appProcess === null) {
			$appMeta = $appContext->getApplicationDescriptor()->getMeta();
			if ($appMeta === null) {
				throw new EyeNullPointerException('Missing metadata for application "' . $appContext->getApplicationDescriptor()->getName(). '"');
			}
			$sysParams = $appMeta->get('eyeos.application.systemParameters');
			
			if ($appContext->getParentProcess() === null) {
				// TODO should we also prevent anonymous execution to JS-only apps?
				if (!isset($sysParams['anonymous']) || $sysParams['anonymous'] != 'true') {
					self::$Logger->warn('Execution without checknum denied for application "' . $appContext->getApplicationDescriptor()->getName() . '".');
					throw new EyeMMapException($appContext->getApplicationDescriptor()->getName() . ' application cannot be executed without a checknum.');
				}
			}
			
			// execute new process
			$appProcess = new Process($appContext->getApplicationDescriptor()->getName());
			ProcManager::getInstance()->execute($appProcess);
			$appContext->setProcess($appProcess);
			
			// SUID
			if (isset($sysParams['suid']) && $sysParams['suid'] == 'true' && !empty($sysParams['owner'])) {
				try {
					$owner = UMManager::getInstance()->getUserByName($sysParams['owner']);
					
					// force login with owner
					try {
						$subject = new Subject();
						$subject->getPrivateCredentials()->append(new EyeosPasswordCredential($sysParams['owner'], $owner->getPassword(), false));
						$loginContext = new LoginContext('eyeos-login', $subject);
						$loginContext->login();
					} catch (Exception $e) {
						self::$Logger->error('Exception caught while trying to elevate privileges by SUID to owner '
							. $sysParams['owner'] . ' in application "' . $appContext->getApplicationDescriptor()->getName() . '".');
						
						// kill unfinished process
						ProcManager::getInstance()->kill($appContext->getProcess());
						
						throw $e;
					}
					if (self::$Logger->isInfoEnabled()) {
						self::$Logger->info('Privileges elevation successful with owner ' . $sysParams['owner'] . ' for application "' . $appContext->getApplicationDescriptor()->getName() . '".');
					}
					
					ProcManager::getInstance()->setProcessLoginContext($appProcess->getPid(), $loginContext);
				} catch (Exception $e) {
					self::$Logger->error('Cannot elevate privileges with owner ' . $sysParams['owner'] . ' for application "' . $appContext->getApplicationDescriptor()->getName() . '".');
					throw $e;
				}
			}
		}
	}
}

/**
 *
 * @package kernel-services
 * @subpackage MMap
 */
class AppExecutionContext {
	const ANONYMOUS_CHECKNUM = -1;

	/**
	 * @var MMapRequest
	 */
	protected $request = null;

	protected $applicationDescriptor = null;
	protected $parentProcess = null;
	protected $process = null;
	protected $includeBody = true;
	protected $executeJavascript = true;
	protected $args = null;


	public function __construct() {
		$this->args = new ArrayList();
	}

	public function getApplicationDescriptor() {
		return $this->applicationDescriptor;
	}

    public function setRequest ($request) {
        $this->request = $request;
    }

    public function getRequest () {
        return $this->request;
    }

	/**
	 * @return ArrayList
	 */
	public function getArgs() {
		return $this->args;
	}

	public function getExecuteJavascript() {
		return $this->executeJavascript;
	}

	public function getIncludeBody() {
		return $this->includeBody;
	}

	public function getParentProcess() {
		if ($this->parentProcess === null) {
			if ($this->request->issetGET('checknum')) {
				$checknum = (int) $this->request->getGET('checknum');
				if ($checknum !== self::ANONYMOUS_CHECKNUM) {
					$procFather = ProcManager::getInstance()->getProcessByChecknum($checknum);
					$this->parentProcess = $procFather;
				}
			}
		}
		return $this->parentProcess;
	}

	public function getProcess() {
		return $this->process;
	}

	public function initFromRequest(MMapRequest $request) {
		$this->request = $request;
		$get = $request->getGET();
		$this->setApplicationDescriptor(new EyeosApplicationDescriptor($get['getApplication']));

		if(isset($get['includeBody'])) {
			$this->setIncludeBody($get['includeBody']);
		}
		if(isset($get['args'])) {
			$args = DataManager::getInstance()->doInput($get['args']);
			if (is_array($args)) {
				$this->setArgs(new ArrayList($args));
			} else {
				Logger::getLogger('system.services.MMap.AppExecutionContext')->warn('Argument in URL is not an array, ignoring. (Given value: ' . $args . ')');
			}
		}
	}

	public function setApplicationDescriptor(EyeosApplicationDescriptor $appDesc) {
		$this->applicationDescriptor = $appDesc;
	}

	public function setArgs(ArrayList $args) {
		$this->args = $args;
		if ($this->process !== null) {
			$this->process->setArgs($args);
		}
	}

	public function setExecuteJavascript($executeJavascript) {
		$this->executeJavascript = $executeJavascript ? true : false;
	}

	public function setIncludeBody($includeBody) {
		$this->includeBody = $includeBody ? true : false;
	}

	public function setParentProcess(Process $parentProcess) {
		$this->parentProcess = $parentProcess;
	}

	public function setProcess(Process $process) {
		$this->process = $process;

		// Copy args from process to context
		if ($this->args->isEmpty() && !$process->getArgs()->isEmpty()) {
			$this->args = $process->getArgs();
		}
		// Copy args from context to process
		else if (!$this->args->isEmpty() && $process->getArgs()->isEmpty()) {
			$process->setArgs($this->args);
		}

	}
}

class AppMobileExecutionContext extends AppExecutionContext {

    public function __construct() {
		$this->setArgs(new ArrayList());
	}

    public function initFromRequest(MMapRequest $request) {
        $this->setRequest($request);
        $get = $request->getGET();

        $this->setApplicationDescriptor(new EyeMobileApplicationDescriptor($get['getApplication']));
        if(isset($get['includeBody'])) {
            $this->setIncludeBody($get['includeBody']);
        }

        if(isset($get['args'])) {
            $args = DataManager::getInstance()->doInput($get['args']);
            if (is_array($args)) {
                $this->setArgs(new ArrayList($args));
            } else {
                Logger::getLogger('system.services.MMap.AppDroidExecutionContext')->warn('Argument in URL is not an array, ignoring. (Given value: ' . $args . ')');
            }
        }
    }

    public function setApplicationDescriptor(EyeMobileApplicationDescriptor $appDesc) {
        $this->applicationDescriptor = $appDesc;
    }
}
?>