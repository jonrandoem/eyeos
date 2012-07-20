//<?php
class EyeosSQLPrincipalsManagerTest extends  PHPUnit_Framework_TestCase {
	private $fixture;
	private $user0;
	private $user1;
	private $user2;
	private $group0;
	private $group1;
	private $group2;
	private $group3;
	
	private static $InitUsers = null;
	private static $InitGroups = null;
	private static $DefaultGroups = null;
	
	public function setUp() {		
		$this->fixture = UMManager::getInstance();
		
		if (self::$DefaultGroups === null) {
			self::$DefaultGroups = array();
			$conf = UMManager::getConfiguration('EyeosSQLPrincipalsManager');
			foreach($conf->defaultGroups->group as $group) {
				$groupObj = $this->fixture->getGroupByName((string) $group['name']);
				self::$DefaultGroups[$groupObj->getId()] = $groupObj;
			}
		}
		if (self::$InitGroups === null) {
			self::$InitGroups = array();
			foreach($GLOBALS['eyeos_UnitTests']['initGroupNames'] as $groupName) {
				$groupObj = $this->fixture->getGroupByName($groupName);
				self::$InitGroups[$groupObj->getId()] = $groupObj;
			}
		}
		if (self::$InitUsers === null) {
			self::$InitUsers = array();
			foreach($GLOBALS['eyeos_UnitTests']['initUserNames'] as $userName) {
				$userpObj = $this->fixture->getUserByName($userName);
				self::$InitUsers[$userpObj->getId()] = $userpObj;
			}
		}
		
		$this->tearDown();
		
		$this->group0 = $this->fixture->getNewGroupInstance();
		$this->group0->setName('group0');
		$this->fixture->createGroup($this->group0);
		
		$this->user0 = $this->fixture->getNewUserInstance();
		$this->user0->setName('user0');
		$this->user0->setPassword('password0', true);
		$this->user0->setPrimaryGroupId($this->group0->getId());
		$this->fixture->createUser($this->user0);
	}
	
	public function tearDown() {
		$objects = array(
			$this->user0,
			$this->user1,
			$this->user2,
			$this->group0,
			$this->group1,
			$this->group2,
			$this->group3
		);
		foreach($objects as $obj) {
			if ($obj !== null) {
				try {
					if ($obj instanceof IGroup) {
						$subElements = UMManager::getInstance()->getAllPrincipalsFromGroup($obj, 0);
						foreach($subElements as $subElement) {
							UMManager::getInstance()->removeFromGroup($subElement, $obj);
						}
					}
					UMManager::getInstance()->deletePrincipal($obj);
				} catch(EyeNoSuchPrincipalException $e) {}
				unset($obj);
			}
		}
	}
	
	public function testAddToGroup() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('newGroup');
		$this->fixture->createGroup($this->group1);
		$groups = $this->fixture->getAllGroupsByPrincipal($this->user0);
		
		//precondition
		$this->assertFalse(isset($groups[$this->group1->getId()]));
		
		$this->fixture->addToGroup($this->user0, $this->group1);
		
		//postconditions
		$groups = $this->fixture->getAllGroupsByPrincipal($this->user0);
		$this->assertTrue(isset($groups[$this->group1->getId()]));
		$this->assertEquals($this->group1, $groups[$this->group1->getId()]);
	}
	
	public function testCreateGroup() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$groupCreated = $this->fixture->getGroupById($this->group1->getId());
		$this->assertEquals($this->group1, $groupCreated);
	}
	
	public function testCreateUser() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$this->user1 = $this->fixture->getNewUserInstance();
		$this->user1->setName('user1');
		$this->user1->setPassword('myPassword', true);
		$this->user1->setPrimaryGroupId($this->group1->getId());
		
		// preconditions
		$this->assertFalse(is_dir(USERS_PATH . '/' . $this->user1->getName()));			// TODO: should be moved to a new class "UMListenerTest"

		$this->fixture->createUser($this->user1);
		
		//postconditions
		$userCreated = $this->fixture->getUserById($this->user1->getId());
		$this->assertEquals($this->user1, $userCreated);
		$this->assertEquals($this->group1, $this->fixture->getGroupById($this->user1->getPrimaryGroupId()));
		$this->assertEquals($this->group1, current($this->fixture->getAllGroupsByPrincipal($this->user1)));
		
		// TODO: should be moved to a new class "UMListenerTest"
		$this->assertTrue(is_dir(USERS_PATH . '/' . $this->user1->getName()));
        $this->assertEquals(scandir(USERS_PATH . '/' . $this->user1->getName()), scandir(SYSTEM_SKEL_PATH . '/' . USERS_DIR));
	}
	
	public function testDeletePrincipal() {
		/**** Group (with members => failure) ****/
		//precondition
		$this->assertNotNull($this->fixture->getGroupById($this->group0->getId()));
		
		try {
			$this->fixture->deletePrincipal($this->group0);
			$this->fail();
		} catch (EyeNonEmptyGroupException $e) {
			//normal situation
		}
		
		
		/**** User ****/
		//precondition
		$this->assertNotNull($this->fixture->getUserById($this->user0->getId()));
		$this->assertEquals(count(self::$DefaultGroups) + 1, count($this->fixture->getAllGroupsByPrincipal($this->user0)));
        $this->assertTrue(is_dir(USERS_PATH . '/' . $this->user0->getName()));
		
		$this->fixture->deletePrincipal($this->user0);
		
		//postcondition
		try {
			$this->fixture->getUserById($this->user0->getId());
			$this->fail();
		} catch (EyeNoSuchUserException $e) {
			// normal situation
		}
        $this->assertFalse(is_dir(USERS_PATH . '/' . $this->user0->getName()));
		
		
		/**** Group (with no members => success) ****/
		//precondition
		$this->assertNotNull($this->fixture->getGroupById($this->group0->getId()));
		
		$this->fixture->deletePrincipal($this->group0);
		
		//postcondition
		try {
			$this->fixture->getGroupById($this->group0->getId());
			$this->fail();
		} catch (EyeNoSuchGroupException $e) {
			// normal situation
		}
	}
	
	public function testGetAllGroups() {
		$rootGroup = UMManager::getInstance()->getGroupByName('root');
		$usersGroup = UMManager::getInstance()->getGroupByName(SERVICE_UM_DEFAULTUSERSGROUP);
		$ref = array(
			$rootGroup->getId() => $rootGroup,
			$usersGroup->getId() => $usersGroup,
			$this->group0->getId() => $this->group0
		);
		$ref = array_merge($ref, self::$InitGroups);
		ksort($ref);
		$fixture = $this->fixture->getAllGroups();
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
		
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$this->group2 = $this->fixture->getNewGroupInstance();
		$this->group2->setName('group2');
		$this->fixture->createGroup($this->group2);
		
		$this->group3 = $this->fixture->getNewGroupInstance();
		$this->group3->setName('group3');
				
		$ref = array(
			$rootGroup->getId() => $rootGroup,
			$usersGroup->getId() => $usersGroup,
			$this->group0->getId() => $this->group0,
			$this->group1->getId() => $this->group1,
			$this->group2->getId() => $this->group2
		);
		$ref = array_merge($ref, self::$InitGroups);
		ksort($ref);
		$fixture = $this->fixture->getAllGroups();
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
	}
	
	public function testGetAllGroupsByPrincipal() {
		$rootGroup = UMManager::getInstance()->getGroupByName('root');
		$usersGroup = UMManager::getInstance()->getGroupByName(SERVICE_UM_DEFAULTUSERSGROUP);
		
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$ref = array(
			$this->group0->getId() => $this->group0
		);
		$ref = array_merge($ref, self::$DefaultGroups);
		ksort($ref);
		$fixture = $this->fixture->getAllGroupsByPrincipal($this->user0);
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
		
		$this->fixture->addToGroup($this->user0, $this->group1);
		
		$ref = array(
			$this->group0->getId() => $this->group0,
			$this->group1->getId() => $this->group1
		);
		$ref = array_merge($ref, self::$DefaultGroups);
		ksort($ref);
		$fixture = $this->fixture->getAllGroupsByPrincipal($this->user0);
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
	}
	
	public function testGetAllGroupsFromGroups() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$this->assertEquals(0, count($this->fixture->getAllGroupsFromGroup($this->group0)));
		
		$this->fixture->addToGroup($this->group1, $this->group0);
		
		$ref = array(
			$this->group1->getId() => $this->group1
		);
		$this->assertEquals($ref, $this->fixture->getAllGroupsFromGroup($this->group0));
	}
	
	public function testGetAllPrincipalsFromGroup() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$ref = array(
			$this->user0->getId() => $this->user0
		);
		$this->assertEquals($ref, $this->fixture->getAllPrincipalsFromGroup($this->group0));
		
		$this->fixture->addToGroup($this->group1, $this->group0);
		
		$ref = array(
			$this->user0->getId() => $this->user0,
			$this->group1->getId() => $this->group1
		);
		$this->assertEquals($ref, $this->fixture->getAllPrincipalsFromGroup($this->group0));
		
		$this->assertEquals(0, count($this->fixture->getAllPrincipalsFromGroup($this->group1)));
	}
	
	public function testGetAllUsers() {
		$rootUser = UMManager::getInstance()->getUserByName('root');
		$johnUser = UMManager::getInstance()->getUserByName('john');
		
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$ref = array(
			$rootUser->getId() => $rootUser,
			$johnUser->getId() => $johnUser,
			$this->user0->getId() => $this->user0
		);
		$ref = array_merge($ref, self::$InitUsers);
		ksort($ref);
		$fixture = $this->fixture->getAllUsers();
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
		
		$this->user1 = $this->fixture->getNewUserInstance();
		$this->user1->setName('user1');
		$this->user1->setPrimaryGroupId($this->group1->getId());
		$this->fixture->createUser($this->user1);
		
		$ref[$this->user1->getId()] = $this->user1;
		ksort($ref);
		$fixture = $this->fixture->getAllUsers();
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
		
		$this->tearDown();
		
		$this->assertEquals(count(self::$InitUsers), count($this->fixture->getAllUsers()));
	}
	
	public function testGetAllUsersFromGroup() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$ref = array(
			$this->user0->getId() => $this->user0
		);
		$this->assertEquals($ref, $this->fixture->getAllUsersFromGroup($this->group0));
		
		$this->fixture->addToGroup($this->group1, $this->group0);
		
		$this->assertEquals($ref, $this->fixture->getAllUsersFromGroup($this->group0));
		
		$this->user1 = $this->fixture->getNewUserInstance();
		$this->user1->setName('user1');
		$this->user1->setPrimaryGroupId($this->group1->getId());
		$this->fixture->createUser($this->user1);
		
		$this->assertEquals($ref, $this->fixture->getAllUsersFromGroup($this->group0, 0));
		
		$ref = array(
			$this->user0->getId() => $this->user0,
			$this->user1->getId() => $this->user1,
		);
		
		$this->assertEquals($ref, $this->fixture->getAllUsersFromGroup($this->group0));
		
		$this->fixture->addToGroup($this->user1, $this->group0);
		
		$ref = array(
			$this->user0->getId() => $this->user0,
			$this->user1->getId() => $this->user1,
		);
		$this->assertEquals($ref, $this->fixture->getAllUsersFromGroup($this->group0));
	}
	
	public function testGetGroupById() {
		$this->assertEquals($this->group0, $this->fixture->getGroupById($this->group0->getId()));
		
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		try {
			$this->fixture->getGroupById($this->group1->getId());
			$this->fail();
		} catch (EyeNoSuchGroupException $e) {
			// normal situation
		}
	}
	
	public function testGetUserById() {
		$this->assertEquals($this->user0, $this->fixture->getUserById($this->user0->getId()));
		
		$this->user1 = $this->fixture->getNewUserInstance();
		$this->user1->setName('user1');
		try {
			$this->fixture->getUserById($this->user1->getId());
			$this->fail();
		} catch (EyeNoSuchUserException $e) {
			// normal situation
		}
	}
	
	public function testIsPrincipalInGroup() {
		// here the "+ 1" is "user0" created in setUp()
		$this->assertEquals(count(self::$InitUsers) + 1, count($this->fixture->getAllUsers()));
		$this->assertEquals(count(self::$InitGroups) + 1, count($this->fixture->getAllGroups()));
		
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		$this->group2 = $this->fixture->getNewGroupInstance();
		$this->group2->setName('group2');
		$this->fixture->createGroup($this->group2);
		$this->group3 = $this->fixture->getNewGroupInstance();
		$this->group3->setName('group3');
		$this->fixture->createGroup($this->group3);
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user0, $this->group0));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group1));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group3));
		
		$this->user1 = $this->fixture->getNewUserInstance();
		$this->user1->setName('user1');
		$this->user1->setPrimaryGroupId($this->group0->getId());
		$this->fixture->createUser($this->user1);
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user1, $this->group0));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group1));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group3));
		
		$this->fixture->addToGroup($this->group0, $this->group1);
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user0, $this->group0));
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user0, $this->group1));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group3));
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user1, $this->group0));
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user1, $this->group1));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group3));		
		
		$this->fixture->addToGroup($this->group1, $this->group2);
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user0, $this->group0));
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user0, $this->group1));
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user0, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group3));
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user1, $this->group0));
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user1, $this->group1));
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user1, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group3));
		
		$this->fixture->removeFromGroup($this->group0, $this->group1);
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user0, $this->group0));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group1));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user0, $this->group3));
		
		$this->assertTrue($this->fixture->isPrincipalInGroup($this->user1, $this->group0));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group1));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group2));
		$this->assertFalse($this->fixture->isPrincipalInGroup($this->user1, $this->group3));
	}
	
	public function testRemoveFromGroup() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		$this->user1 = $this->fixture->getNewUserInstance();
		$this->user1->setName('user1');
		$this->user1->setPrimaryGroupId($this->group0->getId());
		$this->fixture->createUser($this->user1);
		
		$this->fixture->addToGroup($this->user0, $this->group1);
		$this->fixture->addToGroup($this->user1, $this->group1);
		
		$ref = array(
			$this->user0->getId() => $this->user0,
			$this->user1->getId() => $this->user1
		);
		$this->assertEquals($ref, $this->fixture->getAllUsersFromGroup($this->group1));
		
		$this->fixture->removeFromGroup($this->user0, $this->group1);
		
		$ref = array(
			$this->user1->getId() => $this->user1
		);
		$this->assertEquals($ref, $this->fixture->getAllUsersFromGroup($this->group1));
		
		$this->fixture->removeFromGroup($this->user1, $this->group1);

		$this->assertEquals(0, count($this->fixture->getAllUsersFromGroup($this->group1)));
		
		try {
			$this->fixture->removeFromGroup($this->user1, $this->group0);
			$this->fail();
		} catch (EyeUnsupportedOperationException $e) {
			// normal situation
		}
	}
	
	public function testUpdatePrincipal() {
		$this->group1 = $this->fixture->getNewGroupInstance();
		$this->group1->setName('group1');
		$this->fixture->createGroup($this->group1);
		
		/**** User ****/
		//preconditions
		$this->assertEquals($this->user0, $this->fixture->getUserById($this->user0->getId()));
		$this->assertEquals($this->group0, $this->fixture->getGroupById($this->user0->getPrimaryGroupId()));
		$ref = array(
			$this->group0->getId() => $this->group0
		);
		$ref = array_merge($ref, self::$DefaultGroups);
		ksort($ref);
		$fixture = $this->fixture->getAllGroupsByPrincipal($this->user0);
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
		
		// modify object
		$oldPass = $this->user0->getPassword();
		$this->user0->setPassword('myNEWpassword', true);
		$newPass = $this->user0->getPassword();
		$this->assertNotEquals($oldPass, $newPass);
		
		// apply modifications
		$this->fixture->updatePrincipal($this->user0);
		
		//postconditions + preconditions for next operation
		$user0 = $this->fixture->getUserById($this->user0->getId());
		$this->assertEquals($this->group0, $this->fixture->getGroupById($user0->getPrimaryGroupId()));
		$this->assertEquals($newPass, $user0->getPassword());
		$fixture = $this->fixture->getAllGroupsByPrincipal($user0);
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
		
		// modify object
		$this->user0->setPrimaryGroupId($this->group1->getId());
		
		// apply modifications
		$this->fixture->updatePrincipal($this->user0);
		
		//postconditions
		$user0 = $this->fixture->getUserById($this->user0->getId());
		$this->assertEquals($user0, $this->fixture->getUserById($user0->getId()));
		$this->assertEquals($this->group1, $this->fixture->getGroupById($user0->getPrimaryGroupId()));
		$ref = array(
			$this->group1->getId() => $this->group1
		);
		$ref = array_merge($ref, self::$DefaultGroups);
		ksort($ref);
		$fixture = $this->fixture->getAllGroupsByPrincipal($user0);
		ksort($fixture);
		$this->assertEquals($ref, $fixture);
		
		
		/**** Group ****/
		// nothing to be updated at the moment! (ID and name are read-only)
	}
}
?>
