<?php
class LogicalNot extends Operator {
	protected $value = true;
	
	/**
	 * Sets the operand.
	 * 
	 * The operator is unitary.
	 *
	 * @param Atom $operand
	 */
	public function addOperand($operand) {
		if (!($operand instanceof Atom)) {
			throw new EyeInvalidArgumentException('First argument $operand is not an Atom instance.');
		}
		
		$this->value = $operand;
	}
	
	/**
	 * It reports that the operator is unitary.
	 *
	 * @return bool
	 */
	public function isUnitary() {
		return true;
	}
	
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool False if any operand evaluates true. Otherwise false.
	 */
	public function getValue() {
		return !$this->value->getValue();
	}
}
?>