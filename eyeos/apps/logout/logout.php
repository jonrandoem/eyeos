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

abstract class LogoutApplication extends EyeosRestrictedApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {

		$myMemoryManager = MemoryManager::getInstance();
		Kernel::enterSystemMode();
		$isExternLogin = $myMemoryManager->get('isExternLogin');
		$loginPage = $myMemoryManager->get('loginPage');
		Kernel::exitSystemMode();

		$context->getArgs()->append($isExternLogin);
		if($isExternLogin){
		    $context->getArgs()->append($loginPage);
		}
	}

	public static function closeSession() {
		$procManager = ProcManager::getInstance();

		$logger = Logger::getLogger('apps.logout');
		if ($logger->isInfoEnabled()) {
			$username = null;
			$loginContext = $procManager->getCurrentProcess()->getLoginContext();
			if ($loginContext !== null) {
				$username = $loginContext->getEyeosUser();
			}
			$username = ($username instanceof EyeosUser) ? $username->getName() : '<Unknown>';
		}

		self::markOffline();

		
		if (ini_get("session.use_cookies")) {
			$params = session_get_cookie_params();
			setcookie(session_name(), '', time() - 42000,
				$params["path"], $params["domain"],
				$params["secure"], $params["httponly"]
			);
		}

		session_destroy();

		if ($logger->isInfoEnabled()) {
			Logger::getLogger('apps.logout')->info('User ' . $username . ' has logged out');
		}
	}

	/**
	 * Notify all contact that the user goes offline and remove subscriptions to NetSync channels
	 */
	private function markOffline () {
		$procList = ProcManager::getInstance()->getProcessesList();

		foreach($procList as $pid => $proc) {			
			if ($proc == 'session') {
				$userId = ProcManager::getInstance()->getProcessByPid($pid)->getLoginContext()->getEyeosUser()->getId();
			}
		}

		if (!$userId) {
			return;
		}
		
		$subscriptionProvider = new SqlSubscriptionProvider();

		// Notify to all Contacts that the user goes offline
		$contacts = PeopleController::getInstance()->getAllContacts($userId);
		$ids = array();
		$myCometSender = new CometSenderLongPolling();
		foreach ($contacts as $contact) {
			$id = $contact->getRelation()->getSourceId();
			if ($id == $userId) {
				$id = $contact->getRelation()->getTargetId();
			}
			$message = new NetSyncMessage('status', 'offline', $id, $userId);
			$myCometSender->send($message);
		}

		// Remove Subscriptions to NetSync channels
		$subscriptionProvider->removeAllSubscriptions($userId);
	}
}

?>