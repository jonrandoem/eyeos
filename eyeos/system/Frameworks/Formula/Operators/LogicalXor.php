<?php
class LogicalXor extends Operator {
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool True if only one operand evaluates true. Otherwise false.
	 */
	public function getValue() {
		$alreadyTrue = false;
		
		foreach ($this->operands as $operand) {
			if ($operand->getValue()) {
				if ($alreadyTrue) {
					return false;
				}
				
				$alreadyTrue = true;
			}
		}
		
		return $alreadyTrue;
	}
}
?>