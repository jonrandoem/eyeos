<?php
class Date extends Operand {
	/**
	 * Returns the current date in epoch format.
	 *
	 * @return int
	 */
	public function getValue() {
		$date = date('d-m-Y');
		return strtotime($date);
	}
}
?>