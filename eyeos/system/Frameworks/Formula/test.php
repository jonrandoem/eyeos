<?php
/*
This is a test for formula framework prototype.
*/

$formulaPath = './';
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

$object = FormulaUtils::parse('not (1 = 2)');			// There is the formula to parse.
print_r($object);
echo $object->getValue();
?>