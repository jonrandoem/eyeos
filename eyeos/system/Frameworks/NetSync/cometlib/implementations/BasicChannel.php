<?php
/*
 * A basic channel object that uses a ChannelPasswordSecurityChecker to
 * check permissions to join the channel.
 *
 * Should implement IPasswordChannel not IChannel
 */

class BasicChannel extends AbstractChannel implements IPasswordChannel {
	private $password;
	private $since;

    public function  __construct($name) {
		$this->name = $name;
	}

	public function checkAccess() {
		$myChecker = new ChannelPasswordSecurityChecker();
		return $myChecker->checkAccess($this);
	}

	public function setPassword($password) {
		$this->password = $password;
	}

	public function getPassword() {
		return $this->password;
	}

	public function getAttributesMap() {
        $result['password'] = $this->password;
        $result['since'] = $this->since;
        $result['name'] = $this->name;
        return $result;
    }
}

?>