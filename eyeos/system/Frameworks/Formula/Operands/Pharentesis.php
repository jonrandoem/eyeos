<?php
class Pharentesis extends Operand {
	/**
	 * Returns the evaluation of the content.
	 *
	 * @return mixed
	 */
	public function getValue() {
		return $this->value->getValue();
	}
	
	/**
	 * Sets the value of the pharentesis.
	 *
	 * @param mixed $value
	 */
	public function setValue($value) {
		if (!($value instanceof Atom)) {
			throw new EyeInvalidArgumentException('First argument $value is not an Atom instance.');
		}
		
		$this->value = $value;
	}
}
?>