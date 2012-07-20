<?php
abstract class FormulaUtils {
	const DATE_SEPARATOR = '-';
	const HOUR_SEPARATOR = ':';
	const PHARENTESIS_OPEN_CHARACTER = '(';
	const PHARENTESIS_CLOSE_CHARACTER = ')';
	const STRING_ESCAPE_CHARACTER = '\\';
	const STRING_QUOT_CHARACTER = '"';
	
	private static $KeywordCharacters = array('=', '!', '>', '<', '~');
	
	private static $Operators = array(			// Sort by descending priority
		'=' => 'Equal',
		'!=' => 'NotEquals',
		'>=' => 'GreatherOrEqualThan',
		'>' => 'GreatherThan',
		'<=' => 'LessOrEqualThan',
		'<' => 'LessThan',
		'~' => 'RegExp',
		'not' => 'LogicalNot',
		'and' => 'LogicalAnd',
		'or' => 'LogicalOr',
		'xor' => 'LogicalXor'
	);
	
	private static $Variables = array(
		'date' => 'Date',
		'hour' => 'Hour',
		'process' => 'Process',
		'user' => 'User'
	);
	
	/**
	 * Checks if a word is a keyword.
	 *
	 * @param string $sValue
	 * @return bool
	 */
	private static function isKeyword($sValue) {
		for ($i = strlen($sValue) - 1; $i >= 0; --$i) {
			$character = strtolower($sValue[$i]);
			
			if (($character < 'a' || $character > 'z') && !in_array($character, FormulaUtils::$KeywordCharacters)) {
				return false;
			}
		}
		
		return true;
	}
	
	/**
	 * Checks if a value is a number.
	 *
	 * @param string $sValue
	 * @return bool
	 */
	private static function isNumber($sValue) {
		return is_numeric($sValue);
	}
	
	/**
	 * Converts a string to a formula object.
	 *
	 * @param string $sClause
	 * @return Atom
	 */
	public static function parse($sClause) {
		$unparsedFormula = FormulaUtils::parseWords($sClause);
		return FormulaUtils::sortByPriority($unparsedFormula);
	}
	
	/**
	 * Converts a string to an array of instances.
	 *
	 * @param string $sClause
	 * @return array
	 * @throws EyeUnexpectedValueException Wrong formula sintax.
	 */
	public static function parseWords($sClause) {
		$sClauseLength = strlen($sClause);
		$ready = true;
		$waitingForString = false;
		$waitingForNumber = false;
		$waitingForDate = false;
		$waitingForHour = false;
		$waitingForKeyword = false;
		$escapeCharacter = false;
		$currentValue = '';
		$stack = array();
		$depth = 0;
		$unparsedFormula = array();
		
		for ($i = 0; $i < $sClauseLength; ++$i) {
			$closePharentesis = false;
			
			if ($ready) {
				// We are waiting for a new value
				
				if ($sClause[$i] == FormulaUtils::PHARENTESIS_OPEN_CHARACTER) {
					++$depth;
					$stack[] = $unparsedFormula;
					$unparsedFormula = array();
				} else if ($sClause[$i] == FormulaUtils::STRING_QUOT_CHARACTER) {
					$ready = false;
					$waitingForString = true;
					$currentValue = '';
				} else if (FormulaUtils::isNumber($sClause[$i]) || $sClause[$i] == '-') {
					$ready = false;
					$waitingForNumber = true;
					$currentValue = $sClause[$i];
				} else if (FormulaUtils::isKeyword($sClause[$i])) {
					$ready = false;
					$waitingForKeyword = true;
					$currentValue = $sClause[$i];
				} else if ($sClause[$i] != ' ') {
					throw new EyeUnexpectedValueException('Unknown character "' . $sClause[$i]. '"');
				}
			} else {
				// We are parsing a value
				
				if ($waitingForNumber) {
					if ($sClause[$i] == FormulaUtils::PHARENTESIS_CLOSE_CHARACTER) {
						$closePharentesis = true;
						$ready = true;
					} else if ($sClause[$i] == ' ') {
						$ready = true;
					} else if ($sClause[$i] == FormulaUtils::DATE_SEPARATOR) {
						$waitingForNumber = false;
						$waitingForDate = true;
						$currentValue .= FormulaUtils::DATE_SEPARATOR;
					} else if ($sClause[$i] == FormulaUtils::HOUR_SEPARATOR) {
						$waitingForNumber = false;
						$waitingForHour = true;
						$currentValue .= FormulaUtils::HOUR_SEPARATOR;
					} else {
						if (!FormulaUtils::isNumber($sClause[$i])) {
							throw new EyeUnexpectedValueException('Unexpected numeric value at character ' . $i . ': "' . $currentValue . $sClause[$i] . '"');
						}
						
						$currentValue .= $sClause[$i];
					}
				} else if ($waitingForDate) {
					if ($sClause[$i] == FormulaUtils::PHARENTESIS_CLOSE_CHARACTER) {
						$closePharentesis = true;
						$ready = true;
					} else if ($sClause[$i] == ' ') {
						$ready = true;
					} else {
						if (!FormulaUtils::isNumber($sClause[$i]) && $sClause[$i] != FormulaUtils::DATE_SEPARATOR) {
							throw new EyeUnexpectedValueException('Unexpected date value at character ' . $i . ': "' . $currentValue . $sClause[$i] . '"');
						}
						
						$currentValue .= $sClause[$i];
					}
				} else if ($waitingForHour) {
					if ($sClause[$i] == FormulaUtils::PHARENTESIS_CLOSE_CHARACTER) {
						$closePharentesis = true;
						$ready = true;
					} else if ($sClause[$i] == ' ') {
						$ready = true;
					} else {
						if (!FormulaUtils::isNumber($sClause[$i]) && $sClause[$i] != FormulaUtils::HOUR_SEPARATOR) {
							throw new EyeUnexpectedValueException('Unexpected hour value at character ' . $i . ': "' . $currentValue . $sClause[$i] . '"');
						}
						
						$currentValue .= $sClause[$i];
					}
				} else if ($waitingForKeyword) {
					if ($sClause[$i] == FormulaUtils::PHARENTESIS_CLOSE_CHARACTER) {
						$closePharentesis = true;
						$ready = true;
					} else if ($sClause[$i] == ' ') {
						$ready = true;
					} else {
						if (!FormulaUtils::isKeyword($sClause[$i])) {
							throw new EyeUnexpectedValueException('Unexpected keyword value "' . $currentValue . $sClause[$i] . '" at character ' . $i);
						}
					
						$currentValue .= $sClause[$i];
					}
				} else {			// Waiting for string
					if ($escapeCharacter) {
						$currentValue .= $sClause[$i];
						$escapeCharacter = false;
					} else if ($sClause[$i] == FormulaUtils::STRING_QUOT_CHARACTER) {
						$ready = true;
					} else if ($sClause[$i] == FormulaUtils::STRING_ESCAPE_CHARACTER) {
						$escapeCharacter = true;
					} else {
						$currentValue .= $sClause[$i];
					}
				}
			}
			
			if ($ready || $i == ($sClauseLength - 1)) {
				// Now we have the value parsed (number, string, date, hour or keyword)
				
				if ($waitingForString || $waitingForNumber) {		// Is an operand (number or keyword)
					$atom = new Operand();
					$atom->setValue($currentValue);
					$unparsedFormula[] = $atom;
					$waitingForNumber = false;
					$waitingForString = false;
				} else if ($waitingForDate) {
					$epoch = strtotime($currentValue);
					
					if ($epoch === false) {
						throw new EyeUnexpectedValueException('Unknown date "' . $currentValue . '"');
					}
					
					$atom = new Operand();
					$atom->setValue($epoch);		// dd-mm-yyyy
					$unparsedFormula[] = $atom;
					$waitingForDate = false;
				} else if ($waitingForHour) {
					$epoch = strtotime($currentValue) - strtotime(date('d-m-Y'));
					
					if ($epoch === false) {
						throw new EyeUnexpectedValueException('Unknown hour "' . $currentValue . '"');
					}
					
					$atom = new Operand();
					$atom->setValue($epoch);		// dd-mm-yyyy
					$unparsedFormula[] = $atom;
					$waitingForHour = false;
				} else if ($waitingForKeyword) {											// Is a keyword
					if (array_key_exists($currentValue, FormulaUtils::$Operators)) {		// Is an operator
						$operatorClass = FormulaUtils::$Operators[$currentValue];
						$atom = new $operatorClass();
					} else if (array_key_exists($currentValue, FormulaUtils::$Variables)) {	// Is a variable
						$variableClass = FormulaUtils::$Variables[$currentValue];
						$atom = new $variableClass();
					} else {
						throw new EyeUnexpectedValueException('Unknown keyword "' . $currentValue . '"');
					}
					
					$unparsedFormula[] = $atom;
					$waitingForKeyword = false;
				}
			}
			
			if ($closePharentesis) {
				--$depth;
				
				if ($depth < 0) {
					throw new EyeUnexpectedValueException('Pharentesis mismatch');
				}
				
				$parentFormula = array_pop($stack);
				$parentFormula[] = $unparsedFormula;
				$unparsedFormula = $parentFormula;
				$sClause[$i] = ' ';
			}
		}
		
		return $unparsedFormula;
	}
	
	/**
	 * Converts all subarrays of an array to a Pharentesis object.
	 *
	 * @param array $aFormula
	 * @return array
	 */
	public static function sortByPharentesis($aFormula) {
		for ($i = count($aFormula) - 1; $i >= 0; --$i) {
			if (is_array($aFormula[$i])) {
				$child = FormulaUtils::sortByPriority($aFormula[$i]);
				$pharentesis = new Pharentesis();
				$pharentesis->setValue($child);
				$aFormula[$i] = $pharentesis;
			}
		}
		
		return $aFormula;
	}
	
	/**
	 * Converts an array of instances to a formula object.
	 *
	 * @param array $aFormula
	 * @return Atom
	 * @throws EyeUnexpectedValueException Wrong formula sintax.
	 */
	public static function sortByPriority($aFormula) {
		$aFormula = FormulaUtils::sortByPharentesis($aFormula);
		$aFormulaSize = count($aFormula);
		
		foreach (FormulaUtils::$Operators as $operatorClass) {
			$i = 0;
			
			while ($i < $aFormulaSize) {
				if (get_class($aFormula[$i]) == $operatorClass) {
					if ($aFormula[$i]->isUnitary()) {					// If is unitary,
						if ($aFormulaSize <= ($i + 1)) {					// there should be another operand at right of the current operator.
							throw new EyeUnexpectedValueException($operatorClass . ' has not any argument.');
						}
						
						$aFormula[$i]->addOperand($aFormula[$i + 1]);
						array_splice($aFormula, $i + 1, 1);				// Deleting the right operand
						--$aFormulaSize;
						++$i;
					} else {											// Else, if can have multiple operands,
						if ($i == 0 || $aFormulaSize <= ($i + 1)) {		// there should be two operands. One at left and one at right of the current operator.
							throw new EyeUnexpectedValueException($operatorClass . ' has not any argument.');
						}
						
						$aFormula[$i]->addOperand($aFormula[$i - 1]);
						$aFormula[$i]->addOperand($aFormula[$i + 1]);
						array_splice($aFormula, $i - 1, 1);				// Deleting the left operand
						array_splice($aFormula, $i, 1);					// Deleting the right operand
						$aFormulaSize -= 2;
					}
				} else {
					++$i;
				}
			}
		}
		
		return $aFormula[0];
	}
	
	
	/**
	 * Converts a formula to an string.
	 *
	 * @param Atom $formula
	 */
	public static function unparse($formula) {
		// We will use this?
	}
}
?>