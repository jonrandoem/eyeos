<?php
class Process extends Operand {
	/**
	 * Returns the current process name.
	 *
	 * @return string
	 */
	public function getValue() {
		$procManager = ProcManager::getInstance();
		$proc = new Process();
		$procManager->getCurrentProcess($proc);
		return $user->getName();
	}
}
?>