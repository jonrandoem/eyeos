<?php

interface ICometManager {
	public function listen();
	public function send(NetSyncMessage $message);
	public function subscribe($channel, $password);
	public function unsubscribe($channel);
	//public function startSession($from);
	//public function endSession($from);
        public function delayIfError();
        public function socketRecycleTimeout();
}

?>