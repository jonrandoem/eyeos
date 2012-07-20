<?php
class LogicalAnd extends Operator {
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool False if any operand evaluates a bool type as false. Otherwise true.
	 */
	public function getValue() {
		foreach ($this->operands as $operand) {
			if ($operand->getValue() === false) {
				return false;
			}
		}
		
		return true;
	}
}
?>