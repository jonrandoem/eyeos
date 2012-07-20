<?php
class RegExp extends Operator {
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool False if the first operand does evaluates false the other operands as regular expresions. Otherwise true.
	 */
	public function getValue() {
		if (empty($this->operands)) {
			return true;
		}
		
		$referenceValue = $this->operands[0]->getValue();
		
		for ($i = count($this->operands) - 1; $i >= 1; --$i) {
			if (!preg_match($this->operands[$i]->getValue(), $referenceValue)) {
				return false;
			}
		}
		
		return true;
	}
}
?>