<?php
class FileObjectsFactoryTest extends PHPUnit_Framework_TestCase {
	private $fixture;

	public function __construct() {
		$this->fixture = FileObjectsFactory::getInstance();
	}

	public function testGetFile() {
		$this->assertTrue($this->fixture->getFile('home://~john') instanceof EyeUserFile);
		$this->assertTrue($this->fixture->getFile('sys://') instanceof EyeSysFile);
		$this->assertTrue($this->fixture->getFile('file:///') instanceof EyeLocalFile);
		$this->assertTrue($this->fixture->getFile('ftp://localhost/') instanceof EyeFTPFile);
		
		try {
			$this->assertNull($this->fixture->getFile(''));
			$this->fail();
		} catch (EyeInvalidArgumentException $e) {
			//normal situation
		}
		try {
			$this->fixture->getFile('unkn://myDir/myFile.ext');
			$this->fail();
		} catch (EyeHandlerNotFoundException $e) {
			// normal situation
		}
	}
}
?>
