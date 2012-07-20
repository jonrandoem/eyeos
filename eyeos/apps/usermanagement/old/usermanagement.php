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
 * eyeos.application.TestSocialBar - the eyeOS SocialBar.
 * the php side of the Socialbar.
 */
abstract class UserManagementApplication extends EyeosApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {

	}

	public static function getAllUsersFromGroup($params){
		$name=$params[0];
		$paging=$params[1];
		$pagina=$params[2];
		$myUManager = UMManager::getInstance();
		$group = $myUManager->getGroupByName($name);
		$usersResult=array();
		if(!$paging){
			$users = $myUManager->getAllUsersFromGroup($group);
			foreach($users as $user){
				//print_r($user);
				$settings = MetaManager::getInstance()->retrieveMeta($user);
				if ($settings->get('eyeos.user.firstname') != null && $settings->get('eyeos.user.lastname') != null) {
					$nameOfUser = $settings->get('eyeos.user.firstname') . ' ' . $settings->get('eyeos.user.lastname');

				}
				$usersResult[] = array('id'=>$user->getId(),'name'=>$nameOfUser);
			}
			//print_r($usersResult);
			return $usersResult;
		}
		
		return array();
		
	}

	public static function getNumberOfUsersOfGroup($params) {
		$name=$params[0];
		$myUManager = UMManager::getInstance();
		$group = $myUManager->getGroupByName($name);
		$numberOfUsers = $myUManager->getNumberOfUsersFromGroup($group);
		return $numberOfUsers;
	}

	public static function getInformacioSimpleUsuari($params){
		$userId=$params[0];
		$myUManager = UMManager::getInstance();
		$user = $myUManager->getUserById($userId);
	
		$settings = MetaManager::getInstance()->retrieveMeta($user);
		$name=$settings->get('eyeos.user.firstname');
		$surname=$settings->get('eyeos.user.lastname');
		$mail=$settings->get('eyeos.user.email');
		$username=$user->getName();
		//return array("name"=>$name,"surname"=>$surname,"mail"=>$mail,"username"=>str_replace('$','@',$username));

		$nif=$settings->get('eyeos.user.nif');
		$address=$settings->get('eyeos.user.address');
		$phone=$settings->get('eyeos.user.phone');
		$mob=$settings->get('eyeos.user.mobilePhone');
		$addPhone=$settings->get('eyeos.user.additionalPhone');

		return array("name"=>$name,"surname"=>$surname,"mail"=>$mail,"username"=>$username,"nif"=>$nif,"address"=>$address,"phone"=>$phone,"mobilePhone"=>$mob,"additionalPhone"=>$addPhone);

	}

	public static function getAvailableWorkgroups($params){
		$idUsuari = $params[0];
		$group = $params[1];
		$myUManager = UMManager::getInstance();
		$availableWorkgroups = $myUManager->getAllWorkgroups();
		if($idUsuari){
			$user = $myUManager->getUserById($idUsuari);
			$selectedWorkgroups = $myUManager->getAllWorkgroupsByUser($user);
		}
		else{
			$selectedWorkgroups = array();
		}
		$availableWorkgroupsDef = array();
		foreach($availableWorkgroups as $availableWorkgroup){
			$descartat = false;
			foreach($selectedWorkgroups as $selectedWorkgroup){
				if($availableWorkgroup->getId()==$selectedWorkgroup->getId() && !$descartat){
					$descartat = true;
				}
			}
			if(!$descartat){
				$availableWorkgroupsDef[] = array($availableWorkgroup->getId(),$availableWorkgroup->getName());
			}
		}
		return $availableWorkgroupsDef;
	}

	public static function getUserWorkgroups($params){
		$idUsuari = $params[0];
		$group = $params[1];
		$myUManager = UMManager::getInstance();
		$selectedWorkgroups = array();
		if($idUsuari){
			$user = $myUManager->getUserById($idUsuari);
			$filter = $myUManager->getNewUserWorkgroupAssignationInstance();
			$filter->setUserId($idUsuari);
			$assignations = $myUManager->getAllUserWorkgroupAssignations($filter);
			$listWorkgroups =  $myUManager->getAllWorkgroupsByUser($user);
			$result = array();
			foreach($assignations as $assignation) {
				$workgroup = $myUManager->getWorkgroupById($assignation->getWorkgroupId());
				if($assignation->getRole()==WorkgroupConstants::ROLE_OWNER){
					$blocked = 1;
				}
				else {
					$blocked= 0;
				}

				$selectedWorkgroups[] = array($workgroup->getId(),$workgroup->getName(),$assignation->getRole(),$blocked);
			}
/*
			foreach($listWorkgroups as $wg){
				//print_r($wg);
				$found = false;
				foreach($selectedWorkgroups as $swg){
					//print_r($swg);
					if($swg[0]==$wg->getId()){
						$found = true;
					}
				}
				if(!$found){
					$selectedWorkgroups[] = array($wg->getId(),$wg->getName(),WorkgroupConstants::ROLE_OWNER,1);
				}
			}*/


		}

		return $selectedWorkgroups;
	}

	public static function removeUser($params){
		$idUsuari = $params[0];
		$myUManager = UMManager::getInstance();
		$user = $myUManager->getUserById($idUsuari);
		//$myICUBManager = ICUBManagerFactory::getIcubManagerInstance();
		//$myProcManager = ProcManager::getInstance();
		//$myUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		/*$guestUser = new GuestUser();
		$guestUser->setUserId($myUserId);
		$guestUser->setGuestId($idUsuari);
		if(!$myICUBManager->existsDiferentGuestUsers($guestUser)){*/
			try{
				$myUManager->deletePrincipal($user);
			}
			catch (Exception $e){
				return false;
			}
		/*}
		$myICUBManager->deleteGuest($guestUser);*/

		return true;
	}

	public static function saveUser($params){
		$userId=$params[0];
		$nom=$params[1];
		$cognoms=$params[2];
		$email=$params[3];
		$username=$params[4];
		$nif=$params[5];
		$address=$params[6];
		$telefon=$params[7];
		$telefonMobil=$params[8];
		$telefonAddicional=$params[9];
		$group=$params[10];
		$workgroupsList=$params[11];
		$myUManager=UMManager::getInstance();
		$myProcManager = ProcManager::getInstance();
		$myUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		//$myICUBManager = ICUBManagerFactory::getIcubManagerInstance();

		//$workgroupICUB=$myUManager->getWorkgroupByName(NOM_WORKGROUP_ICUB);
		
		if(!$userId) {
			//Creation
			$user = $myUManager->getNewUserInstance();
			//$username=str_replace('@','%40',$username);
			$user->setName($username);
			$password = self::generaPassword();

//TODO: Arreglar lo de la contrasenya
			$user->setPassword($password, true);
			$user->setPrimaryGroupId($myUManager->getGroupByName($group)->getId());
			$myUManager->createUser($user);
			$userId = $user->getId();

			// save basic metadata from form
			$userMeta = MetaManager::getInstance()->retrieveMeta($user);
			$userMeta->set('eyeos.user.firstname', $nom);
			$userMeta->set('eyeos.user.lastname', $cognoms);
			$userMeta->set('eyeos.user.email', $email);
			$userMeta->set('eyeos.user.nif',$nif);
			$userMeta->set('eyeos.user.address',$address);
			$userMeta->set('eyeos.user.phone',$telefon);
			$userMeta->set('eyeos.user.mobilePhone',$telefonMobil);
			$userMeta->set('eyeos.user.additionalPhone',$telefonAddicional);
			$userMeta = MetaManager::getInstance()->storeMeta($user, $userMeta);
/*
			//And create a guest user for it
			$guestUser = new GuestUser();
			$guestUser->setUserId($myUserId);
			$guestUser->setGuestId($user->getId());
			$myICUBManager->createGuest($guestUser);
*/
			foreach($workgroupsList as $workgroup){
				$assignation = $myUManager->getNewUserWorkgroupAssignationInstance();
				$assignation->setWorkgroupId($workgroup[0]);
				$assignation->setUserId($user->getId());
				/*if($workgroup[0]==$workgroupICUB->getId()) {
					if($group == 'icubAdministrador'){
						$rol=WorkgroupConstants::ROLE_ADMIN;
					}
					else if($group == 'icubUsuariICUB'){
						$rol=WorkgroupConstants::ROLE_EDITOR;
					}
				}
				else{*/
					$rol=$workgroup[1];
			//	}
				$assignation->setRole($rol);
				$assignation->setStatus(0);
				$myUManager->registerUserWorkgroupAssignation($assignation);
			}


			self::enviaMailCreacio($email,$username,$password);
			
			
		}
		else{
			//Update
			$user=$myUManager->getUserById($userId);
			// save basic metadata from form
			$userMeta = MetaManager::getInstance()->retrieveMeta($user);
			$userMeta->set('eyeos.user.firstname', $nom);
			$userMeta->set('eyeos.user.lastname', $cognoms);
			$userMeta->set('eyeos.user.email', $email);
			$userMeta->set('eyeos.user.nif',$nif);
			$userMeta->set('eyeos.user.address',$address);
			$userMeta->set('eyeos.user.phone',$telefon);
			$userMeta->set('eyeos.user.mobilePhone',$telefonMobil);
			$userMeta->set('eyeos.user.additionalPhone',$telefonAddicional);
			$userMeta = MetaManager::getInstance()->storeMeta($user, $userMeta);

			$filter = $myUManager->getNewUserWorkgroupAssignationInstance();
			$filter->setUserId($userId);
			$workgroupsOriginals =  $myUManager->getAllUserWorkgroupAssignations($filter);
/*
			//And create a guest user for it
			$guestUser = new GuestUser();
			$guestUser->setUserId($myUserId);
			$guestUser->setGuestId($user->getId());
			try{
				$myICUBManager->createGuest($guestUser);
			}
			catch(EyeIntegrityConstraintViolationException $e){
				
			}*/

			//Borrar els grups als que ja no pertany l'usuari
			foreach($workgroupsOriginals as $workgroupOriginal){
				$wId=$workgroupOriginal->getWorkgroupId();
				/*$guestUserWorkgroup = new GuestUserWorkgroup();
				$guestUserWorkgroup->setUserId($myUserId);
				$guestUserWorkgroup->setGuestId($user->getId());
				$guestUserWorkgroup->setWorkgroupId($wId);*/
				$trobat=false;
				foreach($workgroupsList as $nouWorkgroup){
					$wIdNou = $nouWorkgroup[0];
					if($wId==$wIdNou){
						$trobat=true;
					}
				}
				if(!$trobat){
					$assignation = $myUManager->getNewUserWorkgroupAssignationInstance();
					$assignation->setUserId($userId);
					$assignation->setWorkgroupId($wId);
					$myUManager->unregisterUserWorkgroupAssignation($assignation);
				}
				//$myICUBManager->deleteGuestWorkgroup($guestUserWorkgroup);
			}
			//Afegeix els nous grups
			foreach($workgroupsList as $nouWorkgroup){
				$wId=$nouWorkgroup[0];
				$trobat=false;
				foreach($workgroupsOriginals as $workgroupOriginal){
					$wIdVell = $workgroupOriginal->getWorkgroupId();
					if($wId==$wIdVell){
						$trobat=true;
					}
				}
				if(!$trobat){
					$assignation = $myUManager->getNewUserWorkgroupAssignationInstance();
					$assignation->setUserId($userId);
					$assignation->setWorkgroupId($wId);
					$assignation->setStatus(0);
					$assignation->setRole($nouWorkgroup[1]);
					$myUManager->registerUserWorkgroupAssignation($assignation);
					/*$guestUserWorkgroup = new GuestUserWorkgroup();
					$guestUserWorkgroup->setUserId($myUserId);
					$guestUserWorkgroup->setGuestId($userId);
					$guestUserWorkgroup->setWorkgroupId($wId);
					$myICUBManager->createGuestWorkgroup($guestUserWorkgroup);*/
				}
				
			}
			
			//Modifica els grups que ja existien
			foreach($workgroupsList as $nouWorkgroup){
				$wId=$nouWorkgroup[0];
				$trobat=false;
				foreach($workgroupsOriginals as $workgroupOriginal){
					$wIdVell = $workgroupOriginal->getWorkgroupId();
					if($wId==$wIdVell){
						$trobat=true;
					}
				}
				if($trobat){
					$assignation = $myUManager->getNewUserWorkgroupAssignationInstance();
					$assignation->setUserId($userId);
					$assignation->setWorkgroupId($wId);
					$assignation->setStatus(0);
					$assignation->setRole($nouWorkgroup[1]);
					$myUManager->updateUserWorkgroupAssignation($assignation);
				}
			}			
		}
		return $userId;
	}

	//TODO: Fer que faci el filtre a la base de dades
	public static function search($params){
		$name=$params[0];
		$text=$params[1];
		$myUManager = UMManager::getInstance();
		$group = $myUManager->getGroupByName($name);
		$usersResult=array();

		$users = $myUManager->getAllUsersFromGroup($group);
		foreach($users as $user){
			$settings = MetaManager::getInstance()->retrieveMeta($user);
			if ($settings->get('eyeos.user.firstname') != null && $settings->get('eyeos.user.lastname') != null) {
				$nameOfUser = $settings->get('eyeos.user.firstname') . ' ' . $settings->get('eyeos.user.lastname');
			}
			if(stristr($nameOfUser,$text)){
				$usersResult[] = array('id'=>$user->getId(),'name'=>$nameOfUser);
			}
		}

		return $usersResult;

	}

	public static function resetPassword($params){
		$userId = $params[0];
		$myUManager=UMManager::getInstance();
		$password = self::generaPassword();
		$user=$myUManager->getUserById($userId);
		$user->setPassword($password,true);
		$myUManager->updatePrincipal($user);
		$userMeta = MetaManager::getInstance()->retrieveMeta($user);
		$mail = $userMeta->get('eyeos.user.email');
		self::enviaMailModificacioPassword($mail,$user->getName(),$password);		
	}


	private function generaPassword(){
		/*
		Programmed by Christian Haensel, christian@chftp.com, LINK1http://www.chftp.comLINK1
		Exclusively published on weberdev.com.
		If you like my scripts, please let me know or link to me.

		You may copy, redistirubte, change and alter my scripts as long as this information remains intact
		*/


		$length        =    6; // Must be a multiple of 2 !! So 14 will work, 15 won't, 16 will, 17 won't and so on

		// Password generation
		$conso=array("b","c","d","f","g","h","j","k","l",
		"m","n","p","r","s","t","v","w","x","y","z");
		$vocal=array("a","e","i","o","u");
		$password="";
		srand ((double)microtime()*1000000);
		$max = $length/2;
		for($i=1; $i<=$max; $i++)
		{
		$password.=$conso[rand(0,19)];
		$password.=$vocal[rand(0,4)];
		}
		$newpass = $password;
		// ENDE Password generation
		return $newpass;
	}

	private function enviaMailCreacio($mailTo,$username,$password){
		$subject = JP_SUBJECT_MAILS;
		$message = sprintf(JP_MESSAGE_MAILS,$username,$password);

		// To send HTML mail, the Content-type header must be set
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";

		// Additional headers
		$headers .= 'To: '.$mailTo. "\r\n";
		$headers .= 'From: ' .JP_MAIL_ADMIN_FROM.' "\r\n";';

		// Mail it
		if(JP_MAIL_ACTIUS){
			mail($mailTo, $subject, $message, $headers);
		}
		
	}

	private function enviaMailModificacioPassword($mailTo,$username,$password){
		$subject = JP_SUBJECT_MAILS_MODIF;
		$message = sprintf(JP_MESSAGE_MAILS_MODIF,$username,$password);

		// To send HTML mail, the Content-type header must be set
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";

		// Additional headers
		$headers .= 'To: '.$mailTo. "\r\n";
		$headers .= 'From: ' .JP_MAIL_ADMIN_FROM.' "\r\n";';

		// Mail it
		if(JP_MAIL_ACTIUS){
			mail($mailTo, $subject, $message, $headers);
		}

	}

	public function getAvatarPicture($params) {
		$userId = $params[0];

		$user = UMManager::getInstance()->getUserById($params['userId']);
		$settings = MetaManager::getInstance()->retrieveMeta($user);
		$file = null;
		if ($settings->get('eyeos.user.picture.url') !== null) {
			$file = FSI::getFile($settings->get('eyeos.user.picture.url'));
		}
		if ($file === null || !$file->isReadable()) {
			$file = FSI::getFile('sys:///extern/images/empty_profile.png');
		}

		$response = MMapManager::getCurrentResponse();
		$bodyrenderer = new FileReaderBodyRenderer($file->getInputStream());

		// Set headers
		$response->getHeaders()->append('Content-Type: ' . mime_content_type($file->getName()));
		$response->getHeaders()->append('Content-Length: ' . $file->getSize());
		$response->getHeaders()->append('Accept-Ranges: bytes');
		$response->getHeaders()->append('X-Pad: avoid browser bug');

		$response->setBodyRenderer($bodyrenderer);
	}




}

?>
