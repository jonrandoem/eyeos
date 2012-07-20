<?php
/* 
 * Provide storage for channels
 */

interface IChannelProvider {
	//returns a channel object (ej. BasicChannel given a channel name)
	//there could be some information to retrieve from the database
	public function getChannel($name);
}

?>