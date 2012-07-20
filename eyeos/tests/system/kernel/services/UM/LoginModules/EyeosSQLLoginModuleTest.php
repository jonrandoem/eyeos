<?php
class EyeosSQLLoginModuleTest extends PHPUnit_Framework_TestCase {
	private $fixture;
	private $user0;
	private $group0;
	
	public function setUp() {
		$this->fixture = new EyeosSQLLoginModule();
		
		$uManager = UMManager::getInstance();
		
		$this->group0 = $uManager->getNewGroupInstance();
		$this->group0->setName('group0');
		$uManager->createGroup($this->group0);
		
		$this->user0 = $uManager->getNewUserInstance();
		$this->user0->setName('userLogin0');
		$this->user0->setPassword('userPassword0', true);
		$this->user0->setPrimaryGroupId($this->group0->getId());
		$uManager->createUser($this->user0);
	}
	
	public function tearDown() {
		try {
			UMManager::getInstance()->deletePrincipal(UMManager::getUserByName('userLogin0'));
		} catch (EyeNoSuchPrincipalException $e) {}
		try {
			UMManager::getInstance()->deletePrincipal(UMManager::getGroupByName('group0'));
		} catch (EyeNoSuchPrincipalException $e) {}
	}
	
	public function testAbort() {
		//TODO
	}
	
	public function testCommit() {
		//TODO
	}
	
	public function testLogin() {
		$subject = new Subject();
		$sharedState = new ArrayList();
		$options = array();
		
		/**** wrong password ****/
		$cred = new EyeosPasswordCredential();
		$cred->setUsername('userLogin0');
		$cred->setPassword('wrongPass', true);
		$subject->getPrivateCredentials()->append($cred);
		$this->fixture->initialize($subject, $sharedState, $options);
		try {
			$this->fixture->login();
			$this->fail();
		} catch (EyeLoginException $e) {
			// normal situation
		}
		$this->assertEquals(1, $subject->getPrivateCredentials()->count());
		$subject->getPrivateCredentials()->remove($cred);
		$this->assertEquals(0, $subject->getPrivateCredentials()->count());
		
		
		/**** nonexisting user ****/
		$cred = new EyeosPasswordCredential();
		$cred->setUsername('john');
		$cred->setPassword('userPassword0', true);
		$subject->getPrivateCredentials()->append($cred);
		$this->fixture->initialize($subject, $sharedState, $options);
		try {
			$this->fixture->login();
			$this->fail();
		} catch (EyeLoginException $e) {
			// normal situation
		}
		$this->assertEquals(1, $subject->getPrivateCredentials()->count());
		$subject->getPrivateCredentials()->remove($cred);
		$this->assertEquals(0, $subject->getPrivateCredentials()->count());
		
		/**** no password credential ****/
		$this->fixture->initialize($subject, $sharedState, $options);
		try {
			$this->fixture->login();
			$this->fail();
		} catch (EyeLoginException $e) {
			// normal situation
		}
		
		
		/**** good login/pass ****/
		$cred = new EyeosPasswordCredential();
		$cred->setUsername('userLogin0');
		$cred->setPassword('userPassword0', true);
		$subject->getPrivateCredentials()->append($cred);
		$this->fixture->initialize($subject, $sharedState, $options);
		$this->assertTrue($this->fixture->login());
	}
	
	public function testLogout() {
		//TODO
	}
}
?>
