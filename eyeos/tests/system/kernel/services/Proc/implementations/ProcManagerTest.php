<?php
class ProcManagerTest extends PHPUnit_Framework_TestCase {
	private static $InitPid = null;
	private static $InitProcess = null;
	private $fixture;
	private $loginContext;
	private $authConfig;
	private $pids = array();
	
	public function __construct() {
		$this->fixture = ProcManager::getInstance();
	}
	
	public function isEqual($originalProc, $testProc) {
		$this->assertEquals($originalProc->getName(), $testProc->getName());
		$this->assertEquals($originalProc->getPid(), $testProc->getPid());
		$this->assertEquals($originalProc->getLoginContext(), $testProc->getLoginContext());
		$this->assertEquals($originalProc->getChecknum(), $testProc->getChecknum());
		$this->assertEquals($originalProc->getTime(), $testProc->getTime());
	}
	
	public function setUp() {
		if (self::$InitPid === null) {
			self::$InitProcess = $this->fixture->getCurrentProcess();
			self::$InitPid = self::$InitProcess->getPid();
		}
		
		foreach($this->pids as $pid) {
			try {
				$this->fixture->kill($this->fixture->getProcessByPid($pid));
			} catch (EyeProcException $e) {}
		}
		$this->pids = array();
		
		$this->authConfig = new XMLAuthConfiguration(SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_UM_DIR . '/' . SERVICE_UM_AUTHCONFIGURATIONS_DIR . '/eyeos_default.xml');
		$this->loginContext = new LoginContext('example', new Subject(), $this->authConfig);
	}
	
	public function tearDown() {
		foreach($this->pids as $pid) {
			try {
				$this->fixture->kill($this->fixture->getProcessByPid($pid));
			} catch (EyeProcException $e) {
			} catch (EyeNullPointerException $e) {}
		}
		$this->pids = array();
		
		$this->fixture->setCurrentProcess(self::$InitProcess);
	}
	
	public function testExecute() {		
		$proc = new Process('example');
		$this->fixture->execute($proc);
		$this->pids[] = $pid = $proc->getPid();
		$processTable = $this->fixture->getProcessesTable();
		
		$this->assertTrue(is_array($processTable));
		$this->assertTrue(isset($processTable[$pid]));
		$this->assertTrue($processTable[$pid] instanceof Process);
		$this->assertEquals('example', $processTable[$pid]->getName());
		$pid = $processTable[$pid]->getPid();
		$this->assertNotNull($pid);
		$this->assertTrue(ProcManager::MINPIDNUMBER <= $pid);
		$this->assertTrue($pid <= ProcManager::MAXPIDNUMBER);
		$this->assertEquals(self::$InitProcess->getLoginContext(), $processTable[$pid]->getLoginContext());
		$checknum = $processTable[$pid]->getChecknum();
		$this->assertNotNull($checknum);
		$this->assertTrue(ProcManager::MINCHECKNUMNUMBER <= $checknum);
		$this->assertTrue($checknum <= ProcManager::MAXCHECKNUMNUMBER);
		$this->assertNotNull($processTable[$pid]->getTime());
	}
	
	public function testGetCurrentProcess() {
		$this->assertEquals(self::$InitProcess, $this->fixture->getCurrentProcess());
		
		$proc = new Process('example');
		$this->fixture->execute($proc);
		$processTable = $this->fixture->getProcessesTable();
		$this->pids[] = $pid = $proc->getPid();
		$this->fixture->setCurrentProcess($processTable[$pid]);
		
		$processTable = $this->fixture->getProcessesTable();
		$proc = $this->fixture->getCurrentProcess();
		$this->isEqual($processTable[$pid], $proc);
	}
	
	public function testGetProcess() {				
		$proc = new Process('example');
		$this->fixture->execute($proc);
		$this->pids[] = $pid = $proc->getPid();
		
		// Process with PID number must be found
		
		try {
			$this->fixture->getProcessByPid(ProcManager::MINPIDNUMBER - 1);
			$this->fail();
		} catch (EyeProcException $e) {
		}
		
		// Process with checknum must be found
		
		try {
			$this->fixture->getProcessByChecknum(ProcManager::MINCHECKNUMNUMBER - 1);
			$this->fail();
		} catch (EyeProcException $e) {
		}
		
		// Process must have a PID or a checknum
		
		try {
			$this->fixture->getProcessByPid(null);
			$this->fail();
		} catch (EyeNullPointerException $e) {
		}
		
		$processTable = $this->fixture->getProcessesTable();
		
		// By PID
		$proc = $this->fixture->getProcessByPid($processTable[$pid]->getPid());
		$this->isEqual($processTable[$pid], $proc);
		
		// By checknum
		$proc = $this->fixture->getProcessByChecknum($processTable[$pid]->getChecknum());
		$this->isEqual($processTable[$pid], $proc);
	}
	
	public function testGetProcessList() {
		$proc = new Process('example');
		$this->fixture->execute($proc);
		$this->pids[] = $proc->getPid();
		
		$processTable = $this->fixture->getProcessesTable();
		$processList = $this->fixture->getProcessesList();
		
		foreach ($processTable as $pid => $process) {
			$this->assertEquals($process->getName(), $processList[$pid]);
		}
	}
	
	public function testGetProcessTable() {
		$processTable = $this->fixture->getProcessesTable();
		$this->assertTrue(is_array($processTable));
		$this->assertEquals(1, count($processTable));
		$this->assertTrue(isset($processTable[self::$InitPid]));
		
		$proc = new Process('example');
		$this->fixture->execute($proc);
		$this->pids[] = $pid = $proc->getPid();
		
		$processTable = $this->fixture->getProcessesTable();
		$this->assertTrue(is_array($processTable));
		$this->assertEquals(2, count($processTable));
		$this->assertTrue(isset($processTable[$pid]));
	}
	
	public function testKill() {
		$proc = new Process('example');
		$this->fixture->execute($proc);
		$this->pids[] = $pid = $proc->getPid();
		
		// Process with PID number must be found
		
		try {
			$proc = new Process();
			$proc->setPid(ProcManager::MINPIDNUMBER - 1);
			$this->fixture->kill($proc);
			$this->fail();
		} catch (EyeProcException $e) {
		}
		
		$processTable = $this->fixture->getProcessesTable();
		$this->fixture->kill($processTable[$pid]);
		$processTable = $this->fixture->getProcessesTable();
		
		$this->assertFalse(isset($processTable[$pid]));
	}
	
	public function testSetCurrentProcess() {
		$proc = new Process('example');
		$this->pids[] = $this->fixture->execute($proc);
		$pid = $proc->getPid();
		
		// Process with PID number must be found
		
		try {
			$proc = new Process();
			$proc->setPid(ProcManager::MINPIDNUMBER - 1);
			$this->fixture->setCurrentProcess($proc);
			$this->fail();
		} catch (EyeProcException $e) {
		}
		
		$processTable = $this->fixture->getProcessesTable();
		$this->fixture->setCurrentProcess($processTable[$pid]);
	}
	
	public function testSetProcessLoginContext() {
		$proc = new Process('example');
		$this->fixture->execute($proc);
		$this->pids[] = $pid = $proc->getPid();
		$this->loginContext = new LoginContext('init');
		$this->fixture->setProcessLoginContext($pid, $this->loginContext);
		
		try {
			$this->fixture->setProcessLoginContext(ProcManager::MINPIDNUMBER - 1, $this->loginContext);
			$this->fail();
		} catch (EyeProcException $e) {
			// normal situation
		}
		
		$processTable = $this->fixture->getProcessesTable();
		$this->assertNotNull($processTable[$pid]->getLoginContext());			
		
		$this->fixture->setProcessLoginContext($pid, $this->loginContext);
		
		$processTable = $this->fixture->getProcessesTable();
		$this->assertEquals($this->loginContext, $processTable[$pid]->getLoginContext());
		$this->assertSame($this->loginContext, $processTable[$pid]->getLoginContext());
		
		
		$this->tearDown();
		$this->setUp();
		
		/**** execute another process then change to a different login context ****/
		$this->fixture->setCurrentProcess(self::$InitProcess);
		$initLoginContext = clone self::$InitProcess->getLoginContext();
		
		$proc = new Process('example2');
		$this->fixture->execute($proc);
		$this->pids[] = $pid2 = $proc->getPid();
		$processTable = $this->fixture->getProcessesTable();
		
		//check some necessary conditions before proceeding
		$this->assertTrue(is_array($processTable));
		$this->assertTrue(isset($processTable[$pid2]));
		$this->assertTrue($processTable[$pid2] instanceof Process);
		$this->assertEquals('example2', $processTable[$pid2]->getName());
		$pid = $processTable[$pid2]->getPid();
		$this->assertNotNull($pid);
		$this->assertTrue(ProcManager::MINPIDNUMBER <= $pid);
		$this->assertTrue($pid <= ProcManager::MAXPIDNUMBER);
		$this->assertEquals($initLoginContext, $processTable[$pid2]->getLoginContext());
		$this->assertNotNull($processTable[$pid2]->getLoginContext()->getEyeosUser());
		$checknum = $processTable[$pid2]->getChecknum();
		$this->assertNotNull($checknum);
		$this->assertTrue(ProcManager::MINCHECKNUMNUMBER <= $checknum);
		$this->assertTrue($checknum <= ProcManager::MAXCHECKNUMNUMBER);
		$this->assertNotNull($processTable[$pid2]->getTime());
		
		//create a new login context with another user
		$subject = new Subject();
		$newLoginContext = new LoginContext('example', $subject, $this->authConfig);
		$cred = new EyeosPasswordCredential('john', 'john');
		$this->assertEquals(0, $newLoginContext->getSubject()->getPrivateCredentials()->count());
		$newLoginContext->getSubject()->getPrivateCredentials()->append($cred);
		$newLoginContext->login();
		$this->assertNotEquals($initLoginContext, $newLoginContext);
		
		$this->fixture->setProcessLoginContext($pid2, $newLoginContext);
		
		$this->assertNotEquals($initLoginContext, $proc->getLoginContext());
		$this->assertEquals($newLoginContext, $proc->getLoginContext());
		$this->assertSame($newLoginContext, $proc->getLoginContext());
		
		$initUser = $this->fixture->getProcessByPid(self::$InitPid)->getLoginContext()->getEyeosUser();
		$newUser = $this->fixture->getProcessByPid($pid2)->getLoginContext()->getEyeosUser();
		$this->assertEquals('root', $initUser->getName());
		$this->assertEquals('john', $newUser->getName());
	}
}
?>
