<?php
class ShareableVirtualFilesHandlerTest extends PHPUnit_Framework_TestCase {
	private $owner;
	private $collaborator1;
	private $collaborator2;
	private $collaborator3;
	private $group;
	private $secGroup;
	private $fixture;
	
	private static $MyProcPid = null;
	private static $InitProcessToRestore = null;
	
	private static $ClassSetUpRun = false;
	private static $ClassTearDownToRun = false;

	public function setUp() {
		if (self::$InitProcessToRestore === null) {
			self::$InitProcessToRestore = ProcManager::getInstance()->getCurrentProcess();
		}
		
		if (!self::$ClassSetUpRun) {
			$this->tearDown();
			$this->owner = UMManager::getInstance()->getUserByName('john');
			
			$this->group = UMManager::getGroupByName(SERVICE_UM_DEFAULTUSERSGROUP);
				
			//create group "wonderland"
			$this->secGroup = UMManager::getInstance()->getNewGroupInstance();
			$this->secGroup->setName('wonderland');
			UMManager::getInstance()->createGroup($this->secGroup);
			
			//create user "alice"
			$this->collaborator1 = UMManager::getInstance()->getNewUserInstance();
			$this->collaborator1->setName('alice');
			$this->collaborator1->setPassword('alice', true);
			$this->collaborator1->setPrimaryGroupId($this->secGroup->getId());
			UMManager::getInstance()->createUser($this->collaborator1);
			
			//create user "bob"
			$this->collaborator2 = UMManager::getInstance()->getNewUserInstance();
			$this->collaborator2->setName('bob');
			$this->collaborator2->setPassword('bob', true);
			$this->collaborator2->setPrimaryGroupId($this->secGroup->getId());
			UMManager::getInstance()->createUser($this->collaborator2);
			
			//create user "charlie"
			$this->collaborator3 = UMManager::getInstance()->getNewUserInstance();
			$this->collaborator3->setName('charlie');
			$this->collaborator3->setPassword('charlie', true);
			$this->collaborator3->setPrimaryGroupId($this->secGroup->getId());
			UMManager::getInstance()->createUser($this->collaborator3);
						
			$proc = new Process('example');
			$loginContext = new LoginContext('example', new Subject());
			$proc->setLoginContext($loginContext);
			ProcManager::getInstance()->execute($proc);
			self::$MyProcPid = $proc->getPid();
			$this->loginAsJohn();
			
			self::$ClassSetUpRun = true;
		} else {
			$this->owner = UMManager::getInstance()->getUserByName('john');
			$this->collaborator1 = UMManager::getInstance()->getUserByName('alice');
			$this->collaborator2 = UMManager::getInstance()->getUserByName('bob');
			$this->collaborator3 = UMManager::getInstance()->getUserByName('charlie');
		}
		
		AdvancedPathLib::rmdirs(USERS_PATH . '/john/' . USERS_FILES_DIR, true);
		AdvancedPathLib::rmdirs(USERS_PATH . '/john/' . USERS_METAFILES_DIR, true);
		
		$this->fixture = FSI::getFile('home://~john/myFile.ext');
		$this->loginAsRoot();
		try {
			$this->fixture->delete();
		} catch (Exception $e) {}
		$this->loginAsJohn();
		$this->fixture->createNewFile(true);
		
		$conf = SharingManager::getConfiguration('SharingManager');
		$providerClassName = (string) $conf->providerClassName[0];
		if ($providerClassName == 'DefaultSQLiteShareInfoProvider') {
			if (is_file(USERS_PATH . '/' . $this->owner->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->owner->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
			if (is_file(USERS_PATH . '/' . $this->collaborator1->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->collaborator1->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
			if (is_file(USERS_PATH . '/' . $this->collaborator2->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->collaborator2->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
			if (is_file(USERS_PATH . '/' . $this->collaborator3->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->collaborator3->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
		} else if ($providerClassName == 'DefaultMySQLShareInfoProvider') {
			try {
				require_once SERVICE_SHARING_SHARINGMANAGERS_PROVIDERS_PATH . '/DefaultMySQLShareInfoProvider.php';
				$dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
				$dao->send('TRUNCATE TABLE ' . DefaultMySQLShareInfoProvider::SHAREINFO_TABLE_NAME);
				$dao->send('TRUNCATE TABLE ShareableVirtualFilesHandler');
			} catch (PDOException $e) {}
		}
	}
	
	public function tearDown() {
		if (self::$ClassTearDownToRun) {
			$this->loginAsRoot();
			try {
				UMManager::getInstance()->deletePrincipal(UMManager::getUserByName('alice'));
			} catch (EyeNoSuchPrincipalException $e) {}
			try {
				UMManager::getInstance()->deletePrincipal(UMManager::getUserByName('bob'));
			} catch (EyeNoSuchPrincipalException $e) {}
			try {
				UMManager::getInstance()->deletePrincipal(UMManager::getUserByName('charlie'));
			} catch (EyeNoSuchPrincipalException $e) {}
			try {
				UMManager::getInstance()->deletePrincipal(UMManager::getGroupByName('wonderland'));
			} catch (EyeNoSuchPrincipalException $e) {}
			
			$conf = SharingManager::getConfiguration('SharingManager');
			$providerClassName = (string) $conf->providerClassName[0];
			if ($providerClassName == 'DefaultSQLiteShareInfoProvider') {
			if (is_file(USERS_PATH . '/' . $this->owner->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->owner->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
			if (is_file(USERS_PATH . '/' . $this->collaborator1->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->collaborator1->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
			if (is_file(USERS_PATH . '/' . $this->collaborator2->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->collaborator2->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
			if (is_file(USERS_PATH . '/' . $this->collaborator3->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db')) {
				unlink(USERS_PATH . '/' . $this->collaborator3->getName() . '/' . USERS_CONF_DIR . '/' . USERS_SHARE_DIR . '/shares.db');
			}
			} else if ($providerClassName == 'DefaultMySQLShareInfoProvider') {
				require_once SERVICE_SHARING_SHARINGMANAGERS_PROVIDERS_PATH . '/DefaultMySQLShareInfoProvider.php';
				$dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
				$dao->send('TRUNCATE TABLE ' . DefaultMySQLShareInfoProvider::SHAREINFO_TABLE_NAME);
				$dao->send('TRUNCATE TABLE ShareableVirtualFilesHandler');
			}
			
			try {
				ProcManager::getInstance()->kill(ProcManager::getInstance()->getProcessByPid(self::$MyProcPid));
			} catch (EyeProcException $e) {}
			ProcManager::getInstance()->setCurrentProcess(self::$InitProcessToRestore);
		}
	}
	
	private function loginAsRoot() {
		$proc = ProcManager::getInstance()->getCurrentProcess();
		try {
			$proc->getLoginContext()->logout();
		} catch (EyeException $e) {}
		$proc->getLoginContext()->getSubject()->getPrivateCredentials()->clear();
		$proc->getLoginContext()->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('root', 'root'));
		$proc->getLoginContext()->login();
		
		return $proc->getLoginContext()->getEyeosUser();
	}
	
	private function loginAsJohn() {		
		$proc = ProcManager::getInstance()->getCurrentProcess();
		try {
			$proc->getLoginContext()->logout();
		} catch (EyeException $e) {}
		$proc->getLoginContext()->getSubject()->getPrivateCredentials()->clear();
		$proc->getLoginContext()->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('john', 'john'));
		$proc->getLoginContext()->login();
		
		return $proc->getLoginContext()->getEyeosUser();
	}
	
	private function loginAsAlice() {		
		$proc = ProcManager::getInstance()->getCurrentProcess();
		try {
			$proc->getLoginContext()->logout();
		} catch (EyeException $e) {}
		$proc->getLoginContext()->getSubject()->getPrivateCredentials()->clear();
		$proc->getLoginContext()->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('alice', 'alice'));
		$proc->getLoginContext()->login();
		
		return $proc->getLoginContext()->getEyeosUser();
	}

	public function testAddCollaborator() {		
		$this->assertEquals(0, count($this->fixture->getAllCollaborators()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$collabs = $this->fixture->getAllCollaborators();
		$this->assertEquals(1, count($collabs));
		$this->assertEquals($this->collaborator1, current($collabs));
		
		try {
			$perms = new SharePermission();
			$this->fail();
		} catch (EyeErrorException $e) {
			// normal situation
		}
		
		$perms = new SharePermission('read');
		SharingManager::getInstance()->addCollaborator($this->fixture, $this->collaborator2, $perms);
		$collabs = $this->fixture->getAllCollaborators();
		$this->assertEquals(2, count($collabs));
		$this->assertTrue(in_array($this->collaborator1, $collabs));
		$this->assertTrue(in_array($this->collaborator2, $collabs));
		
		// Try to add a collaborator without being the owner
		$this->loginAsAlice();
		try {
			$perms = new SharePermission('read');
			SharingManager::getInstance()->addCollaborator($this->fixture, $this->collaborator3, $perms);
			$this->fail();
		} catch (EyeAccessControlException $e) {
			// normal situation
		}
		
		$this->loginAsJohn();
	}
	
	public function testGetAllCollaborators() {
		//see testEyeUserFile_addCollaborator()
	}
	
	public function testEyeUserFile_getAllEditors() {
		$this->assertEquals(0, count($this->fixture->getAllEditors()));
		$perms = new SharePermission(array('read', 'WRITE'));
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		
		$editors = $this->fixture->getAllEditors();
		$this->assertEquals(1, count($editors));
		$this->assertEquals($this->collaborator1, current($editors));
		
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$editors = $this->fixture->getAllEditors();
		$this->assertEquals(2, count($editors));
		$this->assertEquals(array(
			$this->collaborator1->getId() => $this->collaborator1,
			$this->collaborator3->getId() => $this->collaborator3
		), $editors);
	}
	
	public function testGetAllShareInfo() {
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		
		$shareInfos = $this->fixture->getAllShareInfo();
		$this->assertEquals(2, count($shareInfos));
		$this->assertEquals($shareInfos, SharingManager::getInstance()->getAllShareInfo($this->fixture));
		
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$shareInfos = $this->fixture->getAllShareInfo();
		$this->assertEquals(3, count($shareInfos));
		$this->assertEquals($shareInfos, SharingManager::getInstance()->getAllShareInfo($this->fixture));
	}
	
	public function testGetAllShareInfoFromOwner() {
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->owner)));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		
		$shareInfos = SharingManager::getInstance()->getAllShareInfoFromOwner($this->owner);
		$this->assertEquals(2, count($shareInfos));
		
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$shareInfos = SharingManager::getInstance()->getAllShareInfoFromOwner($this->owner);
		$this->assertEquals(3, count($shareInfos));
		
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->collaborator1)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->collaborator2)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->collaborator3)));
	}
	
	public function testGetAllShareInfoWithCollaborator() {
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator1, $this->owner)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator2, $this->owner)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator3, $this->owner)));
		
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator1)));
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator1, $this->owner)));
		
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator2)));
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator2, $this->owner)));
		
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator3)));
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator3, $this->owner)));
		
		//TODO Test the difference of result with and without second argument $owner
	}
	
	public function testEyeUserFile_getAllViewers() {
		$this->assertEquals(0, count($this->fixture->getAllViewers()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission(array('READ'));
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		
		$viewers = $this->fixture->getAllViewers();
		$this->assertEquals(2, count($viewers));
		$this->assertEquals(array(
			$this->collaborator1->getId() => $this->collaborator1,
			$this->collaborator2->getId() => $this->collaborator2
		), $viewers);
		
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$viewers = $this->fixture->getAllViewers();
		$this->assertEquals(2, count($viewers));
		$this->assertEquals(array(
			$this->collaborator1->getId() => $this->collaborator1,
			$this->collaborator2->getId() => $this->collaborator2
		), $viewers);
	}
	
	public function testGetShareInfo() {
		//TODO
	}
	
	public function testNotifyShareableObjectDeleted() {
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$this->assertEquals(3, count($this->fixture->getAllShareInfo()));
		$this->assertEquals($this->fixture->getId(), $this->fixture->getId());
		
		//only faking deletion of the file
		SharingManager::getInstance()->notifyShareableObjectDeleted($this->fixture);
		
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$this->assertEquals(3, count($this->fixture->getAllShareInfo()));
		$this->assertEquals($this->fixture->getId(), $this->fixture->getId());
		
		//really deleting the file
		$this->fixture->delete();
		$this->assertFalse($this->fixture->exists());
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
	}
	
	public function testNotifyShareableObjectUpdated() {
		/**** Change shareable object internal properties ****/
		$dir = FSI::getFile('home://~john/myDir');
		$dir->mkdir();
		$targetFile = FSI::getFile('home://~john/myDir/myMovedFile.ext');
		
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		// preconditions
		$this->assertEquals(3, count($this->fixture->getAllShareInfo()));
		$this->assertFalse($targetFile->exists());
		$this->assertEquals(0, count($targetFile->getAllShareInfo()));
		
		$this->fixture->moveTo($targetFile);
		
		// postconditions + preconditions for next operation
		$this->assertTrue($targetFile->exists());
		$this->assertEquals(3, count($targetFile->getAllShareInfo()));
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		
		$targetFile->renameTo('myRenamedFile.ext');
		
		// postconditions
		$this->assertTrue($targetFile->exists());
		$this->assertEquals('myRenamedFile.ext', $targetFile->getName());
		$this->assertEquals(3, count($targetFile->getAllShareInfo()));
		
		$this->tearDown();
		$this->setUp();
		
		/**** Change shareable object's owner ****/
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		
		// preconditions
		$this->assertEquals(2, count($this->fixture->getAllShareInfo()));
		$this->assertEquals(2, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->owner)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->collaborator1)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->collaborator2)));
		
		$this->fixture->chown($this->collaborator1);
		
		// postconditions + preconditions for next operation
		$this->assertEquals(2, count($this->fixture->getAllShareInfo()));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->owner)));
		$this->assertEquals(2, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->collaborator1)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->collaborator2)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator2, $this->owner)));
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->owner, $this->collaborator1)));
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator2, $this->collaborator1)));
		
		//needed to be able to change a file's owner
		$this->loginAsRoot();
		
		try {
			$this->fixture->chown($this->collaborator2);
		} catch (Exception $e) {
			$this->loginAsJohn();
			throw $e;
		}
		
		$this->loginAsJohn();
		
		// postconditions
		$this->assertEquals(2, count($this->fixture->getAllShareInfo()));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromOwner($this->owner)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator2, $this->owner)));
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->owner, $this->collaborator2)));
		$this->assertEquals(1, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator1, $this->collaborator2)));
		$this->assertEquals(0, count(SharingManager::getInstance()->getAllShareInfoFromCollaborator($this->collaborator2, $this->collaborator1)));
	}
	
	public function testRemoveCollaborator() {
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('read');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$collaborators = $this->fixture->getAllCollaborators();
		$this->assertEquals(3, count($collaborators));
		$this->assertTrue(in_array($this->collaborator1, $collaborators));
		$this->assertTrue(in_array($this->collaborator2, $collaborators));
		$this->assertTrue(in_array($this->collaborator3, $collaborators));
		
		$this->fixture->removeCollaborator($this->collaborator1);
		
		$collaborators = $this->fixture->getAllCollaborators();
		$this->assertEquals(2, count($collaborators));
		$this->assertTrue(in_array($this->collaborator2, $collaborators));
		$this->assertTrue(in_array($this->collaborator3, $collaborators));
		
		SharingManager::getInstance()->removeCollaborator($this->fixture, $this->collaborator3);
		
		$collaborators = $this->fixture->getAllCollaborators();
		$this->assertEquals(1, count($collaborators));
		$this->assertTrue(in_array($this->collaborator2, $collaborators));
		
		$this->fixture->removeCollaborator($this->collaborator2);
		
		$collaborators = $this->fixture->getAllCollaborators();
		$this->assertEquals(0, count($collaborators));
		
		// Try to remove a collaborator without being the owner
		$this->loginAsAlice();
		try {
			SharingManager::getInstance()->removeCollaborator($this->fixture, $this->collaborator2);
			$this->fail();
		} catch (EyeAccessControlException $e) {
			// normal situation
		}
		
		$this->loginAsJohn();
	}
	
	public function testUpdateCollaboratorPermission() {
		$this->assertEquals(0, count($this->fixture->getAllShareInfo()));
		$perms = new SharePermission('read,write');
		$this->fixture->addCollaborator($this->collaborator1, $perms);
		$perms = new SharePermission('READ');
		$this->fixture->addCollaborator($this->collaborator2, $perms);
		$perms = new SharePermission('write');
		$this->fixture->addCollaborator($this->collaborator3, $perms);
		
		$this->assertEquals('read,write', SharingManager::getInstance()->getShareInfo($this->fixture, $this->collaborator1)->getPermissions()->getActionsAsString());
		$this->assertEquals('read', SharingManager::getInstance()->getShareInfo($this->fixture, $this->collaborator2)->getPermissions()->getActionsAsString());
		$coll3Perms = SharingManager::getInstance()->getShareInfo($this->fixture, $this->collaborator3)->getPermissions();
		$this->assertEquals('write', $coll3Perms->getActionsAsString());
		
		$perms = new SharePermission('execute');
		$this->fixture->updateCollaboratorPermission($this->collaborator1, $perms);
		$perms = new SharePermission('read,WRITE');
		$this->fixture->updateCollaboratorPermission($this->collaborator2, $perms);
		$perms = new SharePermission(array_merge($coll3Perms->getActions(), array('READ')));
		$this->fixture->updateCollaboratorPermission($this->collaborator3, $perms);
		
		$this->assertEquals('execute', SharingManager::getInstance()->getShareInfo($this->fixture, $this->collaborator1)->getPermissions()->getActionsAsString());
		$this->assertEquals('read,write', SharingManager::getInstance()->getShareInfo($this->fixture, $this->collaborator2)->getPermissions()->getActionsAsString());
		$this->assertEquals('read,write', SharingManager::getInstance()->getShareInfo($this->fixture, $this->collaborator3)->getPermissions()->getActionsAsString());
		
		
		// Try to edit collaborators without being the owner
		$this->loginAsAlice();
		try {
			$perms = new SharePermission(array('read'));
			SharingManager::getInstance()->updateCollaboratorPermission($this->fixture, $this->collaborator2, $perms);
			$this->fail();
		} catch (EyeAccessControlException $e) {
			// normal situation
		}
		
		$this->loginAsJohn();
	}
	
	public function testZZZ() {
		self::$ClassTearDownToRun = true;
	}
}
?>
