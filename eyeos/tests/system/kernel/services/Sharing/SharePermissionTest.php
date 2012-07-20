<?php
class SharePermissionTest extends PHPUnit_Framework_TestCase {
	private $fixture;

	public function test__construct() {		
		try {
			$this->fixture = new SharePermission();
			$this->fail();
		} catch (EyeErrorException $e) {
			// normal situation
		}
		
		$this->fixture = new SharePermission('read');
		$this->assertEquals(array('read'), $this->fixture->getActions());
		
		$this->fixture = new SharePermission('ReAd');
		$this->assertEquals(array('read'), $this->fixture->getActions());
		
		$this->fixture = new SharePermission('read,write');
		$this->assertEquals(array('read', 'write'), $this->fixture->getActions());
		
		$this->fixture = new SharePermission('rEAd , wrIte');
		$this->assertEquals('read,write', $this->fixture->getActionsAsString());
	}
}
?>