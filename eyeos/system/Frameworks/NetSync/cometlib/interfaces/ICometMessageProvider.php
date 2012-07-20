<?php
/* 
 * Message providers provide storage for messages, there are 3 types of providers,
 * one for messages, other one for subcriptions and a third for channel
 */

interface ICometMessageProvider {
	public function write($from, IChannel $channel, $data);
	public function read($channels, $from, $lastId = 0);
}

?>