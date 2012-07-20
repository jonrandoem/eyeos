<?php
/* 
 * extended interface of the normal IChannel, but with password support
 */

interface IPasswordChannel extends IChannel {
	public function setPassword($password);
	public function getPassword();
}

?>
