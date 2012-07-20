<?php
class LessOrEqualThan extends Operator {
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool False if any operand is greater than the next one in the list. Otherwise true.
	 */
	public function getValue() {
		if (empty($this->operands)) {
			return true;
		}
		
		$lastValue = $this->operands[0]->getValue();
		$operands_size = count($this->operands);
		
		for ($i = 1; $i < $operands_size; ++$i) {
			$currentValue = $this->operands[$i]->getValue();
			
			if ($lastValue > $currentValue) {
				return false;
			}
			
			$lastValue = $currentValue;
		}
		
		return true;
	}
}
?>