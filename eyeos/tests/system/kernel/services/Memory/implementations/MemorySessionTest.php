<?php
class MemorySessionTest extends  PHPUnit_Framework_TestCase {
	private $fixture;
	
	public function setUp() {
		
	}
	
	public function __construct() {
		$this->fixture = Kernel::getInstance('MemorySession');
	}
	
	public function testGet() {
		$this->fixture->set('exampleKey', 'exampleValue');
		$this->assertEquals('exampleValue', $this->fixture->get('exampleKey'));
	}
	
	public function testSet() {
		$this->fixture->set('exampleKey', 'exampleValue');
	}
}
?>