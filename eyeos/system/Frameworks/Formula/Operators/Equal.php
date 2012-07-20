<?php
class Equal extends Operator {
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool False if any operands have not the same type and value. Otherwise true.
	 */
	public function getValue() {
		if (empty($this->operands)) {
			return true;
		}
		
		$referenceValue = $this->operands[0]->getValue();
		
		for ($i = count($this->operands) - 1; $i >= 1; --$i) {
			if ($referenceValue !== $this->operands[$i]->getValue()) {
				return false;
			}
		}
		
		return true;
	}
}
?>