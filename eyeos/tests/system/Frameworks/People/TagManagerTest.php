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


class PeopleTagManagerTest extends PHPUnit_Framework_TestCase {

	private $tagManager;
	private $dao;

	function __construct() {
			$this->tagManager= new PeopleTagManager();
			$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

	public function setUp() {
			// Deleting all tags in database. HARD-CODED
			$sql = 'TRUNCATE TABLE tag';
			$this->dao->send($sql);
	}

	// OK
	public function testGetAllTags() {
		 $userId = '433';
		 $this->tagManager->createTag('Tag1', $userId);
		 $this->tagManager->createTag('Tag2', $userId);
		 $this->tagManager->createTag('Tag3', $userId);

		 $allTags = $this->tagManager->getAllTags($userId);

		 $this->assertEquals( 'Tag1', $allTags[0]->getName());
		 $this->assertEquals( 'Tag2', $allTags[1]->getName());
		 $this->assertEquals('Tag3', $allTags[2]->getName());
	}

	//OK
	public function testCreateTag() {
			$userId = '433';
			$name = 'Family';
			$this->tagManager->createTag($name, $userId);
			$name2 = 'Friends';
			$this->tagManager->createTag($name2, $userId);

			$allTags = $this->tagManager->getAllTags($userId);
			$this->assertEquals($name, $allTags[0]->getName());
			$this->assertEquals($name2, $allTags[1]->getName());
	}

	//OK
	public function testEditTag() {
			$userId = '433';
			$this->tagManager->createTag('Tag1', $userId);
			$this->tagManager->createTag('Tag2', $userId);
			$this->tagManager->createTag('Tag3', $userId);

			$allTags = $this->tagManager->getAllTags($userId);
			$allTags[1]->setName('EditedTag');

			$this->tagManager->editTag($allTags[1]);

			$allTags = $this->tagManager->getAllTags($userId);
			$this->assertEquals('EditedTag', $allTags[1]->getName());
}

	//OK
	public function testRemoveTag() {
			$userId = '433';
			$this->tagManager->createTag('Tag1', $userId);
			$this->tagManager->createTag('Tag2', $userId);
			$this->tagManager->createTag('Tag3', $userId);

			$allTags = $this->tagManager->getAllTags($userId);

			$this->tagManager->removeTag($allTags[1]);

			$allTags = $this->tagManager->getAllTags($userId);
			$this->assertNotEquals('Tag2', $allTags[1]->getName());
			$this->assertEquals(2, count($allTags));
	}

	public function tearDown() {
			// Deleting all tags in database. HARD-CODED
			$sql = 'TRUNCATE TABLE tag';
			$this->dao->send($sql);
	}
}

?>