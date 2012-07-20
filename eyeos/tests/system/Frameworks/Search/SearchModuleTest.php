<?php
class SearchModuleTest extends PHPUnit_Framework_TestCase {
	private $fixture;
	private $fixture_file;
	private $fixture_file_path;
	private $fixture_newFile_path;
	private $fixture_dir;
	private $fixture_dir_path;
	private $user;
	private $group;
	private $idGroup;
	private $idUser;

	private $input = 'foo lol type:pdf,xml ext:html,xml size:123,345';
    private $query = 'foo lol';
    private $tokens = array(
		'type' => array('pdf','xml'),
    	'ext' => array('html', 'xml'),
    	'size' => array('123', '345')
    );
    
    private static $InitProcessToRestore = null;
	private static $MyProcPid = null;

	public function setUp() {
		if (self::$InitProcessToRestore === null) {
			self::$InitProcessToRestore = ProcManager::getInstance()->getCurrentProcess();
		}
		
		try {
			UMManager::getInstance()->deletePrincipal(UMManager::getInstance()->getUserByName('fakeUser'));
		} catch (EyeNoSuchUserException $e) {}
		try {
			UMManager::getInstance()->deletePrincipal(UMManager::getInstance()->getGroupByName('fakeGroup'));
		} catch (EyeNoSuchGroupException $e) {}
		
		$this->group = UMManager::getInstance()->getNewGroupInstance();
		$this->group->setName('fakeGroup');
		UMManager::getInstance()->createGroup($this->group);
		$this->idGroup = $this->group->getId();

		$this->user = UMManager::getInstance()->getNewUserInstance();
		$this->user->setName('fakeUser');
		$this->user->setPassword('fakePassword', true);
		$this->user->setPrimaryGroupId($this->group->getId());
		UMManager::getInstance()->createUser($this->user);
		$this->idUser = $this->user->getId();

		$proc = new Process('example');
		$loginContext = new LoginContext('example', new Subject());
		$loginContext->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('fakeUser', 'fakePassword'));
		$loginContext->login();
		$proc->setLoginContext($loginContext);
		ProcManager::getInstance()->execute($proc);
		self::$MyProcPid = $proc->getPid();

		$this->fixture_file_path = USERS_PATH . '/fakeUser/' . USERS_FILES_DIR . '/testFile.txt';
		$this->fixture_newFile_path = USERS_PATH . '/fakeUser/' . USERS_FILES_DIR . '/testDir/testFile2.txt';;
		$this->fixture_file = FSI::getFile('home://~fakeUser/testFile.txt');

		$this->fixture_dir_path = USERS_PATH . '/fakeUser/' . USERS_FILES_DIR . '/testDir';
		$this->fixture_dir = FSI::getFile('home://~fakeUser/testDir');
	}

	public function tearDown() {
		try {
			ProcManager::getInstance()->kill(ProcManager::getInstance()->getProcessByPid(self::$MyProcPid));
		} catch (EyeProcException $e) {}
		ProcManager::getInstance()->setCurrentProcess(self::$InitProcessToRestore);
		
		UMManager::getInstance()->deletePrincipal(UMManager::getInstance()->getUserById($this->idUser));
		UMManager::getInstance()->deletePrincipal(UMManager::getInstance()->getGroupById($this->idGroup));
	}

    // the first test it's done on the SearchQuery class.
    // this class basically use the ParserManager class, so we
    // just check that the parsing it's well done.
    // if it is, means that the ParserManager class is well working as well.
    public function testSearchQueryClass() {
        $searchQuery = new SearchQuery();
        $searchQuery->parseQuery( $this->input );
        $this->assertEquals($this->query, $searchQuery->getQueryString());
        $this->assertEquals($this->tokens, $searchQuery->getQueryTokens());
    }

	// TODO: the code in createUser and createUserDirectory must be cleaned
	// and listeners from FileSearchListener must be added !!!
	public function testISearchCreateUserListener() {
		// check if noaspell and topdirs is setted in the conf file and...
		$this->assertTrue(is_dir(USERS_PATH . '/' . $this->user->getName() . '/conf/recoll/xapiandb'));
	}

    // to test the FileRecollPlugin, which works just in case of file searching,
    // we first check that the string is well formatted for recoll,
	// then we use the testing user to check if the
	// FileSearchListener::directoryCreated()
	// FileSearchListener::fileCreated()
	// FileSearchListener::fileDeleted()
	// FileSearchListener::fileMoved()
	// FileSearchListener::fileRenamed()
	// FileSearchListener::fileWritten()
	// are good working with the recollindex function.
    public function testSearchFileRecollPlugin() {
        $query = "filename:*foo* filename:*lol* type:pdf OR type:xml AND ext:html OR ext:xml";
        $searchQuery = new SearchQuery();
        $searchQuery->setQueryString($this->query);
        $searchQuery->setQueryTokens($this->tokens);

		// we want to check if the SearchManager is well working,
		// means if it is able to load all the required library.
		$searchManager = new SearchManager();
		$searchManager->search($searchQuery);

		// we also want to check if the parsing process
		// gives us a well formatted string.
        $recollPlugin = new SearchFileRecollPlugin();
        $recollPlugin->search($searchQuery);
        $this->assertEquals($query, $recollPlugin->getSearchQuery());

		// FileSearchListener::fileCreated()
		$this->assertFalse(is_file($this->fixture_file_path));
		$this->assertTrue($this->fixture_file->createNewFile());
		$this->assertTrue(is_file($this->fixture_file_path));

		$searchQuery->setQueryString('testFile');
		$searchQuery->setQueryTokens(null);

		$recollPlugin->resetSearchQuery();
		$recollPlugin->search($searchQuery);
		$results = $recollPlugin->getResults();
		$this->assertEquals($results[0]['name'], 'testFile.txt');

		// FileSearchListener::fileDeleted()
		$this->assertTrue(is_file($this->fixture_file_path));
		$this->assertTrue($this->fixture_file->delete());
		$this->assertFalse(is_file($this->fixture_file_path));

		$searchQuery->setQueryString('testFile');
		$searchQuery->setQueryTokens(null);

		$recollPlugin->resetSearchQuery();
		$recollPlugin->search($searchQuery);
		$results = $recollPlugin->getResults();
		$this->assertTrue(empty($results));

		// FileSearchListener::directoryCreated()
		$this->assertFalse(is_dir($this->fixture_dir_path));
		$this->assertTrue($this->fixture_dir->mkdir());
		$this->assertTrue(is_dir($this->fixture_dir_path));

		$searchQuery->setQueryString('testDir');
		$searchQuery->setQueryTokens(null);

		$recollPlugin->resetSearchQuery();
		$recollPlugin->search($searchQuery);
		$results = $recollPlugin->getResults();
		$this->assertEquals($results[0]['name'], 'testDir');

		// FileSearchListener::fileMoved()
		$this->assertFalse(is_file($this->fixture_file_path));
		$this->assertTrue($this->fixture_file->createNewFile());
		$this->assertTrue(is_file($this->fixture_file_path));
		$newFile = FSI::getFile('home://~fakeUser/testDir/testFile2.txt');
		$this->assertTrue($this->fixture_file->moveTo($newFile));
		$this->assertTrue(is_file($this->fixture_newFile_path));
		$this->assertFalse(is_file($this->fixture_file_path));

		$searchQuery->setQueryString('testFile2');
		$searchQuery->setQueryTokens(null);

		$recollPlugin->resetSearchQuery();
		$recollPlugin->search($searchQuery);
		$results = $recollPlugin->getResults();
		$this->assertEquals($results[0]['name'], 'testFile2.txt');

		$searchQuery->setQueryString('testFile');
		$searchQuery->setQueryTokens(null);

		$recollPlugin->resetSearchQuery();
		$recollPlugin->search($searchQuery);
		$results = $recollPlugin->getResults();
		$this->assertNotEquals($results[0]['name'], 'testFile.txt');
		$newFile->delete();

		// FileSearchListener::fileRenamed()
		$this->assertFalse(is_file($this->fixture_file_path));
		$this->assertTrue($this->fixture_file->createNewFile());
		$this->assertTrue(is_file($this->fixture_file_path));
		$this->assertTrue($this->fixture_file->renameTo('testFileRenamed.txt'));

		$searchQuery->setQueryString('testFile');
		$searchQuery->setQueryTokens(null);

		$recollPlugin->resetSearchQuery();
		$recollPlugin->search($searchQuery);
		$results = $recollPlugin->getResults();
		$this->assertNotEquals($results[0]['name'], 'testFile.txt');
		$this->assertEquals($results[0]['name'], 'testFileRenamed.txt');

		// FileSearchListener::fileWritten()
		$this->fixture_file->putContents('take it easy!');
		// TODO: check if the content's file is up to date.
    }
}
?>
