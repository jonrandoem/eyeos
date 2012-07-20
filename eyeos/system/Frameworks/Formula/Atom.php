<?php
abstract class Atom {
	/**
	 * Evaluates the value of the atom.
	 * 
	 * It should be implemented by the child classes.
	 *
	 * @return null
	 */
	public function getValue() {
		return null;
	}
}
?>