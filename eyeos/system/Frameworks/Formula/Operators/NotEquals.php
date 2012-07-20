<?php
class NotEquals extends Operator {
	/**
	 * Evaluates the operator value.
	 *
	 * @return bool False if any operands have the same type and the same value. Otherwise true.
	 */
	public function getValue() {
		for ($i = count($this->operands) - 1; $i >= 1; --$i) {
			$currentValue = $this->operands[$i]->getValue();
			
			for ($j = $i - 1; $j >= 0; --$j) {
				if ($currentValue === $this->operands[$j]->getValue()) {
					return false;
				}
			}
		}
		
		return true;
	}
}
?>