<?php
class LogicalOr extends Operator {
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool True if any operand evaluates true. Otherwise false.
	 */
	public function getValue() {
		foreach ($this->operands as $operand) {
			if ($operand->getValue()) {
				return true;
			}
		}
		
		return false;
	}
}
?>