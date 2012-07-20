<?php
class ArrayListTest extends PHPUnit_Framework_TestCase {
	private $fixture;
	private $fixtureData;
	
	public function setUp() {
		$this->fixture = new ArrayList();
		$this->fixtureData = array(
			'a' => 'A',
			2 => 'TWO',
			'.' => 'DOT',
			'Array' => array(1, 2, 3 => 4),
			'END'
		);
	}
	
	public function tearDown() {
		unset($this->fixture);
		unset($this->fixtureData);
		unset($this->fixtureData2);
	}
	
	public function test__construct() {		
		$this->assertTrue($this->fixture instanceof ArrayList);
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		unset($this->fixture);
		$this->fixture = new ArrayList($this->fixtureData);
		
		$this->assertTrue($this->fixture instanceof ArrayList);
		$this->assertEquals($this->fixtureData, $this->fixture->getArrayCopy());
	}
	
	public function testAppend() {
		$this->assertTrue($this->fixture instanceof ArrayList);
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->assertTrue($this->fixture->append('X'));
		
		$this->assertEquals(array(0 => 'X'), $this->fixture->getArrayCopy());
		
		$this->assertTrue($this->fixture->append('Y'));
		
		$this->assertEquals(array(0 => 'X', 1 => 'Y'), $this->fixture->getArrayCopy());
		
		$this->fixture = new ArrayList($this->fixtureData);
		$this->assertTrue($this->fixture->append('X'));
		
		$ref = $this->fixtureData;
		$ref[] = 'X';
		$this->assertEquals($ref, $this->fixture->getArrayCopy());
		$this->assertNotEquals($this->fixtureData, $this->fixture->getArrayCopy());
	}
	
	public function testAppendAll() {
		$this->assertTrue($this->fixture instanceof ArrayList);
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->fixture->appendAll($this->fixtureData);
		
		$this->assertEquals(array_values($this->fixtureData), $this->fixture->getArrayCopy());
		
		$this->fixture->appendAll(array('X', 'Y', 'Z'));
		
		$ref = array_values($this->fixtureData);
		$ref[] = 'X';
		$ref[] = 'Y';
		$ref[] = 'Z';
		$this->assertEquals($ref, $this->fixture->getArrayCopy());
		$this->assertNotEquals($this->fixtureData, $this->fixture->getArrayCopy());
	}
	
	public function testClear() {
		$this->fixture = new ArrayList($this->fixtureData);
		$this->assertNotEquals(array(), $this->fixture->getArrayCopy());
		
		$this->fixture->clear();
		
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
	}
	
	public function testContains() {
		foreach($this->fixtureData as $fdata) {
			$this->assertFalse($this->fixture->contains($fdata));
		}
		
		$this->fixture = new ArrayList($this->fixtureData);
		
		foreach($this->fixtureData as $fdata) {
			$this->assertTrue($this->fixture->contains($fdata));
		}
		
		$this->fixture = new ArrayList();
		$this->fixture->appendAll($this->fixtureData);
		
		foreach($this->fixtureData as $fdata) {
			$this->assertTrue($this->fixture->contains($fdata));
		}
	}
	
	public function testIsEmpty() {
		$this->assertTrue($this->fixture->isEmpty());
		
		$this->fixture->appendAll($this->fixtureData);
		
		$this->assertFalse($this->fixture->isEmpty());
		
		$this->fixture->clear();
		
		$this->assertTrue($this->fixture->isEmpty());
	}
	
	public function testOffsetGet() {
		try {
			$this->fixture->offsetGet(0);
			$this->fail();
		} catch (RangeException $e) {
			// normal situation
		}
		
		try {
			$this->fixture[0];
			$this->fail();
		} catch (RangeException $e) {
			// normal situation
		}
		
		$this->fixture = new ArrayList($this->fixtureData);
		
		$this->assertEquals('TWO', $this->fixture->offsetGet(2));
		$this->assertEquals(array(1, 2, 3 => 4), $this->fixture->offsetGet('Array'));
		
		try {
			$this->fixture['x'];
			$this->fail();
		} catch (RangeException $e) {
			// normal situation
		}
	}
	
	public function testOffsetSet() {
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->assertTrue($this->fixture->offsetSet('x', 'X'));
		
		$this->assertEquals(array('x' => 'X'), $this->fixture->getArrayCopy());
		
		$this->assertTrue($this->fixture->offsetSet('y', 'Y'));
		
		$this->assertEquals(array('x' => 'X', 'y' => 'Y'), $this->fixture->getArrayCopy());
	}
	
	public function testRemove() {
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->fixture->remove('R');
		
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->fixture->appendAll($this->fixtureData);
		$this->assertTrue(in_array('TWO', $this->fixture->getArrayCopy()));
		
		$this->fixture->remove('TWO');
		
		$this->assertFalse(in_array('TWO', $this->fixture->getArrayCopy()));
	}
	
	public function testRemoveAll() {
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->fixture->removeAll(array('R'));
		
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
		
		$this->fixture->appendAll($this->fixtureData);
		$this->assertEquals(array_values($this->fixtureData), $this->fixture->getArrayCopy());
		$this->assertTrue(in_array('TWO', $this->fixture->getArrayCopy()));
		
		$this->fixture->removeAll(array('TWO'));
		
		$this->assertFalse(in_array('TWO', $this->fixture->getArrayCopy()));
		
		$this->fixture->removeAll($this->fixtureData);
		
		$this->assertEquals(array(), $this->fixture->getArrayCopy());
	}
}
?>
