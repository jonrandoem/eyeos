<?php
/*

				                   ____  _____
				  ___  __  _____  / __ \/ ___/
				 / _ \/ / / / _ \/ / / /\__ \
				/  __/ /_/ /  __/ /_/ /___/ /
				\___/\__, /\___/\____//____/
				    /____/        2.0 Future

               Cloud Computing Operating System
                        www.eyeos.org

                  eyeos is released under the
		GNU Affero General Public License Version 3 (AGPL3)
         provided with this release in the file "LICENSE"
        or via web at http://gnu.org/licenses/agpl-3.0.txt

        Copyright 2005-2009 eyeos Team (team@eyeos.org)
*/

/**
 * An application to manage user.
 * Administrator can create/modify/delete user, assign or unassing to a Workgroup
 */
abstract class UserManagementApplication extends EyeosApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		$buffer = '';
		$basePath = EYE_ROOT . '/' . APPS_DIR . '/usermanagement/';
		$buffer .= file_get_contents($basePath . 'usermanagement.js');
		$buffer .= file_get_contents($basePath . 'pages/users/userpage.js');
		$buffer .= file_get_contents($basePath . 'utils/userList.js');
		$buffer .= file_get_contents($basePath . 'pages/groups/grouppage.js');
		$buffer .= file_get_contents($basePath . 'utils/groupList.js');
		$buffer .= file_get_contents($basePath . 'pages/groups/groupTabView.js');
		$buffer .= file_get_contents($basePath . 'pages/groups/groupInfoPage.js');
		$buffer .= file_get_contents($basePath . 'pages/groups/groupManagePage.js');
		$buffer .= file_get_contents($basePath . 'pages/groups/assignWindow.js');
		$buffer .= file_get_contents($basePath . 'pages/system/system.js');
		$response->appendToBody($buffer);
	}

	public static function saveRegisterXML ($param) {
		$object = kernel::getInstance('SecurityManager');

		$metaData = new BasicMetaData();
		$metaData->set('register', $param);
		MetaManager::getInstance()->storeMeta($object, $metaData);
		return 1;
	}

	// FIXME: should not work with metaManager !!!
	public static function isRegisterActive () {
		$meta = MetaManager::getInstance()->retrieveMeta(kernel::getInstance('SecurityManager'))->getAll();

		if(isset($meta['register']) && ($meta['register'] == 'true')) {
			return 1;
		}

		return 0;
	}

	//---------------------------
	//--------- USERS -----------
	//---------------------------

	/**
	 * Retrieve all the User on the system (primaryGroupId = eyeID_EyeosGroup_users)
	 * 
	 * @param array $params(
	 *		[filter => String]		Optional, a filter for the ID or the Name of the user
	 * )
	 * @return array(
	 *		'id' => String,
	 *		'name'=> String
	 * )
	 */
	public static function getAllUsers ($params) {
		$return = array();
		$users = UMManager::getInstance()->getAllUsers();
		
		if (isset($params) && $params['filter'] !== null && is_string($params['filter']) && strlen($params['filter'])) {
			$filter = $params['filter'];
		}
		
		foreach ($users as $user) {
			if ($user->getPrimaryGroupId() !== 'eyeID_EyeosGroup_users'){
				continue;
			}
			
			// Retrieve The Name of the User
			$settings = MetaManager::getInstance()->retrieveMeta($user);
			$firstName = '';
			$lastName = '';
			if (isset($settings)) {
				if ($settings->get('eyeos.user.firstname') != null) {
					$firstName = $settings->get('eyeos.user.firstname');
				}

				if ($settings->get('eyeos.user.lastname') != null) {
					$lastName = $settings->get('eyeos.user.lastname');
				}
			}

			$userId = $user->getId();
			$name = $firstName . ' ' . $lastName;
			$username = $user->getName();

			// If we provide $params['filter], we filter the results by the name or the id
			if (isset($filter)) {
				if ( (stristr($userId, $filter) === FALSE) && (stristr($name, $filter) === FALSE) && (stristr($username, $filter) === FALSE)) {
					continue;
				}
			}
		
			$return[] = array(
					'id' => $userId,
					'name' => $name,
					'username' => $username
			);
		}
		usort($return, 'UserManagementApplication::userCMP');
		return $return;
	}

	/**
	 * Get an User providing an Id
	 * 
	 * @param String $params Userid
	 */
	public static function getUserById ($params) {
		if (!isset($params) || !is_string($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		
		$user = UMManager::getInstance()->getUserById($params);
		$settings = MetaManager::getInstance()->retrieveMeta($user);

		return array(
			'id' => $user->getId(),
			'name' => $settings->get('eyeos.user.firstname'),
			'surname' => $settings->get('eyeos.user.lastname'),
			'mail' => $settings->get('eyeos.user.email'),
			'username' => $user->getName()
		);
	}

	/**
	 * Comparition function to compare return value of getAllUsers
	 */
	private static function userCMP ($a, $b) {
		return $a['name'] > $b['name'];
	}

	/**
	 * Update user information providing new metadata
	 * 
	 * @param array $params (
	 *	 key => value,
	 *	 key => value....
	 *  )
	 */
	public static function updateUser($params) {
		if (!isset($params) || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		if (!isset($params['id']) || !is_string($params['id'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'id\']');
		}

		$myUManager = UMManager::getInstance();
		$user = $myUManager->getUserById($params['id']);
		$settings = MetaManager::getInstance()->retrieveMeta($user);

		unset($params['id']);

		if($settings === null) {
			$settings = MetaManager::getInstance()->getNewMetaDataInstance($user);
		}
		$settings->setAll($params);
		MetaManager::getInstance()->storeMeta($user, $settings);
	}
	
	/**
	 * Create an eyeosUser
	 * 
	 * @param array $params (
	 *		firstName => String
	 *		lastName => String
	 *		userName => String
	 *		email => String
	 *		emailBody => String			// Instead of store email text in PHP side, we store on the javascript so it's possible to translate
	 *		emailSubject => String		// the application
	 * )
	 */
	public static function createUser ($params) {
		//Load Input
		try {
			$name = $params['firstName'];
			$surname = $params['lastName'];
			$username = $params['userName'];
			$email = $params['email'];
			$emailBody = $params['emailBody'];
			$emailSubject = $params['emailSubject'];
			$profile = $params['profile'];
			$password = $params['password'];

		} catch (Exception $e) {
			throw new EyeInvalidArgumentException('Missing or invalid $params', $e);
		}

		//Retrieve admin email
		$emailAdmin = self::retrieveCurrentUserMail();

		$myUManager = UMManager::getInstance();

		// check existence
		$alreadyExist = true;
		try {
			$myUManager->getUserByName($username);
		} catch (EyeNoSuchUserException $e) {
			$alreadyExist = false;
		}

		if ($alreadyExist) {
			throw new EyeUserAlreadyExistsException('User with name "' . $username . '" already exists.');
		}

		//Generate a new random password
		if(!$password) {
			$password = self::generateRandomPassword();
		}
		
		//create the user
		$user = $myUManager->getNewUserInstance();
		$user->setName($username);
		$user->setPassword($password, true);
		$user->setPrimaryGroupId($myUManager->getGroupByName(SERVICE_UM_DEFAULTUSERSGROUP)->getId());
		
		$myUManager->createUser($user, $profile);

		// Add Metadata
		$user = $myUManager->getUserByName($username);
		$meta = MetaManager::getInstance()->retrieveMeta($user);
		$meta->set('eyeos.user.firstname', $name);
		$meta->set('eyeos.user.lastname', $surname);
		$meta->set('eyeos.user.email', $email);
		MetaManager::getInstance()->storeMeta($user, $meta);

		//Send Password
		self::sendPassword(array(
	 		'userName' => $username,
			'password' => $password,
	 		'to' => $email,
			'from' => $emailAdmin,
	 		'emailBody' => $emailBody,
	 		'emailSubject' => $emailSubject
		));
	}

	/**
	 * Remove an User from the system
	 * 
	 * @param String $params The id of the user to remove
	 */
	public static function deleteUser ($params) {
		if (!isset($params) || !is_string($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		$myUManager = UMManager::getInstance();
		$myUManager->deletePrincipal($myUManager->getUserById($params));
	}

	/**
	 * Retrieve Mail for current user and check if it is valid
	 * 
	 * @return String 
	 */
	private static function retrieveCurrentUserMail () {
		$admin = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$setting = MetaManager::getInstance()->retrieveMeta($admin);

		try {
			$emailAdmin = $setting->get('eyeos.user.email');
		} catch (Exception $e) {
			throw new EyeMetaDataNotFoundException('Cannot retrieve email of admin user, check you correctly fill this field on usersetting application');
		}
		
		// Check if valid mail
		$regex_pattern = "|^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$|u";
		if (!preg_match($regex_pattern, $emailAdmin)) {
			throw new EyeMetaDataException('The email you specified on your settings is not valid, replace it with a valid address');
		}
		
		return $emailAdmin;
	}

	public static function getProfiles () {
		return ProfileManager::listProfiles();
	}

	/**
	 * Generate a random password
	 * 
	 * @param null $params
	 */
	protected static function generateRandomPassword () {
		$chars = "abcdefghijkmnopqrstuvwxyz023456789";
		srand((double)microtime()*1000000);

		$pass = '';

		for ($i = 0; $i < 6; $i++) {
			$num = rand() % 33;
			$tmp = substr($chars, $num, 1);
			$pass = $pass . $tmp;
		}
		return $pass;
	}

	/**
	 * Send the password to the email address specified
	 * @param array $params (
	 *		password => String
	 *		userName => String
	 *		to => String
	 *		from => String
	 *		emailBody => String			// Instead of store email text in PHP side, we store on the javascript so it's possible to translate
	 *		emailSubject => String		// the application
	 * )
	 */
	private static function sendPassword($params) {
		$to = $params['to'];
		$from = $params['from'];
		$url = 'http://' . $_SERVER['HTTP_HOST'];
		$username = $params['userName'];
		$password = $params['password'];

		$subject = $params['emailSubject'];
		$body = sprintf($params['emailBody'], $url, $username, $password, $url, $url);

		$headers  = 'MIME-Version: 1.0' . '\r\n';
		$headers .= 'Content-type: text/html; charset=utf-8' . '\r\n';
		$headers .= 'To: ' . $to . '\r\n';
		$headers .= 'From: ' . $from . '\r\n';

		mail($to, $subject, $body, $headers);
	}

	public static function changePassword($params) {
		$currentUser = UMManager::getInstance()->getUserById($params[0]);
		$newPassword = $params[1];

		$currentUserCopy = clone $currentUser;
		$currentUserCopy->setPassword($newPassword, true);
		UMManager::getInstance()->updatePrincipal($currentUserCopy);

		$currentUser->setPassword($newPassword, true);

		return true;
	}

	//---------------------------
	//------- WORKGROUP ---------
	//---------------------------

	/**
	 * Retrieve all the Workgroup on the system
	 *
	 * @param array $params(
	 *		[filter => String]		Optional, a filter for the ID or the Name of the workgroup
	 * )
	 * @return array(
	 *		'id' => String,
	 *		'name'=> String
	 * )
	 */
	public static function getAllWorkgroups ($params) {
		if (isset($params) && $params['filter'] !== null && is_string($params['filter']) && strlen($params['filter'])) {
			$filter = $params['filter'];
		}
		
		$workgroups = UMManager::getInstance()->getAllWorkgroups();
		$return = array();

		foreach ($workgroups as $workgroup) {
			$id = $workgroup->getId();
			$name = $workgroup->getName();
			
			if (isset($filter)) {
				if ( (stristr($id, $filter) === FALSE) && (stristr($name, $filter) === FALSE) ) {
					continue;
				}
			}
			
			$return[] = array(
				'id' => $workgroup->getId(),
				'name' => $workgroup->getName()
			);
		}
		return $return;
	}

        /**
         *
         * @param array $params(
         *              workgroupId: String
	 *		usersId: array(
         *                  id: String
         *              )
	 * )
         */
        public static function assignUsersToWorkgroup ($params) {
            if (!isset($params) || !is_array($params)) {
                throw new EyeInvalidArgumentException('Missing or invalid $params');
            }
            if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
                throw new EyeInvalidArgumentException('Missing or invalid $params[\'id\']');
            }
            if (!isset($params['usersId']) || !is_array($params['usersId'])) {
                throw new EyeInvalidArgumentException('Missing or invalid $params[\'usersId\']');
            }
            
            foreach ($params['usersId'] as $userId) {

                $assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
                $assignation->setWorkgroupId($params['workgroupId']);
                $assignation->setUserId($userId);
                $assignation->setRole(WorkgroupConstants::ROLE_VIEWER);
                $assignation->setStatus(WorkgroupConstants::STATUS_MEMBER);

                UMManager::getInstance()->registerUserWorkgroupAssignation($assignation);
            }
        }

	


}

?>