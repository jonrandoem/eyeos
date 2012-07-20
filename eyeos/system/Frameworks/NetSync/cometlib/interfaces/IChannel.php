<?php
/*
 * basic channel interface
 */

interface IChannel {
	public function setName($name);
	public function getName();
	public function checkAccess();
}

?>