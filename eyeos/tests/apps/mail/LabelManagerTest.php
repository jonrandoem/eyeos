<?php
/*
*                 eyeos - The Open Source Cloud's Web Desktop
*                               Version 2.0
*                   Copyright (C) 2007 - 2010 eyeos Team 
* 
* This program is free software; you can redistribute it and/or modify it under
* the terms of the GNU Affero General Public License version 3 as published by the
* Free Software Foundation.
* 
* This program is distributed in the hope that it will be useful, but WITHOUT
* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
* FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
* details.
* 
* You should have received a copy of the GNU Affero General Public License
* version 3 along with this program in the file "LICENSE".  If not, see 
* <http://www.gnu.org/licenses/agpl-3.0.txt>.
* 
* See www.eyeos.org for more details. All requests should be sent to licensing@eyeos.org
* 
* The interactive user interfaces in modified source and object code versions
* of this program must display Appropriate Legal Notices, as required under
* Section 5 of the GNU Affero General Public License version 3.
* 
* In accordance with Section 7(b) of the GNU Affero General Public License version 3,
* these Appropriate Legal Notices must retain the display of the "Powered by
* eyeos" logo and retain the original copyright notice. If the display of the 
* logo is not reasonably feasible for technical reasons, the Appropriate Legal Notices
* must display the words "Powered by eyeos" and retain the original copyright notice. 
*/
//require_once APPS_DIR . '/mailApp/mailApp.php';



/*
class LabelManagerTest extends PHPUnit_Framework_TestCase {

	private $labelManager;
	private $dao;

	function __contruct() {
		$this->labelManager = new LabelManager();
		$this->dao = EyeosDAO::getInstance('mail');
	}

	public function setUp() {
			$sql = 'DELETE * FROM mail_label WHERE name = "labelTest_AcGhKlM"';
			$this->dao->send($sql);
	}

	function testGetAllLabels() {
		$this->labelManager->createLabel('#aabbcc', 'labelTest_AcGhKlM');

		$allLabels = $this->labelManager->getAllLabels();

		$findedName = false;
		foreach ($allLabels as $label) {
			if ($label->getName() == 'labelTest_AcGhKlM') {
				$findedName = true;
			}
		}

		$this->assertEquals(true, $findedName);
	}

	public function testCreateLabel() {
		$this->labelManager->createLabel('#aabbcc', 'labelTest_AcGhKlM');
		$allLabels = $this->labelManager->getAllLabels();

		$findedName = false;
		foreach ($allLabels as $label) {
			if ($label->getName() == 'labelTest3_AcGhKlM') {
				$findedName = true;
			}
		}

		$this->assertEquals(true, $findedName);
	}

	public function testEditLabel() {
		//create a label with name labelTest_AcGhKlM
		$this->labelManager->createLabel('#aabbcc', 'labelTest_AcGhKlM');

		//get All names of All labels
		$allLabels = $this->labelManager->getAllLabels();
		$arrayNames = array();
		foreach ($allLabels as $label) {
			$arrayNames[] = $label->getName();
		}

		//search name in array
		$key = array_search('labelTest_AcGhKlM', $arrayNames);
		$label = $allLabels[$key];

		//change color to label
		$label->setColor('#ccbbaa');
		$this->labelManager->editLabel($label);

		//it's changed color?
		$allLabels = $this->labelManager->getAllLabels();
		$this->assertEquals('#ccbbaa', $allLabels[$key]->getColor());
	}

	function testRemoveLabel(Label $label) {
		$this->labelManager->createLabel('#aabbcc', 'labelTest_AcGhKlM');
		$allLabels = $this->labelManager->getAllLabels();

		//get All names of All labels
		$allLabels = $this->labelManager->getAllLabels();
		$arrayNames = array();
		foreach ($allLabels as $label) {
			$arrayNames[] = $label->getName();
		}

		//search name in array
		$key = array_search('labelTest_AcGhKlM', $arrayNames);
		$label = $allLabels[$key];
		$this->assertEquals('labelTest_AcGhKlM', $label->getName());


		//delete label
		$this->labelManager->removeLabel($label);

		//get All names of All labels
		$allLabels = $this->labelManager->getAllLabels();
		$arrayNames = array();
		foreach ($allLabels as $label) {
			$arrayNames[] = $label->getName();
		}

		//search name in array
		$key = array_search('labelTest_AcGhKlM', $arrayNames);
		$this->assertEquals(false, $key);
	}

	public function tearDown() {
		$sql = 'DELETE * FROM mail_label WHERE name = "labelTest_AcGhKlM"';
		$this->dao->send($sql);
	}


}
*/
?>