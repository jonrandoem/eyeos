<?php
class ProcessTest extends PHPUnit_Framework_TestCase {
	private $fixture;
	private $config;
	private $loginContext;
	
	private static $InitProcessToRestore = null;
	private static $MyProcPid = null;
	
	public function __construct() {
		$this->fixture = ProcManager::getInstance();
	}
	
	public function setUp() {
		if (self::$InitProcessToRestore === null) {
			self::$InitProcessToRestore = ProcManager::getInstance()->getCurrentProcess();
		}
		
		$this->config = new XMLAuthConfiguration(SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_UM_DIR . '/' . SERVICE_UM_AUTHCONFIGURATIONS_DIR . '/eyeos_default.xml');
		$this->loginContext = new LoginContext('eyeos-login', new Subject(), $this->config);
		$this->loginContext->getSubject()->getPrivateCredentials()->append(new EyeosPasswordCredential('john', 'john'));
		$this->loginContext->login();
		
		$proc = new Process('init');
		$proc->setLoginContext($this->loginContext);
		ProcManager::getInstance()->execute($proc);
		self::$MyProcPid = $proc->getPid();
	}
	
	public function tearDown() {
		try {
			ProcManager::getInstance()->kill(ProcManager::getInstance()->getProcessByPid(self::$MyProcPid));
		} catch (EyeProcException $e) {}
		ProcManager::getInstance()->setCurrentProcess(self::$InitProcessToRestore);
	}
	
	public function testSetLoginContext() {
		$this->fixture = new Process('example');
		ProcManager::getInstance()->execute($this->fixture);
		$newLoginContext = new LoginContext('example', new Subject(), $this->config);
		
		$this->assertEquals($this->loginContext, $this->fixture->getLoginContext());
		$this->assertNotEquals($newLoginContext, $this->fixture->getLoginContext());
		
		$this->fixture->setLoginContext($newLoginContext);
		
		$this->assertNotEquals($this->loginContext, $this->fixture->getLoginContext());
		$this->assertEquals($newLoginContext, $this->fixture->getLoginContext());
	}
}
?>
