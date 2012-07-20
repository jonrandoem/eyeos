<?php
class MemoryManagerTest extends  PHPUnit_Framework_TestCase {
	public function testGetInstance() {
		$instance = MemoryManager::getInstance();
		$this->assertEquals(DEFAULT_MEMORYMANAGER, get_class($instance));
	}
}
?>