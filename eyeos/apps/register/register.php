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

abstract class RegisterApplication extends EyeosRestrictedApplicationExecutable {
	// FIXME: should not work with metaManager !!!
	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		$meta = MetaManager::getInstance()->retrieveMeta(kernel::getInstance('SecurityManager'))->getAll();

		if(isset($meta['register']) && ($meta['register'] == 'false')) {
			$currentProc = ProcManager::getInstance()->getCurrentProcess();
			ProcManager::getInstance()->kill($currentProc);
			$context->setExecuteJavascript(false);
		}
	}

	public static function register($params) {
        /* verify permissions again */
		$meta = MetaManager::getInstance()->retrieveMeta(kernel::getInstance('SecurityManager'))->getAll();
		if(isset($meta['register']) && ($meta['register'] == 'false')) {
			return 'unable to register';
		}
		$procManager = ProcManager::getInstance();
		$savedLoginContext = $procManager->getCurrentProcess()->getLoginContext();
		
		try {
			$name = $params[0];
			$surname = $params[1];
			$username = $params[2];
			$password = $params[3];
			$email = $params[4];

			if(!$name || !$surname || !$username || !$password || !$email) {
				return 'incomplete';
			}
			
			$myUManager = UMManager::getInstance();
	
			// check existence
			$exists = false;
			try {
				$myUManager->getUserByName($username);
				$exists = true;
			} catch (EyeNoSuchUserException $e) {}
			
			if ($exists) {
				throw new EyeUserAlreadyExistsException('User with name "' . $username . '" already exists.');
			}

			$meta = new BasicMetaData();
			$meta->set('eyeos.user.email', $email);
			$userIds = MetaManager::getInstance()->searchMeta(new EyeosUser(),$meta);

			if(count($userIds)!=0){
				throw new EyeUserAlreadyExistsException('User with email "' . $email . '" already exists.');
			}
			//create the user
			$user = $myUManager->getNewUserInstance();
			$user->setName($username);
			$user->setPassword($password, true);
			$user->setPrimaryGroupId($myUManager->getGroupByName(SERVICE_UM_DEFAULTUSERSGROUP)->getId());
			$myUManager->createUser($user);
	
			//login in the system with new user, if this works, for sure the user exists, even with the
			//most complex and strange errors
			$myUManager = UMManager::getInstance();
			$subject = new Subject();
			$loginContext = new LoginContext('eyeos-login', $subject);
			$cred = new EyeosPasswordCredential();
			$cred->setUsername($username);
			$cred->setPassword($password, true);
			$subject->getPrivateCredentials()->append($cred);
			$loginContext->login();
	
			//we are logged in, so we are going to change the credentials of login
			$procManager = ProcManager::getInstance();
			$procList = $procManager->getProcessesList();
			$currentProcess = $procManager->getCurrentProcess();
			$procManager->setProcessLoginContext($currentProcess->getPid(), $loginContext);
			foreach($procList as $key => $value) {
				if(strtolower($value) == 'login') {
					//we are in another login in execution, this is a refresh, lets see
					//if the login was correct with the old login.
					$loginProcess = $procManager->getProcessByPid($key);
					$procManager->setProcessLoginContext($loginProcess->getPid(), $loginContext);
				}
			}
			
			// save basic metadata from form
			$userMeta = MetaManager::getInstance()->retrieveMeta($user);
			$userMeta->set('eyeos.user.firstname', strip_tags($name));
			$userMeta->set('eyeos.user.lastname', strip_tags($surname));
			$userMeta->set('eyeos.user.email', $email);
			$userMeta = MetaManager::getInstance()->storeMeta($user, $userMeta);
			
			return 'success';

		} catch (Exception $e) {
			// ROLLBACK

			// restore login context (root probably)
			$procManager->setProcessLoginContext($procManager->getCurrentProcess()->getPid(), $savedLoginContext);

////		delete invalid user created
//			if (isset($user) && $user instanceof IPrincipal) {
//				try {
//					UMManager::getInstance()->deletePrincipal($user);
//				} catch (Exception $e2) {}
//			}

			throw $e;
		}
	}
}

?>