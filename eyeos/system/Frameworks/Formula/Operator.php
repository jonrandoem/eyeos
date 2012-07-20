<?php
abstract class Operator extends Atom {
	protected $operands = array();
	
	/**
	 * Appends an operand to the operands list.
	 * 
	 * By default, the operator can handle undefined number of operators.
	 *
	 * @param Atom $operand
	 */
	public function addOperand($operand) {
		if (!($operand instanceof Atom)) {
			throw new EyeInvalidArgumentException('First argument $operand is not an Atom instance.');
		}
		
		$this->operands[] = $operand;
	}
	
	/**
	 * It reports that if the operator is unitary or not.
	 *
	 * @return bool
	 */
	public function isUnitary() {
		return false;
	}
}
?>