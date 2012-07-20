<?php
/*
 * Interface that represents the minimum methods a CometListener should provide
 */

interface ICometListener {
	public function listen($manager);
}
?>
