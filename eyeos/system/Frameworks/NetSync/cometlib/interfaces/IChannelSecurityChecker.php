<?php
/*
 * Interface for the security checkers. Every security checker should implement
 * at least this interface.
 */

interface IChannelSecurityChecker {
	public function checkAccess(IChannel $channel);
}

?>
