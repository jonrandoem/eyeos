<?php
class VirtualFileTest extends PHPUnit_Framework_TestCase {
	private $fixture_file1;
	private $fixture_file1_path;
	private $fixture_metafile1_path;
	private $fixture_file2;
	private $fixture_file2_path;
	
	private $fixture_dir1;
	private $fixture_dir1_path;
	private $fixture_dir2;
	private $fixture_dir2_path;
	
	private $user = null;
	private $group = null;
	
	private static $AliceCreated = false;
	
	private static $InitProcessToRestore = null;
	private static $MyProcPid = null;
	
	
	/**
	 * Executed once before each test method.
	 */
	public function setUp() {
		if (self::$InitProcessToRestore === null) {
			self::$InitProcessToRestore = ProcManager::getInstance()->getCurrentProcess();
		}
		
		$this->fixture_file1_path = USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFile.ext';
		$this->fixture_metafile1_path = USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeFile.ext.xml';
		$this->fixture_file2_path = EYEOS_TESTS_TMP_PATH . '/mySysFile.ext';
		$this->fixture_dir1_path = USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir';
		$this->fixture_dir2_path = EYEOS_TESTS_TMP_PATH . '/mySysDir';

		$this->group = UMManager::getGroupByName(SERVICE_UM_DEFAULTUSERSGROUP);
		
		if (!self::$AliceCreated) {
			try {
				//create group "wonderland"
				$wonderland = UMManager::getInstance()->getNewGroupInstance();
				$wonderland->setName('wonderland');
				UMManager::getInstance()->createGroup($wonderland);
			} catch (EyeGroupAlreadyExistsException $e) {}
			
			try {
				//create user "alice"
				$alice = UMManager::getInstance()->getNewUserInstance();
				$alice->setName('alice');
				$alice->setPassword('alice', true);
				$alice->setPrimaryGroupId($wonderland->getId());
				UMManager::getInstance()->createUser($alice);
			} catch (EyeUserAlreadyExistsException $e) {}
			
			self::$AliceCreated = true;
		}
		
		AdvancedPathLib::rmdirs(USERS_PATH . '/john/' . USERS_FILES_DIR, true);
		AdvancedPathLib::rmdirs(USERS_PATH . '/john/' . USERS_METAFILES_DIR, true);
		if (!is_dir(EYEOS_TESTS_TMP_PATH)) {
			mkdir(EYEOS_TESTS_TMP_PATH, 0777, true);
		}
		AdvancedPathLib::rmdirs(EYEOS_TESTS_TMP_PATH, true);
		
		$this->fixture_file1 = FSI::getFile('home://~john/myHomeFile.ext');
		file_put_contents($this->fixture_file1_path, 'some content');
		$this->fixture_file2 = FSI::getFile('sys:///tests/tmp/mySysFile.ext');
		file_put_contents($this->fixture_file2_path, 'some other content');
		
		$this->fixture_dir1 = FSI::getFile('home://~john/myHomeDir');
		if (!is_dir($this->fixture_dir1_path)) {
			mkdir($this->fixture_dir1_path);
		}
		$this->fixture_dir2 = FSI::getFile('sys:///tests/tmp/mySysDir');
		if (!is_dir($this->fixture_dir2_path)) {
			mkdir($this->fixture_dir2_path);
		}
		
		$proc = new Process('example');
		$loginContext = new LoginContext('example', new Subject());
		$loginContext->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('john', 'john'));
		$loginContext->login();
		$proc->setLoginContext($loginContext);
		ProcManager::getInstance()->execute($proc);
		self::$MyProcPid = $proc->getPid();
	}

	/**
	 * Executed once after each test method.
	 */
	public function tearDown() {
		try {
			ProcManager::getInstance()->kill(ProcManager::getInstance()->getProcessByPid(self::$MyProcPid));
		} catch (EyeProcException $e) {}
		ProcManager::getInstance()->setCurrentProcess(self::$InitProcessToRestore);		
		
		unset($this->fixture_file1);
		unset($this->fixture_file2);
		unset($this->fixture_dir1);
		unset($this->fixture_dir2);
		if (is_file($this->fixture_file1_path)) {
			unlink($this->fixture_file1_path);
		}
		if (is_file($this->fixture_file2_path)) {
			unlink($this->fixture_file2_path);
		}
		if (is_dir($this->fixture_dir1_path)) {
			try {
				AdvancedPathLib::rmdirs($this->fixture_dir1_path);
			} catch (Exception $e) {}
		}
		if (is_dir($this->fixture_dir2_path)) {
			try {
				AdvancedPathLib::rmdirs($this->fixture_dir2_path);
			} catch (Exception $e) {}
		}
		AdvancedPathLib::rmdirs(EYEOS_TESTS_TMP_PATH);
	}
	
	private static function logInAsRoot() {
		$loginContext = ProcManager::getInstance()->getCurrentProcess()->getLoginContext();
		if ($loginContext->getEyeosUser()->getName() != 'root') {
			$loginContext->logout();
			$loginContext->getSubject()->getPrivateCredentials()->clear();
			$loginContext->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('root', 'root'));
			$loginContext->login();
		}
	}
	
	private static function logInAsJohn() {
		$loginContext = ProcManager::getInstance()->getCurrentProcess()->getLoginContext();
		if ($loginContext->getEyeosUser()->getName() != 'john') {
			$loginContext->logout();
			$loginContext->getSubject()->getPrivateCredentials()->clear();
			$loginContext->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('john', 'john'));
			$loginContext->login();
		}
	}
	
	private static function logInAsAlice() {
		$loginContext = ProcManager::getInstance()->getCurrentProcess()->getLoginContext();
		if ($loginContext->getEyeosUser()->getName() != 'alice') {
			$loginContext->logout();
			$loginContext->getSubject()->getPrivateCredentials()->clear();
			$loginContext->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('alice', 'alice'));
			$loginContext->login();
		}
	}
	
	public function test__construct() {
		$this->assertTrue($this->fixture_file1 instanceof EyeosAbstractVirtualFile);
		$this->assertTrue($this->fixture_file2 instanceof EyeosAbstractVirtualFile);
		$this->assertTrue($this->fixture_dir1 instanceof EyeosAbstractVirtualFile);
		$this->assertTrue($this->fixture_dir2 instanceof EyeosAbstractVirtualFile);
	}
	
	public function testCheckAccessPermissions() {
		//TODO
	}
	
	public function testCheckDeletePermissions() {
		//TODO
	}
	
	public function testCheckReadPermissions() {
		//TODO
	}
	
	public function testCheckWritePermissions() {
		//TODO
	}
	
	public function testChgrp() {
		/**** home file ****/
		$meta = $this->fixture_file1->getMeta();
		$meta->set('someKey', 'someValue');
		$this->fixture_file1->setMeta($meta);
		$this->assertEquals(SERVICE_UM_DEFAULTUSERSGROUP, $this->fixture_file1->getGroup());
		
		try {
			$this->fixture_file1->chgrp('myOtherGroup');
			$this->fail();
		} catch (EyeNoSuchGroupException $e) {
			// normal situation
		}
		$this->assertTrue($this->fixture_file1->chgrp('users'));
		
		$this->assertEquals('users', $this->fixture_file1->getGroup());
		$meta->set(EyeosAbstractVirtualFile::METADATA_KEY_GROUP, 'users');
		$this->assertEquals($meta, $this->fixture_file1->getMeta());
		
		//TODO: test sys files when metadata will be implemented for them
	}
	
	public function testChmod() {
		/**** home file ****/
		$meta = $this->fixture_file1->getMeta();
		$meta->set('someKey', 'someValue');
		$this->fixture_file1->setMeta($meta);
		$this->assertEquals('-rw-------', $this->fixture_file1->getPermissions(false));
		$this->assertTrue($this->fixture_file1->chmod(0754));
		$this->assertEquals('-rwxr-xr--', $this->fixture_file1->getPermissions(false));
		$meta->set(EyeosAbstractVirtualFile::METADATA_KEY_PERMISSIONS, '-rwxr-xr--');
		$this->assertEquals($meta, $this->fixture_file1->getMeta());
		
		//TODO: test sys files when metadata will be implemented for them
	}
	
	public function testChown() {
		/**** home file ****/
		$meta = $this->fixture_file1->getMeta();
		$meta->set('someKey', 'someValue');
		$this->fixture_file1->setMeta($meta);
		$this->assertEquals('john', $this->fixture_file1->getOwner());
		
		// non-existing user => fail
		try {
			$this->fixture_file1->chown('myOtherOwner');
			$this->fail();
		} catch (EyeNoSuchUserException $e) {
			// normal situation
		}
		
		// existing user => success
		$this->assertTrue($this->fixture_file1->chown('root'));
		
		$this->assertEquals('root', $this->fixture_file1->getOwner());
		$meta->set(EyeosAbstractVirtualFile::METADATA_KEY_OWNER, 'root');
		$this->assertEquals($meta, $this->fixture_file1->getMeta());
		
		//try to revert the owner once it's changed => fail
		try {
			$this->fixture_file1->chown('john');
			$this->fail();
		} catch (EyeAccessControlException $e) {
			// normal situation
		}
		
		// same as root => success
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file1->chown('john'));
		
		/**** home file ****/
		self::logInAsAlice();
		
		// try as a non-owner
		try {
			$this->fixture_file1->chown('alice');
			$this->fail();
		} catch (EyeAccessControlException $e) {
			// normal situation
		}
		self::logInAsJohn();
		
		
		//TODO: test sys files when metadata will be implemented for them
	}
	
	/**
	 * TODO: INCOMPLETE! MUST ALSO CHECK OWNER/GROUP/PERMISSIONS OF TARGET FILES AND FOLDERS
	 */
	public function testCopyTo() {
		/**** home 2 home ****/
		$this->fixture_file1->createNewFile(true);
		$this->fixture_file1->chmod(0766);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$meta = $this->fixture_file1->getMeta();
		$this->assertEquals('john', $this->fixture_file1->getOwner());
		$this->assertEquals('users', $this->fixture_file1->getGroup());
		$meta->set('myDummyMetaValue', 'someValueHere');
		$this->fixture_file1->setMeta($meta);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$this->assertTrue(is_file($this->fixture_file1_path));
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		$this->assertFalse(is_file($this->fixture_dir1_path . '/myHomeFile.ext'));
		$this->assertEquals('someValueHere', $this->fixture_file1->getMeta()->get('myDummyMetaValue'));
		
		$this->assertTrue($this->fixture_file1->copyTo($this->fixture_dir1));
		
		$this->assertTrue(is_file($this->fixture_file1_path));
		$targetPath = $this->fixture_dir1_path . '/myHomeFile.ext';
		$this->assertTrue(is_file($targetPath));
		$targetFile = FSI::getFile('home://~john/myHomeDir/myHomeFile.ext');
		$this->assertEquals('someValueHere', $targetFile->getMeta()->get('myDummyMetaValue'));
		$this->assertEquals(file_get_contents($this->fixture_file1_path), file_get_contents($targetPath));
		$this->assertEquals('john', $targetFile->getOwner());
		$this->assertEquals('users', $targetFile->getGroup());
		$this->assertEquals(AdvancedPathLib::permsToUnix(EyeUserFile::PERMISSIONS_MASK_FILE & ~$targetFile->getUMask()), $targetFile->getPermissions(false));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** home 2 sys ****/
		$this->assertFalse(is_file($this->fixture_metafile1_path));
		$meta = new VirtualFileMetaData();
		$meta->set('myDummyMetaValue', 'someValueHere');
		$this->fixture_file1->setMeta($meta);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$this->assertTrue(is_file($this->fixture_file1_path));
		$this->assertTrue(is_dir($this->fixture_dir2_path));
		$this->assertFalse(is_file($this->fixture_dir2_path . '/myHomeFile.ext'));
		$this->assertEquals('someValueHere', $this->fixture_file1->getMeta()->get('myDummyMetaValue'));
		
		//as normal user => fails
		try {
			$this->fixture_file1->copyTo($this->fixture_dir2);
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file1->copyTo($this->fixture_dir2));
		self::logInAsJohn();
		
		$this->assertTrue(is_file($this->fixture_file1_path));
		$targetPath = $this->fixture_dir2_path . '/myHomeFile.ext';
		$this->assertTrue(is_file($targetPath));
		//TODO: metadata management for sys:// files?
		$this->assertEquals(file_get_contents($this->fixture_file1_path), file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** sys 2 sys ****/
		$this->assertTrue(is_file($this->fixture_file2_path));
		$this->assertTrue(is_dir($this->fixture_dir2_path));
		$this->assertFalse(is_file($this->fixture_dir2_path . '/mySysFile.ext'));
		
		//as normal user => fails
		try {
			$this->fixture_file2->copyTo($this->fixture_dir2);
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file2->copyTo($this->fixture_dir2));
		self::logInAsJohn();
		
		$this->assertTrue(is_file($this->fixture_file2_path));
		$targetPath = $this->fixture_dir2_path . '/mySysFile.ext';
		$this->assertTrue(is_file($targetPath));
		//TODO: metadata management for sys:// files?
		$this->assertEquals(file_get_contents($this->fixture_file2_path), file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** sys 2 home ****/
		$this->assertTrue(is_file($this->fixture_file2_path));
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		$this->assertFalse(is_file($this->fixture_dir1_path . '/mySysFile.ext'));
		
		//as normal user => succeeds (sys:// is mostly read-only by everyone)
		$this->fixture_file2->copyTo($this->fixture_dir1);
		
		$this->assertTrue(is_file($this->fixture_file2_path));
		$targetPath = $this->fixture_dir1_path . '/mySysFile.ext';
		$this->assertTrue(is_file($targetPath));
		//TODO: metadata management for sys:// files?
		$this->assertEquals(file_get_contents($this->fixture_file2_path), file_get_contents($targetPath));
		@unlink($targetPath);
		$this->assertFalse(is_file($targetPath));
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file2->copyTo($this->fixture_dir1));
		self::logInAsJohn();
		
		$this->assertTrue(is_file($this->fixture_file2_path));
		$targetPath = $this->fixture_dir1_path . '/mySysFile.ext';
		$this->assertTrue(is_file($targetPath));
		//TODO: metadata management for sys:// files?
		$this->assertEquals(file_get_contents($this->fixture_file2_path), file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** dir to dir ****/
		$dirs = FSI::getFile('home://~john/myHomeDir2/subDir1/subDir2');
		$dirs->mkdirs(0775);
		$dir = FSI::getFile('home://~john/myHomeDir2');
		$dir1 = FSI::getFile('home://~john/myHomeDir2/subDir1');
		$dir2 = FSI::getFile('home://~john/myHomeDir2/subDir1/subDir2');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext', 'subfile content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext', 'subfile1 content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext', 'subfile2 content');
		$myMeta = new VirtualFileMetaData();
		$myMeta->set('someKey', 'someValue');
		$subFile = FSI::getFile('home://~john/myHomeDir2/subFile.ext');
		$subFile->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue1');
		$subFile1 = FSI::getFile('home://~john/myHomeDir2/subDir1/subFile1.ext');
		$subFile1->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue2');
		$subFile2 = FSI::getFile('home://~john/myHomeDir2/subDir1/subDir2/subFile2.ext');
		$subFile2->setMeta($myMeta);
		
		$this->assertEquals('subfile content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext'));
		$this->assertEquals('john', $dir1->getOwner());
		$this->assertEquals('users', $dir1->getGroup());
		$this->assertEquals('-rwxrwxr-x', $dir1->getPermissions(false));
		$this->assertEquals('john', $dir2->getOwner());
		$this->assertEquals('users', $dir2->getGroup());
		$this->assertEquals('-rwxrwxr-x', $dir2->getPermissions(false));
		$this->assertEquals('someValue', $subFile->getMeta()->get('someKey'));
		$this->assertEquals('someValue1', $subFile1->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2->getMeta()->get('someKey'));
		
		$this->assertTrue($dir->copyTo($this->fixture_dir1));
		
		//check dirs existence
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir'));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/'));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subDir1'));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subDir1/subDir2'));
		
		//check files contents
		$this->assertEquals('subfile content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subFile.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subDir1/subDir2/subFile2.ext'));
		
		//check metafiles content
		$subFileTarget = FSI::getFile('home://~john/myHomeDir/myHomeDir2/subFile.ext');
		$subFile1Target = FSI::getFile('home://~john/myHomeDir/myHomeDir2/subDir1/subFile1.ext');
		$subFile2Target = FSI::getFile('home://~john/myHomeDir/myHomeDir2/subDir1/subDir2/subFile2.ext');
		$this->assertEquals('someValue', $subFileTarget->getMeta()->get('someKey'));
		$this->assertEquals('someValue1', $subFile1Target->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2Target->getMeta()->get('someKey'));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** dir to dir with same structure ****/
		mkdir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2', 0777, true);
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subFileA.ext', 'subfileA content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2/subFileB.ext', 'subfileB content');
		mkdir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2', 0777, true);
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext', 'subfile content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext', 'subfile1 content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext', 'subfile2 content');
		$dir = FSI::getFile('home://~john/myHomeDir2/subDir1');
		$myMeta = new VirtualFileMetaData();
		$myMeta->set('someKey', 'someValue');
		$subFile = FSI::getFile('home://~john/myHomeDir2/subFile.ext');
		$subFile->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue1');
		$subFile1 = FSI::getFile('home://~john/myHomeDir2/subDir1/subFile1.ext');
		$subFile1->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue2');
		$subFile2 = FSI::getFile('home://~john/myHomeDir2/subDir1/subDir2/subFile2.ext');
		$subFile2->setMeta($myMeta);
		
		$this->assertEquals('subfile content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext'));
		$this->assertEquals('someValue', $subFile->getMeta()->get('someKey'));
		$this->assertEquals('someValue1', $subFile1->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2->getMeta()->get('someKey'));
		
		$this->assertTrue($dir->copyTo($this->fixture_dir1));
		
		//check files contents
		$this->assertEquals('subfileA content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subFileA.ext'));
		$this->assertEquals('subfileB content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2/subFileB.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2/subFile2.ext'));
		
		//check metafiles content
		$subFile1Target = FSI::getFile('home://~john/myHomeDir/subDir1/subFile1.ext');
		$subFile2Target = FSI::getFile('home://~john/myHomeDir/subDir1/subDir2/subFile2.ext');
		$this->assertEquals('someValue1', $subFile1Target->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2Target->getMeta()->get('someKey'));
	}
	
	public function testCreateNewFile() {		
		/**** non existing user file (! metadata !) ****/
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFileZ.ext'));
		$file = FSI::getFile('home://~john/myHomeFileZ.ext');
		$this->assertNull($file->getMeta());
		$this->assertTrue($file->createNewFile());
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFileZ.ext'));
		
		//check metadata
		$meta = $file->getMeta();
		$this->assertNotNull($meta);
		$this->assertEquals('john', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_OWNER));
		$this->assertEquals('users', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_GROUP));
		$this->assertEquals(AdvancedPathLib::permsToUnix(0666 & ~$file->getUMask()), $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_PERMISSIONS));
		
		
		/**** existing user file / no overwrite ****/
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFileZ.ext'));
		$file = FSI::getFile('home://~john/myHomeFileZ.ext');
		$meta = $file->getMeta();
		$this->assertNotNull($meta);
		$meta->set('someKey', 'someValue');
		$file->setMeta($meta);
		$this->assertEquals('someValue', $file->getMeta()->get('someKey'));
		try {
			$file->createNewFile(false);
		} catch (EyeIOException $e) {
			// normal situation
		}
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFileZ.ext'));
		$this->assertEquals('someValue', $file->getMeta()->get('someKey'));
		
		
		/**** existing user file / overwrite (! metadata !) ****/
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFileZ.ext'));
		$file = FSI::getFile('home://~john/myHomeFileZ.ext');
		$file->chmod(0702);
		$meta = new VirtualFileMetaData($file->getMeta());
		$meta->set(EyeosAbstractVirtualFile::METADATA_KEY_OWNER, 'root');
		$meta->set(EyeosAbstractVirtualFile::METADATA_KEY_GROUP, 'root');
		$file->setMeta($meta);
		$this->assertEquals('someValue', $file->getMeta()->get('someKey'));
		$this->assertEquals('root', $file->getMeta()->get(EyeosAbstractVirtualFile::METADATA_KEY_OWNER));
		$file->createNewFile(true);
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFileZ.ext'));
		
		//check metadata
		$meta = $file->getMeta();
		$this->assertNotNull($meta);
		$this->assertNotEquals('someValue', $meta->get('someKey'));
		$this->assertEquals('john', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_OWNER));
		$this->assertEquals('users', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_GROUP));
		$this->assertEquals(AdvancedPathLib::permsToUnix(0666 & ~$file->getUMask()), $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_PERMISSIONS));
		
		
		/**** non existing sys file ****/
		$this->assertFalse(is_file(EYEOS_TESTS_TMP_PATH . '/mySysFileZ.ext'));
		$file = FSI::getFile('sys:///tests/tmp/mySysFileZ.ext');
		
		//as normal user => fails
		try {
			$file->createNewFile();
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($file->createNewFile());
		self::logInAsJohn();
		
		$this->assertTrue(is_file(EYEOS_TESTS_TMP_PATH . '/mySysFileZ.ext'));
	}
	
	public function testCreateNewLink() {
		/**** user file (! metadata !) ****/
		unlink($this->fixture_file1_path);
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFile.ext'));
		$this->assertNull($this->fixture_file1->getMeta());
		$this->assertTrue($this->fixture_file1->createNewLink($this->fixture_dir1));
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFile.ext'));
		$this->assertTrue($this->fixture_file1->isLink());
		$this->assertEquals($this->fixture_dir1, $this->fixture_file1->getLinkTarget());
		
		//check metadata
		$meta = $this->fixture_file1->getMeta();
		$this->assertNotNull($meta);
		$this->assertEquals('john', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_OWNER));
		$this->assertEquals('users', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_GROUP));
		$this->assertEquals(AdvancedPathLib::permsToUnix(0777), $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_PERMISSIONS));
		
		
		/**** system file ****/
		unlink($this->fixture_file2_path);
		try {
			$this->fixture_file2->createNewLink($this->fixture_dir2);
			$this->fail();
		} catch (EyeUnsupportedOperationException $e) {
			// normal situation
		}
	}
	
	public function testDelete() {
		/**** existing home file (! metadata !) ****/
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFile.ext'));
		$this->fixture_file1->setMeta(new VirtualFileMetaData());
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeFile.ext.xml'));
		$this->assertTrue($this->fixture_file1->delete());
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFile.ext'));
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeFile.ext.xml'));
		
		/**** existing home dir (! metadata for subfiles and subdirs !) ****/
		$subFile = $this->fixture_dir1->getChildFile('myHomeFile.ext');
		$subFile->createNewFile();
		$subDir = $this->fixture_dir1->getChildFile('mySubDir');
		$subDir->mkdir();
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir'));
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeFile.ext'));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/mySubDir'));
		$this->assertTrue($this->fixture_dir1->delete(true));
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir'));
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeFile.ext'));
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/mySubDir'));
		
		//check metafiles
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeDir/myHomeFile.ext.xml'));
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeDir/mySubDir.xml'));
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeDir.xml'));
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeDir'));
		
		/**** non existing sys file ****/
		unlink($this->fixture_file2_path);
		$this->assertFalse(is_file($this->fixture_file2_path));
		try {
			//as normal user => fails because of the permissions
			try {
				$this->fixture_file2->delete();
				$this->fail();
			} catch (EyeAccessControlException $e) {}
			
			//as root => fails because the file does not exist
			self::logInAsRoot();
			$this->fixture_file2->delete();
			$this->fail();
		} catch (EyeFileNotFoundException $e) {
			// normal situation
		}
		self::logInAsJohn();
		
		/**** existing home dir / only contents ****/
		$this->fixture_dir1->mkdir();
		$meta = $this->fixture_dir1->getMeta();
		$subFile = $this->fixture_dir1->getChildFile('myHomeFile.ext');
		$subFile->createNewFile();
		$subDir = $this->fixture_dir1->getChildFile('mySubDir');
		$subDir->mkdir();
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir'));
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeFile.ext'));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/mySubDir'));
		$this->assertTrue($this->fixture_dir1->delete(true, true));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir'));
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeFile.ext'));
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/mySubDir'));
		
		//check metafiles
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeDir/myHomeFile.ext.xml'));
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeDir/mySubDir.xml'));
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeDir.xml'));
		$this->assertEquals($meta, $this->fixture_dir1->getMeta());
	}
	
	public function testExists() {
		//existing home file
		$this->assertTrue($this->fixture_file1->exists());
		unlink($this->fixture_file1_path);
		$this->assertFalse($this->fixture_file1->exists());
		
		//existing home dir
		$this->assertTrue($this->fixture_dir1->exists());
		rmdir($this->fixture_dir1_path);
		$this->assertFalse($this->fixture_dir1->exists());
		
		//existing sys file
		$this->assertTrue($this->fixture_file2->exists());
		unlink($this->fixture_file2_path);
		$this->assertFalse($this->fixture_file2->exists());
		
		//existing sys dir
		$this->assertTrue($this->fixture_dir2->exists());
		rmdir($this->fixture_dir2_path);
		$this->assertFalse($this->fixture_dir2->exists());
	}
	
	public function testGetAbsolutePath() {
		$this->assertEquals('home://~john/myHomeFile.ext', $this->fixture_file1->getAbsolutePath());
		$this->assertEquals('home://~john/myHomeDir', $this->fixture_dir1->getAbsolutePath());
		
		$this->assertEquals('sys:///tests/tmp/mySysFile.ext', $this->fixture_file2->getAbsolutePath());
		$this->assertEquals('sys:///tests/tmp/mySysDir', $this->fixture_dir2->getAbsolutePath());
		
		$file = FSI::getFile('home:///~john//myNonExistingDir/mySubDir/myFile.ext/');
		$this->assertEquals('home://~john/myNonExistingDir/mySubDir/myFile.ext', $file->getAbsolutePath());
	}
	
	public function testGetChildFile() {
		/**** existing home file ****/
		$childFile1 = FSI::getFile('home://~john/myChildFile.ext');
		$this->assertEquals($childFile1, $this->fixture_file1->getChildFile('myChildFile.ext'));
		
		
		/**** existing home dir ****/
		$childFile2 = FSI::getFile('home://~john/myHomeDir/myChildFile.ext');
		$this->assertEquals($childFile2, $this->fixture_dir1->getChildFile('myChildFile.ext'));
		
		
		/**** non existing home file ****/
		$file = FSI::getFile('home://~john/myNonExistingFile.ext');
		$this->assertEquals($childFile1, $file->getChildFile('myChildFile.ext'));
		
		
		/**** existing sys file ****/
		$childFile1 = FSI::getFile('sys:///tests/tmp/myChildFile.ext');
		$this->assertEquals($childFile1, $this->fixture_file2->getChildFile('myChildFile.ext'));
		
		
		/**** existing sys dir ****/
		$childFile2 = FSI::getFile('sys:///tests/tmp/mySysDir/myChildFile.ext');
		$this->assertEquals($childFile2, $this->fixture_dir2->getChildFile('myChildFile.ext'));
	}
	
	public function testGetContents() {
		/**** existing home file ****/
		$this->assertEquals(file_get_contents($this->fixture_file1_path), $this->fixture_file1->getContents());
		$this->assertNotEquals('my testGetContents() contents', $this->fixture_file1->getContents());
		file_put_contents($this->fixture_file1_path, 'my testGetContents() contents');
		$this->assertEquals('my testGetContents() contents', $this->fixture_file1->getContents());
		
		/**** existing home dir ****/
		try {
			$this->fixture_dir1->getContents();
			$this->fail();
		} catch (EyeBadMethodCallException $e) {
			// normal situation
		}
		
		/**** existing sys file ****/
		//as normal user => succeeds (sys:// is mostly read-only by everyone)
		$this->assertEquals(file_get_contents($this->fixture_file2_path), $this->fixture_file2->getContents());
		$this->assertNotEquals('my testGetContents() contents', $this->fixture_file2->getContents());
		file_put_contents($this->fixture_file2_path, 'my testGetContents() contents');
		$this->assertEquals('my testGetContents() contents', $this->fixture_file2->getContents());
		file_put_contents($this->fixture_file2_path, '');
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertEquals(file_get_contents($this->fixture_file2_path), $this->fixture_file2->getContents());
		$this->assertNotEquals('my testGetContents() contents', $this->fixture_file2->getContents());
		file_put_contents($this->fixture_file2_path, 'my testGetContents() contents');
		$this->assertEquals('my testGetContents() contents', $this->fixture_file2->getContents());
		self::logInAsJohn();
		
		/**** non existing home file ****/
		$file = FSI::getFile('home://~john/myNonExistingFile.ext');
		try {
			$file->getContents();
			$this->fail();
		} catch (EyeFileNotFoundException $e) {
			// normal situation
		}
	}
	
	public function testGetGroup() {
		/**
		 * @see testChgrp()
		 */
	}
	
	public function testGetLinkTarget() {
		/**** existing home link ****/
		$link = FSI::getFile('home://~john/myHomeLink.ext');
		$target = FSI::getFile('ftp://eyeos.org/dummyTarget');
		$link->createNewLink($target);
		$this->assertNotNull($target);
		$this->assertEquals($target, $link->getLinkTarget());
		
		/**** existing home file ****/
		$this->fixture_file1->setMeta(new VirtualFileMetaData());		//just to avoid accessing null metadata
		try {
			$this->fixture_file1->getLinkTarget();
			$this->fail();
		} catch (EyeUnsupportedOperationException $e) {
			// normal situation
		}
		
		/**** existing home dir ****/
		$this->fixture_dir1->setMeta(new VirtualFileMetaData());		//just to avoid accessing null metadata
		try {
			$this->fixture_dir1->getLinkTarget();
			$this->fail();
		} catch (EyeUnsupportedOperationException $e) {
			// normal situation
		}
		
		//TODO: test sys files when metadata will be implemented for them
	}
	
	public function testGetMeta() {
		/**** existing home file ****/
		$myMeta = $this->fixture_file1->getMeta();
		$myMeta->set('myKey1', 'myValue1');
		MetaManager::getInstance()->storeMeta($this->fixture_file1, $myMeta);
		$this->assertNotNull($this->fixture_file1->getMeta());
		$this->assertEquals($myMeta, $this->fixture_file1->getMeta());
		
		/**** existing home dir ****/
		$myMeta = $this->fixture_dir1->getMeta();
		$myMeta->set('myKey2', 'myValue2');
		MetaManager::getInstance()->storeMeta($this->fixture_dir1, $myMeta);
		$this->assertNotNull($this->fixture_dir1->getMeta());
		$this->assertEquals($myMeta, $this->fixture_dir1->getMeta());
		
		//TODO: test sys files when metadata will be implemented for them
	}
	
	public function testGetOwner() {
		/**
		 * @see testChown()
		 */
	}
	
	public function testGetParentFile() {
		/**** home files/dirs ****/
		$myHomeFile1 = FSI::getFile('home://~john');
		$this->assertEquals($myHomeFile1, $this->fixture_file1->getParentFile());
		$myHomeDir1 = FSI::getFile('home://~john/myHomeDir/myNonExistingFile.ext');
		$this->assertEquals($this->fixture_dir1, $myHomeDir1->getParentFile());
		
		/**** sys files/dirs ****/
		$mySysFile1 = FSI::getFile('sys:///tests/tmp');
		$this->assertEquals($mySysFile1, $this->fixture_file2->getParentFile());
		$mySysRoot = FSI::getFile('sys:///');
		$this->assertEquals($mySysRoot, $mySysRoot->getParentFile());
	}
	
	public function testGetParentPath() {
		/**** home files/dirs ****/
		$this->assertEquals('home://~john/', $this->fixture_file1->getParentPath());
		$myHomeFile2 = FSI::getFile('home://~john/myHomeDir/myChildFile.ext');
		$this->assertEquals('home://~john/myHomeDir', $myHomeFile2->getParentPath());
		$myHomeRootDir = FSI::getFile('home://~john');
		$this->assertEquals('home://~john/', $myHomeRootDir->getParentPath());
		
		/**** sys files/dirs ****/
		$this->assertEquals('sys:///tests/tmp', $this->fixture_file2->getParentPath());
		$mySysFile2 = FSI::getFile('sys:///tests/tmp/mySysDir/myChildFile.ext');
		$this->assertEquals('sys:///tests/tmp/mySysDir', $mySysFile2->getParentPath());
		$mySysRootDir = FSI::getFile('sys:///');
		$this->assertEquals('sys:///', $mySysRootDir->getParentPath());
	}
	
	public function testGetPathFromRoot() {
		/**** home files/dirs ****/
		$this->assertEquals('/myHomeFile.ext', $this->fixture_file1->getPathFromRoot());
		$myHomeFile2 = FSI::getFile('home://~john/myHomeDir/myChildFile.ext');
		$this->assertEquals('/myHomeDir/myChildFile.ext', $myHomeFile2->getPathFromRoot());
		$myHomeRootDir = FSI::getFile('home://~john');
		$this->assertEquals('/', $myHomeRootDir->getPathFromRoot());
		
		/**** sys files/dirs ****/
		$this->assertEquals('/tests/tmp/mySysFile.ext', $this->fixture_file2->getPathFromRoot());
		$mySysFile2 = FSI::getFile('sys:///tests/tmp/mySysDir/myChildFile.ext');
		$this->assertEquals('/tests/tmp/mySysDir/myChildFile.ext', $mySysFile2->getPathFromRoot());
		$mySysRootDir = FSI::getFile('sys:///');
		$this->assertEquals('/', $mySysRootDir->getPathFromRoot());
		$mySysRootDir = FSI::getFile('sys://');							//also with only one slash, just to be sure
		$this->assertEquals('/', $mySysRootDir->getPathFromRoot());
	}
	
	public function testGetPathInfo() {
		/**** home files/dirs ****/
		$myPathinfo = array();
		$this->assertNotEquals($myPathinfo, $this->fixture_file1->getPathInfo());
		$myPathinfo = array(
			'dirname' => 'home://~john/',
			'basename' => 'myHomeFile.ext',
			'extension' => 'ext',
			'filename' => 'myHomeFile'
		);
		$this->assertEquals($myPathinfo, $this->fixture_file1->getPathInfo());
		
		$myPathinfo = array();
		$this->assertNotEquals($myPathinfo, $this->fixture_dir1->getPathInfo());
		$myPathinfo = array(
			'dirname' => 'home://~john/',
			'basename' => 'myHomeDir',
			'filename' => 'myHomeDir'
		);
		$this->assertEquals($myPathinfo, $this->fixture_dir1->getPathInfo());
		
		
		/**** sys files/dirs ****/
		$myPathinfo = array();
		$this->assertNotEquals($myPathinfo, $this->fixture_file2->getPathInfo());
		$myPathinfo = array(
			'dirname' => 'sys:///tests/tmp',
			'basename' => 'mySysFile.ext',
			'extension' => 'ext',
			'filename' => 'mySysFile'
		);
		$this->assertEquals($myPathinfo, $this->fixture_file2->getPathInfo());
		
		$myPathinfo = array();
		$this->assertNotEquals($myPathinfo, $this->fixture_dir2->getPathInfo());
		$myPathinfo = array(
			'dirname' => 'sys:///tests/tmp',
			'basename' => 'mySysDir',
			'filename' => 'mySysDir'
		);
		$this->assertEquals($myPathinfo, $this->fixture_dir2->getPathInfo());
	}
	
	public function testGetPermissions() {
		/**
		 * @see testChmod()
		 */
	}
	
	public function testGetSize() {
		//TODO
	}
	
	public function testIsRoot() {
		/**** home files/dirs ****/
		$this->assertFalse($this->fixture_file1->isRoot());
		$this->assertFalse($this->fixture_dir1->isRoot());
		$this->assertTrue($this->fixture_file1->getParentFile()->isRoot());
		$myHomeRoot = FSI::getFile('home://~john/');
		$this->assertTrue($myHomeRoot->isRoot());
		$myHomeRoot = FSI::getFile('home://~john');
		$this->assertTrue($myHomeRoot->isRoot());
		
		/**** sys files/dirs ****/
		$this->assertFalse($this->fixture_file2->isRoot());
		$this->assertFalse($this->fixture_dir2->isRoot());
		$this->assertFalse($this->fixture_file2->getParentFile()->isRoot());
		$mySysRoot = FSI::getFile('sys:///');
		$this->assertTrue($mySysRoot->isRoot());
		$mySysRoot = FSI::getFile('sys://');
		$this->assertTrue($mySysRoot->isRoot());
	}
	
	public function testListFiles() {
		//TODO
	}
	
	public function testMkdir() {
		/**** non-existing home dir ****/
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDirZ'));
		$file = FSI::getFile('home://~john/myHomeDirZ');
		$this->assertNull($file->getMeta());
		$this->assertTrue($file->mkdir());
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDirZ'));
		
		//check metadata
		$meta = $file->getMeta();
		$this->assertNotNull($meta);
		$this->assertEquals('john', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_OWNER));
		$this->assertEquals('users', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_GROUP));
		$this->assertEquals(AdvancedPathLib::permsToUnix(0777 & ~$file->getUMask()), $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_PERMISSIONS));
		$file->delete();
		
		
		/**** non-existing home dir (mode = 0751) ****/
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDirZ'));
		$file = FSI::getFile('home://~john/myHomeDirZ');
		$this->assertNull($file->getMeta());
		$this->assertTrue($file->mkdir(0751));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDirZ'));
		
		//check metadata ( => rights !)
		$meta = $file->getMeta();
		$this->assertNotNull($meta);
		$this->assertEquals('john', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_OWNER));
		$this->assertEquals('users', $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_GROUP));
		$this->assertEquals(AdvancedPathLib::permsToUnix(0751), $meta->get(EyeosAbstractVirtualFile::METADATA_KEY_PERMISSIONS));
		$file->delete();
		
		
		/**** existing home dir ****/
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		try {
			$this->fixture_dir1->mkdir();
			$this->fail();
		} catch (EyeIOException $e) {
			// normal situation
		}
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		
		//TODO: test sys files when metadata will be implemented for them
	}
	
	public function testMkdirs() {
		//TODO
	}
	
	public function testMoveTo() {
		/**** home 2 home ****/
		$this->fixture_file1->createNewFile(true);
		$this->fixture_file1->chmod(0776);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$meta = $this->fixture_file1->getMeta();
		$meta->set('myDummyMetaValue', 'someValueHere');
		$this->fixture_file1->setMeta($meta);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$this->assertTrue(is_file($this->fixture_file1_path));
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		$this->assertFalse(is_file($this->fixture_dir1_path . '/myHomeFile.ext'));
		$this->assertEquals('someValueHere', $this->fixture_file1->getMeta()->get('myDummyMetaValue'));
		$this->assertEquals('john', $this->fixture_file1->getOwner());
		$this->assertEquals('users', $this->fixture_file1->getGroup());
		$this->assertEquals('-rwxrwxrw-', $this->fixture_file1->getPermissions(false));
		$originalContent = file_get_contents($this->fixture_file1_path);
		
		$this->assertTrue($this->fixture_file1->moveTo($this->fixture_dir1));
		
		$this->assertFalse(is_file($this->fixture_file1_path));
		$targetPath = $this->fixture_dir1_path . '/myHomeFile.ext';
		$this->assertTrue(is_file($targetPath));
		$targetFile = FSI::getFile('home://~john/myHomeDir/myHomeFile.ext');
		$this->assertFalse(is_file($this->fixture_metafile1_path));
		$this->assertEquals('someValueHere', $targetFile->getMeta()->get('myDummyMetaValue'));
		$this->assertEquals('john', $targetFile->getOwner());
		$this->assertEquals('users', $targetFile->getGroup());
		$this->assertEquals('-rwxrwxrw-', $targetFile->getPermissions(false));
		$this->assertNotEquals(EyeosAbstractVirtualFile::PERMISSIONS_MASK_FILE & ~$targetFile->getUMask(), $targetFile->getPermissions());
		$this->assertEquals($originalContent, file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** home 2 sys ****/
		$this->assertFalse(is_file($this->fixture_metafile1_path));
		$meta = new VirtualFileMetaData();
		$meta->set('myDummyMetaValue', 'someValueHere');
		$this->fixture_file1->setMeta($meta);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$this->assertTrue(is_file($this->fixture_file1_path));
		$this->assertTrue(is_dir($this->fixture_dir2_path));
		$this->assertFalse(is_file($this->fixture_dir2_path . '/myHomeFile.ext'));
		$this->assertEquals('someValueHere', $this->fixture_file1->getMeta()->get('myDummyMetaValue'));
		$originalContent = file_get_contents($this->fixture_file1_path);
		
		//as normal user => fails
		try {
			$this->fixture_file1->moveTo($this->fixture_dir2);
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file1->moveTo($this->fixture_dir2));
		self::logInAsJohn();
		
		$this->assertFalse(is_file($this->fixture_file1_path));
		$this->assertFalse(is_file($this->fixture_metafile1_path));
		$targetPath = $this->fixture_dir2_path . '/myHomeFile.ext';
		$this->assertTrue(is_file($targetPath));
		//TODO: metadata management for sys:// files?
		$this->assertEquals($originalContent, file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** sys 2 sys ****/
		$this->assertTrue(is_file($this->fixture_file2_path));
		$this->assertTrue(is_dir($this->fixture_dir2_path));
		$this->assertFalse(is_file($this->fixture_dir2_path . '/mySysFile.ext'));
		$originalContent = file_get_contents($this->fixture_file2_path);
		
		//as normal user => fails
		try {
			$this->fixture_file2->moveTo($this->fixture_dir2);
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file2->moveTo($this->fixture_dir2));
		self::logInAsJohn();		
		
		$this->assertFalse(is_file($this->fixture_file2_path));
		$targetPath = $this->fixture_dir2_path . '/mySysFile.ext';
		$this->assertTrue(is_file($targetPath));
		//TODO: metadata management for sys:// files?
		$this->assertEquals($originalContent, file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** sys 2 home ****/
		$this->assertTrue(is_file($this->fixture_file2_path));
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		$this->assertFalse(is_file($this->fixture_dir1_path . '/mySysFile.ext'));
		$originalContent = file_get_contents($this->fixture_file2_path);
		
		//as normal user => succeeds (sys:// is mostly read-only by everyone)
		$this->fixture_file2->moveTo($this->fixture_dir1);
		
		$this->assertFalse(is_file($this->fixture_file2_path));
		$targetPath = $this->fixture_dir1_path . '/mySysFile.ext';
		$this->assertTrue(is_file($targetPath));
		$targetFile = FSI::getFile('home://~john/myHomeDir/mySysFile.ext');
		$this->assertNotNull($targetFile->getMeta());
		//TODO: metadata management for sys:// files?
		$this->assertEquals($originalContent, file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file2->moveTo($this->fixture_dir1));
		self::logInAsJohn();
		
		$this->assertFalse(is_file($this->fixture_file2_path));
		$targetPath = $this->fixture_dir1_path . '/mySysFile.ext';
		$this->assertTrue(is_file($targetPath));
		$targetFile = FSI::getFile('home://~john/myHomeDir/mySysFile.ext');
		$this->assertNotNull($targetFile->getMeta());
		//TODO: metadata management for sys:// files?
		$this->assertEquals($originalContent, file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** dir to dir ****/
		mkdir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2', 0777, true);
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext', 'subfile content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext', 'subfile1 content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext', 'subfile2 content');
		$dir = FSI::getFile('home://~john/myHomeDir2');
		$myMeta = new VirtualFileMetaData();
		$myMeta->set('someKey', 'someValue');
		$subFile = FSI::getFile('home://~john/myHomeDir2/subFile.ext');
		$subFile->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue1');
		$subFile1 = FSI::getFile('home://~john/myHomeDir2/subDir1/subFile1.ext');
		$subFile1->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue2');
		$subFile2 = FSI::getFile('home://~john/myHomeDir2/subDir1/subDir2/subFile2.ext');
		$subFile2->setMeta($myMeta);
		
		$this->assertEquals('subfile content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext'));
		$this->assertEquals('someValue', $subFile->getMeta()->get('someKey'));
		$this->assertEquals('someValue1', $subFile1->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2->getMeta()->get('someKey'));
		
		$this->assertTrue($dir->moveTo($this->fixture_dir1));
		
		//check original dir non-existence
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2'));
		
		//check files contents
		$this->assertEquals('subfile content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subFile.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/myHomeDir2/subDir1/subDir2/subFile2.ext'));
		
		//check metafiles content
		$subFileTarget = FSI::getFile('home://~john/myHomeDir/myHomeDir2/subFile.ext');
		$subFile1Target = FSI::getFile('home://~john/myHomeDir/myHomeDir2/subDir1/subFile1.ext');
		$subFile2Target = FSI::getFile('home://~john/myHomeDir/myHomeDir2/subDir1/subDir2/subFile2.ext');
		$this->assertEquals('someValue', $subFileTarget->getMeta()->get('someKey'));
		$this->assertEquals('someValue1', $subFile1Target->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2Target->getMeta()->get('someKey'));
		
		$this->tearDown();
		$this->setUp();
		
		
		/**** dir to dir with same structure ****/
		mkdir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2', 0777, true);
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subFileA.ext', 'subfileA content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2/subFileB.ext', 'subfileB content');
		mkdir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2', 0777, true);
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext', 'subfile content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext', 'subfile1 content');
		file_put_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext', 'subfile2 content');
		$dir = FSI::getFile('home://~john/myHomeDir2/subDir1');
		$myMeta = new VirtualFileMetaData();
		$myMeta->set('someKey', 'someValue');
		$subFile = FSI::getFile('home://~john/myHomeDir2/subFile.ext');
		$subFile->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue1');
		$subFile1 = FSI::getFile('home://~john/myHomeDir2/subDir1/subFile1.ext');
		$subFile1->setMeta($myMeta);
		$myMeta = clone $myMeta;
		$myMeta->set('someKey', 'someValue2');
		$subFile2 = FSI::getFile('home://~john/myHomeDir2/subDir1/subDir2/subFile2.ext');
		$subFile2->setMeta($myMeta);
		
		$this->assertEquals('subfile content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subFile.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1/subDir2/subFile2.ext'));
		$this->assertEquals('someValue', $subFile->getMeta()->get('someKey'));
		$this->assertEquals('someValue1', $subFile1->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2->getMeta()->get('someKey'));
		
		$this->assertTrue($dir->moveTo($this->fixture_dir1));
		
		//check original dir non-existence
		$this->assertFalse(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2/subDir1'));
		$this->assertTrue(is_dir(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir2'));
		
		//check files contents
		$this->assertEquals('subfileA content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subFileA.ext'));
		$this->assertEquals('subfileB content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2/subFileB.ext'));
		$this->assertEquals('subfile1 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subFile1.ext'));
		$this->assertEquals('subfile2 content', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir/subDir1/subDir2/subFile2.ext'));
		
		//check metafiles content
		$subFile1Target = FSI::getFile('home://~john/myHomeDir/subDir1/subFile1.ext');
		$subFile2Target = FSI::getFile('home://~john/myHomeDir/subDir1/subDir2/subFile2.ext');
		$this->assertEquals('someValue1', $subFile1Target->getMeta()->get('someKey'));
		$this->assertEquals('someValue2', $subFile2Target->getMeta()->get('someKey'));
		
		
		/**** home to home (source is target) ****/
		$this->fixture_file1->createNewFile(true);
		$this->fixture_file1->chmod(0776);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$meta = $this->fixture_file1->getMeta();
		$meta->set('myDummyMetaValue', 'someValueHere');
		$this->fixture_file1->setMeta($meta);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$this->assertTrue(is_file($this->fixture_file1_path));
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		$this->assertFalse(is_file($this->fixture_dir1_path . '/myHomeFile.ext'));
		$this->assertEquals('someValueHere', $this->fixture_file1->getMeta()->get('myDummyMetaValue'));
		$this->assertEquals('john', $this->fixture_file1->getOwner());
		$this->assertEquals('users', $this->fixture_file1->getGroup());
		$this->assertEquals('-rwxrwxrw-', $this->fixture_file1->getPermissions(false));
		$originalContent = file_get_contents($this->fixture_file1_path);
		
		try {
			$this->fixture_file1->moveTo($this->fixture_file1);
		} catch (EyeIOException $e) {
			// normal situation
		}
		
		$this->assertTrue(is_file($this->fixture_file1_path));
		$targetPath = $this->fixture_file1_path;
		$this->assertTrue(is_file($targetPath));
		$targetFile = FSI::getFile('home://~john/myHomeFile.ext');
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$this->assertEquals('someValueHere', $targetFile->getMeta()->get('myDummyMetaValue'));
		$this->assertEquals('john', $targetFile->getOwner());
		$this->assertEquals('users', $targetFile->getGroup());
		$this->assertEquals('-rwxrwxrw-', $targetFile->getPermissions(false));
		$this->assertNotEquals(EyeosAbstractVirtualFile::PERMISSIONS_MASK_FILE & ~$targetFile->getUMask(), $targetFile->getPermissions());
		$this->assertEquals($originalContent, file_get_contents($targetPath));
	}
	
	public function testPutContents() {
		/**** existing home file ****/
		$this->assertNotEquals('my testGetContents() contents', file_get_contents($this->fixture_file1_path));
		$this->assertEquals(strlen('my testGetContents() contents'), $this->fixture_file1->putContents('my testGetContents() contents'));
		$this->assertEquals('my testGetContents() contents', file_get_contents($this->fixture_file1_path));
		
		/**** existing home file (appending) ****/
		$this->assertNotEquals('my testGetContents() contents ##APPENDED PART##', file_get_contents($this->fixture_file1_path));
		$this->assertEquals(strlen(' ##APPENDED PART##'), $this->fixture_file1->putContents(' ##APPENDED PART##', FILE_APPEND));
		$this->assertEquals('my testGetContents() contents ##APPENDED PART##', file_get_contents($this->fixture_file1_path));
		
		/**** existing home dir ****/
		try {
			$this->fixture_dir1->putContents('test');
			$this->fail();
		} catch (EyeBadMethodCallException $e) {
			// normal situation
		}
		
		/**** existing sys file ****/
		$this->assertNotEquals('my testGetContents() contents', file_get_contents($this->fixture_file1_path));
		
		//as normal user => fails
		try {
			$this->fixture_file2->putContents('my testGetContents() contents');
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertEquals(strlen('my testGetContents() contents'), $this->fixture_file2->putContents('my testGetContents() contents'));
		self::logInAsJohn();
		
		$this->assertEquals('my testGetContents() contents', file_get_contents($this->fixture_file2_path));
		
		/**** non existing home file ****/
		$this->assertFalse(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myNonExistingFile.ext'));
		$file = FSI::getFile('home://~john/myNonExistingFile.ext');
		$this->assertEquals(strlen('my testGetContents() contents'), $file->putContents('my testGetContents() contents'));
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myNonExistingFile.ext'));
		$this->assertEquals('my testGetContents() contents', file_get_contents(USERS_PATH . '/john/' . USERS_FILES_DIR . '/myNonExistingFile.ext'));
	}
	
	public function testRenameTo() {
		/**** existing home file ****/
		$this->assertFalse(is_file($this->fixture_metafile1_path));
		$meta = new VirtualFileMetaData();
		$meta->set('myDummyMetaValue', 'someValueHere');
		$this->fixture_file1->setMeta($meta);
		$this->assertTrue(is_file($this->fixture_metafile1_path));
		$this->assertTrue(is_file($this->fixture_file1_path));
		$targetPath = USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeFile_renamed.ext';
		$this->assertFalse(is_file($targetPath));
		$this->assertEquals('someValueHere', $this->fixture_file1->getMeta()->get('myDummyMetaValue'));
		$originalContent = file_get_contents($this->fixture_file1_path);
		$this->assertTrue($this->fixture_file1->renameTo('myHomeFile_renamed.ext'));
		$this->assertFalse(is_file($this->fixture_file1_path));
		$this->assertTrue(is_file($targetPath));
		$targetFile = FSI::getFile('home://~john/myHomeFile_renamed.ext');
		$this->assertFalse(is_file($this->fixture_metafile1_path));
		$this->assertTrue(is_file(USERS_PATH . '/john/' . USERS_METAFILES_DIR . '/' . USERS_FILES_DIR . '/myHomeFile_renamed.ext.xml'));
		$this->assertEquals('someValueHere', $targetFile->getMeta()->get('myDummyMetaValue'));
		$this->assertEquals($originalContent, file_get_contents($targetPath));
		
		$this->tearDown();
		$this->setUp();
		
		/**** non-existing home file ****/
		unlink($this->fixture_file1_path);
		$this->assertFalse(is_file($this->fixture_file1_path));
		try {
			$this->fixture_file1->renameTo('test');
			$this->fail();
		} catch (EyeFileNotFoundException $e) {
			// normal situation
		}
		
		/**** home dir ****/
		$meta = new VirtualFileMetaData();
		$meta->set('myDummyMetaValue', 'someValueHere');
		$this->fixture_dir1->setMeta($meta);
		$this->assertTrue(is_dir($this->fixture_dir1_path));
		$targetPath = USERS_PATH . '/john/' . USERS_FILES_DIR . '/myHomeDir_renamed';
		$this->assertFalse(is_dir($targetPath));
		$this->assertEquals('someValueHere', $this->fixture_dir1->getMeta()->get('myDummyMetaValue'));
		$oldDir = clone $this->fixture_dir1;
		$this->assertTrue($this->fixture_dir1->renameTo('myHomeDir_renamed'));
		$this->assertFalse(is_dir($this->fixture_dir1_path));
		$this->assertTrue(is_dir($targetPath));
		$targetFile = FSI::getFile('home://~john/myHomeDir_renamed');
		$this->assertNull($oldDir->getMeta());
		$this->assertEquals('someValueHere', $targetFile->getMeta()->get('myDummyMetaValue'));
		
		/**** sys file ****/
		$this->assertTrue(is_file($this->fixture_file2_path));
		$targetPath = EYEOS_TESTS_TMP_PATH . '/mySysFile_renamed.ext';
		$this->assertFalse(is_file($targetPath));
		$originalContent = file_get_contents($this->fixture_file2_path);
		
		//as normal user => fails
		try {
			$this->fixture_file2->renameTo('mySysFile_renamed.ext');
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_file2->renameTo('mySysFile_renamed.ext'));
		self::logInAsJohn();
		
		$this->assertFalse(is_file($this->fixture_file2_path));
		$this->assertTrue(is_file($targetPath));
		$targetFile = FSI::getFile('sys:///tests/tmp/mySysFile_renamed.ext');
		$this->assertEquals($originalContent, file_get_contents($targetPath));
		
		/**** sys dir ****/
		$this->assertTrue(is_dir($this->fixture_dir2_path));
		$targetPath = EYEOS_TESTS_TMP_PATH . '/mySysDir_renamed';
		$this->assertFalse(is_dir($targetPath));
		
		//as normal user => fails
		try {
			$this->fixture_dir2->renameTo('mySysDir_renamed');
			$this->fail();
		} catch (EyeAccessControlException $e) {}
		
		//as root => succeeds
		self::logInAsRoot();
		$this->assertTrue($this->fixture_dir2->renameTo('mySysDir_renamed'));
		self::logInAsJohn();
		
		$this->assertFalse(is_dir($this->fixture_dir2_path));
		$this->assertTrue(is_dir($targetPath));
		$targetFile = FSI::getFile('home://~john/mySysDir_renamed');
	}
	
	public function testSetMeta() {
		/**** existing home file ****/
		$myMeta = $this->fixture_file1->getMeta();
		$myMeta->set('myKey1', 'myValue1');
		$this->fixture_file1->setMeta($myMeta);
		$meta = MetaManager::getInstance()->retrieveMeta($this->fixture_file1);
		$this->assertNotNull($meta);
		$this->assertEquals($myMeta, $meta);
		
		/**** existing home dir ****/
		$myMeta = $this->fixture_dir1->getMeta();
		$myMeta->set('myKey2', 'myValue2');
		$this->fixture_dir1->setMeta($myMeta);
		$meta = MetaManager::getInstance()->retrieveMeta($this->fixture_dir1);
		$this->assertNotNull($meta);
		$this->assertEquals($myMeta, $meta);
	}
}
?>
