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

class RelationsManagerTest extends PHPUnit_Framework_TestCase {
    private $provider;
    private $relationsManager;
    private $dao;

    function __construct() {
        $this->relationsManager = new RelationsManager();
        $this->provider = new SQLRelationsProvider(); // This is hard-coded, maybe in the future it will use another provider
        $this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
    }

    public function setUp() {
        // Deleting all impressions in database. HARD-CODED
        $sql = 'TRUNCATE TABLE relation';
        $this->dao->send($sql);
    }

    public function testGetAllRelations() {
        $userId = "3";
        $this->relationsManager->createRelation("3", "5");
        $this->relationsManager->createRelation("3", "7");
        $this->relationsManager->createRelation("15", "3");
        $this->relationsManager->createRelation("5", "10");

        $allRelations = $this->relationsManager->getAllRelations($userId);

        $this->assertEquals($allRelations[0]->getTargetId(), "5");
        $this->assertEquals($allRelations[1]->getTargetId(), "7");
        $this->assertEquals($allRelations[2]->getTargetId(), "3");
        $this->assertEquals(3 ,count($allRelations)); //only 3 why relation 4 isn't of this user
        
    }

    public function testRemoveRelation () {
        $userId = "3";

        $this->relationsManager->createRelation("3", "5");
        $this->relationsManager->createRelation("3", "7");
        $this->relationsManager->createRelation("6", "7");

        $allRelations = $this->relationsManager->getAllRelations($userId);
        $this->assertEquals(2, count($allRelations));
        
        $this->relationsManager->removeRelation($allRelations[1]);
        $allRelations = $this->relationsManager->getAllRelations($userId);
        $this->assertEquals(1, count($allRelations));

        $this->relationsManager->removeRelation($allRelations[0]);
        $allRelations = $this->relationsManager->getAllRelations($userId);
        $this->assertEquals(0, count($allRelations));
    }

    public function testUpdateRelation() {
        $userId = '3';

        $this->relationsManager->createRelation('3', '5');
        $this->relationsManager->createRelation('3', '7');
        $this->relationsManager->createRelation('6', '7');

        $allRelations = $this->relationsManager->getAllRelations($userId);
        $this->assertEquals('pending', $allRelations[1]->getState());

        $this->relationsManager->updateRelation('3', '7');
        $this->assertEquals('accepted', $allRelations[1]->getState());
    }

	public function tearDown() {
        // Deleting all impressions in database. HARD-CODED
        $sql = 'TRUNCATE TABLE relation';
        $this->dao->send($sql);
    }
}
?>