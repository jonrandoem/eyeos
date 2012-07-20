<?php
class LoginContextTest extends PHPUnit_Framework_TestCase {
	private $fixture;
	private $authConfig;
	private $user0;
	private $user1;
	private $group0;
	
	private static $DefaultGroups = null;
	
	public function setUp() {		
		if (self::$DefaultGroups === null) {
			self::$DefaultGroups = array();
			$conf = UMManager::getConfiguration('EyeosSQLPrincipalsManager');
			foreach($conf->defaultGroups->group as $group) {
				self::$DefaultGroups[] = (string) $group['name'];
			}
		}
		
		$uManager = UMManager::getInstance();
		
		$this->group0 = $uManager->getNewGroupInstance();
		$this->group0->setName('group0');
		$uManager->createGroup($this->group0);
		
		$this->user0 = $uManager->getNewUserInstance();
		$this->user0->setName('userLogin0');
		$this->user0->setPassword('userPassword0', true);
		$this->user0->setPrimaryGroupId($this->group0->getId());
		$uManager->createUser($this->user0);
		
		$this->user1 = $uManager->getNewUserInstance();
		$this->user1->setName('userLogin1');
		$this->user1->setPassword('userPassword1', true);
		$this->user1->setPrimaryGroupId($this->group0->getId());
		$uManager->createUser($this->user1);
		
		$this->authConfig = new XMLAuthConfiguration(SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_UM_DIR . '/' . SERVICE_UM_AUTHCONFIGURATIONS_DIR . '/eyeos_default.xml');
	}
	
	public function tearDown() {
		try {
			UMManager::getInstance()->deletePrincipal(UMManager::getUserByName('userLogin0'));
		} catch (EyeNoSuchPrincipalException $e) {}
		try {
			UMManager::getInstance()->deletePrincipal(UMManager::getUserByName('userLogin1'));
		} catch (EyeNoSuchPrincipalException $e) {}
		try {
			UMManager::getInstance()->deletePrincipal(UMManager::getGroupByName('group0'));
		} catch (EyeNoSuchPrincipalException $e) {}
	}
	
	public function testLogin() {	
		/**** good login/pass ****/
		$subject = new Subject();
		$this->fixture = new LoginContext('eyeos-login', $subject, $this->authConfig);
		$cred = new EyeosPasswordCredential();
		$cred->setUsername('userLogin0');
		$cred->setPassword('userPassword0', true);
		$subject->getPrivateCredentials()->append($cred);
		
		$this->assertEquals(0, count($this->fixture->getSubject()->getPrincipals()));
		$this->fixture->login();
		$this->assertEquals(count(self::$DefaultGroups) + 2, count($this->fixture->getSubject()->getPrincipals()));
		$this->assertTrue($this->fixture->getSubject()->getPrincipals()->contains($this->user0));
		$this->assertTrue($this->fixture->getSubject()->getPrincipals()->contains($this->group0));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->user1));
		
		
		/**** wrong password ****/
		$subject = new Subject();
		$this->fixture = new LoginContext('eyeos-login', $subject, $this->authConfig);
		$cred = new EyeosPasswordCredential();
		$cred->setUsername('userLogin0');
		$cred->setPassword('wrongPass', true);
		$subject->getPrivateCredentials()->append($cred);
		
		$this->assertEquals(0, count($this->fixture->getSubject()->getPrincipals()));
		try {
			$this->fixture->login();
			$this->fail();
		} catch (EyeLoginException $e) {
			// normal situation
		}
		$this->assertEquals(0, count($this->fixture->getSubject()->getPrincipals()));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->user0));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->group0));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->user1));


		//TODO: try with combinations of different login modules with REQUISITE
		
		
		//TODO: try with combinations of different login modules with OPTIONAL
		
		
		//TODO: try with combinations of different login modules with SUFFICIENT
		
	}
	
	public function testLogout() {
		$subject = new Subject();
		$this->fixture = new LoginContext('eyeos-login', $subject, $this->authConfig);
		$cred = new EyeosPasswordCredential();
		$cred->setUsername('userLogin0');
		$cred->setPassword('userPassword0', true);
		$subject->getPrivateCredentials()->append($cred);
		
		$this->assertEquals(0, count($this->fixture->getSubject()->getPrincipals()));
		$this->fixture->login();
		$this->assertEquals(count(self::$DefaultGroups) + 2, count($this->fixture->getSubject()->getPrincipals()));
		$this->assertTrue($this->fixture->getSubject()->getPrincipals()->contains($this->user0));
		$this->assertTrue($this->fixture->getSubject()->getPrincipals()->contains($this->group0));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->user1));
		
		$this->fixture->logout();
		
		$this->assertEquals(0, count($this->fixture->getSubject()->getPrincipals()));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->user0));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->group0));
		$this->assertFalse($this->fixture->getSubject()->getPrincipals()->contains($this->user1));
		
		
		//TODO: try with combinations of different login modules and check if only the matching principals are removed
	}
}
?>
