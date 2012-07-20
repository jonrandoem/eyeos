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

abstract class LoginApplication extends EyeosRestrictedApplicationExecutable {

	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		$memoryManager = MemoryManager::getInstance();
		Kernel::enterSystemMode();
		$isExternLogin = $memoryManager->get('isExternLogin');
		Kernel::exitSystemMode();

		$list = new ArrayList();
		$list->append($isExternLogin);

		if($isExternLogin){
		    Kernel::enterSystemMode();
		    $username = $memoryManager->get('username');
		    $password = $memoryManager->get('password');
		    Kernel::exitSystemMode();
		    $list->append($username);
		    $list->append($password);
		}

		$context->setArgs($list);
        $response->appendToBody('eyeos.isRegisterActive=' . self::isRegisterActive() . ';');
	}

	/**
	 * @param array $params(
	 * 		0 => login,
	 * 		1 => password
	 * )
	 * @return array(
	 * 		0 => true/false,
	 * 		[1 => exceptionTrace]
	 * )
	 */
	public static function login($params) {
		$subject = new Subject();
		$loginContext = new LoginContext('eyeos-login', $subject);
		$cred = new EyeosPasswordCredential();
		$cred->setUsername($params[0]);
		$cred->setPassword($params[1], true);
		$subject->getPrivateCredentials()->append($cred);
		
		$loginContext->login();
		
		// Generating recoll/xapian indexes for user files
		// SearchFileRecollPlugin::generateRecollIndex(UMManager::getInstance()->getUserByName($params[0]));
		$procManager = ProcManager::getInstance();
		$procManager->setProcessLoginContext($procManager->getCurrentProcess()->getPid(), $loginContext);

		return md5($params[1].$params[1].$params[1]);
	}

	// FIXME: should not work with metaManager !!!
	public static function isRegisterActive () {
		$meta = MetaManager::getInstance()->retrieveMeta(kernel::getInstance('SecurityManager'))->getAll();

		if(isset($meta['register']) && ($meta['register'] == 'true')) {
			return 1;
		}

		return 0;
	}

	public static function resendPassword($params){
		$mail = $params[0];
		$meta = new BasicMetaData();
		$meta->set('eyeos.user.email', $mail);
		$userIds = MetaManager::getInstance()->searchMeta(new EyeosUser(),$meta);

		if(count($userIds)==0){
		    return 0;
		} else {
			for($i = 0; $i < count($userIds); $i++) {
				$myUManager = UMManager::getInstance();
				$user = $myUManager->getUserById($userIds[$i]);
				$settings = MetaManager::getInstance()->retrieveMeta($user);
				if($settings->get('eyeos.user.email') == $mail) {
					$subject = new Subject();
					$loginContext = new LoginContext('eyeos-login', $subject);
					$cred = new EyeosPasswordCredential();
					$cred->setUsername($user->getName());
					$cred->setPassword($user->getPassword(), false);
					$subject->getPrivateCredentials()->append($cred);
					$loginContext->login();

					$procManager = ProcManager::getInstance();
					$lc = $procManager->getCurrentProcess()->getLoginContext();
					if(!$lc) {
						$lc = new LoginContext('eyeos-login');
					}
					$procManager->setProcessLoginContext($procManager->getCurrentProcess()->getPid(), $loginContext);
					$password = self::generatePassword();
					$user->setPassword($password, true);
					$myUManager->updatePrincipal($user);
					$procManager->setProcessLoginContext($procManager->getCurrentProcess()->getPid(), $lc);
					self::sendMailModificationPassword($mail,$user->getName(),$password);
					return 1;
				}
			}
		}
	}

	private function generatePassword(){
		$length = 8; //length for the new password
		$conso = array("b","c","d","f","g","h","j","k","l",
		"m","n","p","r","s","t","v","w","x","y","z");
		$vocal = array("a","e","i","o","u");
		$password = "";
		srand((double)microtime()*1000000);
		$max = $length/2;
		
		for($i=1; $i<=$max; $i++) {
			$password.=$conso[rand(0,19)];
			$password.=$vocal[rand(0,4)];
		}
		
		return $password;
	}

	private function sendMailModificationPassword($mailTo,$username,$password){
		$subject = REMEMBER_PASSWORD_SUBJECT;
		$message = sprintf(REMEMBER_PASSWORD_TEXT,$username,$password). "\r\n" . REMEMBER_PASSWORD_DISCLAIMER;

		// To send HTML mail, the Content-type header must be set
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";

		// Additional headers
		$headers .= 'To: '.$mailTo. "\r\n";
		$headers .= 'From: ' .REMEMBER_PASSWORD_FROM.' "\r\n";';

		// Mail it
		if(REMEMBER_PASSWORD_ENABLED){
			self::sendMail($mailTo, $subject, $message);
		}
	}

    private function sendMail($mailTo,$subject,$message){
		require_once APPS_DIR . '/login/phpmailer/class.phpmailer.php';
		$mail = new PHPMailer();
		$mail->CharSet = "UTF-8";
		$mail->MsgHTML($message);
		$mail->IsSMTP(); // telling the class to use SMTP
		$mail->SMTPAuth   = false; // enable SMTP authentication
		$mail->Host       = MAIL_HOST; // sets the SMTP server
		$mail->Port       = MAIL_PORT; // set the SMTP port for the GMAIL server
		$mail->SetFrom(REMEMBER_PASSWORD_FROM, '');
		$mail->Subject    = $subject;

		$address = $mailTo;
		$addresses = explode(";",$mailTo);
		foreach($addresses as $address){
			$mail->AddAddress($address, "");
		}

		$result = !$mail->Send();
    }
}

?>