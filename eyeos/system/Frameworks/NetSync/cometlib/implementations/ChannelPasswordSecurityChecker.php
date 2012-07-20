<?php
/* 
 * A basic implementation of IChannelSecurityChecker that can check
 * access to a given channel object implementing the IPasswordChannel
 * interface.
 * 
 */

class ChannelPasswordSecurityChecker implements IChannelSecurityChecker {
	public function checkAccess(IChannel $channel) {
		$password = $channel->getPassword();

		//for the moment, the providers are just not configurable

		$myProvider = new SqlChannelProvider();
		$channelPassword = $myProvider->getPassword($channel);
		
		if(!$channelPassword) {
		    return true;
		}
		
		if(md5($password) == $channelPassword) {
		    return true;
		}
		return false;
	}
}

?>