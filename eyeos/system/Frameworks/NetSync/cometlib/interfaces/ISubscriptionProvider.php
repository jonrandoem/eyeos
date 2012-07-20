<?php

interface ISubscriptionProvider {
	public function getSubscriptions($from);
	public function getSubscribers($channel);
	public function getAllChannels($pattern = null);
	public function unsubscribe($from, $channel);
	public function subscribe($from, $channel);
	public function removeAllSubscriptions($from);
}

?>