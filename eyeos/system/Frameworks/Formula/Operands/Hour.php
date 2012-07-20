<?php
class Hour extends Operand {
	/**
	 * Returns the current date in epoch format.
	 * 
	 * The hour starts at 0. 00:00:10 is 10.
	 *
	 * @return int
	 */
	public function getValue() {
		$hour = date('G:i:s');
		$date = date('d-m-Y');
		return (strtotime($hour) - strtotime($date));
	}
}
?>