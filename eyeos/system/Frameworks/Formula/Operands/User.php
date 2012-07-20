<?php
class User extends Operand {
	/**
	 * Returns the current user name.
	 *
	 * @return string
	 */
	public function getValue() {
		$UMinstance = UMManager::getInstance();
		$user = $UMinstance->getNewUserInstance();
		$UMinstance->getCurrentUser($user);
		return $user->getUserName();
	}
}
?>