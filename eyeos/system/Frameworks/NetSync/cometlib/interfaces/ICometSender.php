<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

interface ICometSender {
	public function send(NetSyncMessage $message);
	public function subscribe($channel, $password = null);
	public function unsubscribe($channel);
}

?>