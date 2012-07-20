<?php
class Operand extends Atom {
	protected $value = null;
	
	/**
	 * Evaluates the operand.
	 *
	 * @return mixed
	 */
	public function getValue() {
		return $this->value;
	}
	
	/**
	 * Sets the value of the operand.
	 *
	 * @param mixed $value
	 */
	public function setValue($value) {
		$this->value = $value;
	}
}
?>