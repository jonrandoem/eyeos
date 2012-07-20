<?php
/*
There you should uncomment the code above to use this framework on eyeos. However, if you
want to test this framework, check for test.php in this directory.
*/

/*
$formulaPath = FRAMEWORKS_PATH . '/Formula/';
$operandsPath = $formulaPath . 'Operands/';
$operatorsPath = $formulaPath . 'Operators/';

require $formulaPath . 'Atom.php';
require $formulaPath . 'Operand.php';
require $formulaPath . 'Operator.php';
require $formulaPath . 'FormulaUtils.php';

$directory = new DirectoryIterator($operandsPath);

foreach ($directory as $fileInfo) {
	if ($fileInfo->isFile()) {
		require $operandsPath . $fileInfo->getFilename();
	}
}

$directory = new DirectoryIterator($operatorsPath);

foreach ($directory as $fileInfo) {
	if ($fileInfo->isFile()) {
		require $operatorsPath . $fileInfo->getFilename();
	}
}
*/
?>