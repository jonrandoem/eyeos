<?php
/*
 * Abstract object representig a channel
 */

abstract class AbstractChannel {
	protected $name;
	
	public function setName($name) {
		$this->name = $name;
	}

	public function getName() {
		return $this->name;
	}
}

?>
