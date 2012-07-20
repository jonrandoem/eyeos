<?php

interface IPasswordChannelProvider extends IChannelProvider {
	public function getPassword(IChannel $channel);
}

?>