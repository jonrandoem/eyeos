<?php
class SetTest extends PHPUnit_Framework_TestCase {
	private $fixture;
	private $fixtureData1;
	private $fixtureData2;
	
	public function setUp() {
		$this->fixture = new Set();
		$this->fixtureData1 = array(
			'a' => 'A',
			2 => 'TWO',
			'.' => 'DOT',
			'Array' => array(1, 2, 3 => 4),
			'END',
			'a2' => 'A',
			'Array2' => array(1, 2, 3 => 4)
		);
		$this->fixtureData2 = array(
			'begin',
			'b' => 'B',
			'Array' => array('A', 'B', 'C' => 'D'),
			20 => 'TWENTY',
			';' => 'semi-colon',
			'two' => 'TWO',
			'anotherArray' => array(1, 2, 3 => 4)
		);
	}
	
	public function tearDown() {
		unset($this->fixture);
		unset($this->fixtureData);
		unset($this->fixtureData2);
	}
	
	public function test__construct() {
		$this->assertTrue($this->fixture instanceof Set);
		
		$this->fixture = new Set($this->fixtureData1);
		
		$this->assertNotEquals($this->fixtureData1, $this->fixture->getArrayCopy());
		
		//creating a reference array by removing all doublets
		$ref = $this->fixtureData1;
		unset($ref['a2']);
		unset($ref['Array2']);
		$this->assertNotEquals($this->fixtureData1, $this->fixture->getArrayCopy());
		$this->assertEquals($ref, $this->fixture->getArrayCopy());
	}
	
	public function testAppend() {
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->assertTrue($this->fixture->append('A'));
		
		$this->assertEquals(array('A'), $this->fixture->getArrayCopy());
		
		$this->assertFalse($this->fixture->append('A'));
		
		$this->assertEquals(array('A'), $this->fixture->getArrayCopy());
		
		$this->fixture = new Set($this->fixtureData2);
		
		$this->assertTrue($this->fixture->append('X'));
		$this->assertFalse($this->fixture->append(array(1, 2, 3 => 4)));
		
		$ref = $this->fixtureData2;
		$ref[] = 'X';
		$this->assertEquals($ref, $this->fixture->getArrayCopy());
	}
	
	public function testOffsetSet() {
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->assertTrue($this->fixture->offsetSet('a', 'A'));
		
		$this->assertEquals(array('a' => 'A'), $this->fixture->getArrayCopy());
		
		$this->assertFalse($this->fixture->offsetSet('b', 'A'));
		
		$this->assertEquals(array('a' => 'A'), $this->fixture->getArrayCopy());
		
		$this->fixture = new Set($this->fixtureData2);
		
		$this->assertTrue($this->fixture->offsetSet('x', 'X'));
		$this->assertFalse($this->fixture->offsetSet('y', array(1, 2, 3 => 4)));
		
		$ref = $this->fixtureData2;
		$ref['x'] = 'X';
		$this->assertEquals($ref, $this->fixture->getArrayCopy());
	}
}
?>
