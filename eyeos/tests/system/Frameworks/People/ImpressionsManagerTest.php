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

class ImpressionsManagerTest extends PHPUnit_Framework_TestCase {

        private $impressionsManager;
        private $dao;

        function __construct() {
            $this->impressionsManager= new ImpressionsManager();
            $this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

        public function setUp() {
            $sql = 'TRUNCATE TABLE impressionto';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE tagperimpressionto';
            $this->dao->send($sql);
        }

        public function testCreateImpression() {
            $userId = 3;

			$allImpressions = array();
            //Testing create Impression
            $allImpressions[] = $this->impressionsManager->createImpression(3, 5);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 8);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 9);
            $allImpressions[] = $this->impressionsManager->createImpression(7, 9);
            
			$getImpression = $this->impressionsManager->getImpressionTOByTargetId('3', '5');
			$this->assertEquals(1, count($getImpression));
			$getImpression = $this->impressionsManager->getImpressionTOByTargetId('3', '9');
			$this->assertEquals(1, count($getImpression));

        }

          public function testRemoveImpression(){
            $userId = 3;

			$allImpressions = array();
            //Testing create Impression
            $allImpressions[] = $this->impressionsManager->createImpression(3, 5);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 8);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 9);
            $allImpressions[] = $this->impressionsManager->createImpression(7, 9);

			$getImpression = $this->impressionsManager->getImpressionTOByTargetId('3', '8');
			$this->assertEquals(1, count($getImpression));
            $this->impressionsManager->removeImpression($allImpressions[1]);
			$getImpression = $this->impressionsManager->getImpressionTOByTargetId('3', '8');
            $this->assertEquals(0, count($getImpression));

	}

        public function testAddTagToImpression(){
            $userId = 3;

			$allImpressions = array();
            //Testing create Impression
            $allImpressions[] = $this->impressionsManager->createImpression(3, 5);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 8);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 9);
            $allImpressions[] = $this->impressionsManager->createImpression(7, 9);

            //Testing addTagToImpression()
            $newTag = new PeopleTag();
            $newTag->setId(9);
            $newTag->setName('Family');
            $newTag2 = new PeopleTag();
            $newTag2->setId(17);
            $newTag2->setName('Friends');

            $this->impressionsManager->addTagToImpression($allImpressions[0], $newTag);
            $this->assertEquals(1, count($allImpressions[0]->getTagsPerImpression()));
            $this->impressionsManager->addTagToImpression($allImpressions[0], $newTag2);
            $this->assertEquals(2, count($allImpressions[0]->getTagsPerImpression()));
            $this->impressionsManager->addTagToImpression($allImpressions[1], $newTag2);
            $this->assertEquals(1, count($allImpressions[1]->getTagsPerImpression()));

            $tagsPerImpression = $allImpressions[0]->getTagsPerImpression();
            $this->assertEquals(9, $tagsPerImpression[0]->getTagId());

	}

        public function testRemoveTagToImpression(){
            $userId = 3;

			$allImpressions = array();
            //Testing create Impression
            $allImpressions[] = $this->impressionsManager->createImpression(3, 5);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 8);
            $allImpressions[] = $this->impressionsManager->createImpression(3, 9);
            $allImpressions[] = $this->impressionsManager->createImpression(7, 9);

            //Testing addTagToImpression()
            $newTag = new PeopleTag();
            $newTag->setId(9);
            $newTag->setName('Family');
            $newTag2 = new PeopleTag();
            $newTag2->setId(17);
            $newTag2->setName('Friends');

            $this->impressionsManager->addTagToImpression($allImpressions[0], $newTag);
            $this->assertEquals(1, count($allImpressions[0]->getTagsPerImpression()));
            $this->impressionsManager->addTagToImpression($allImpressions[0], $newTag2);
            $this->assertEquals(2, count($allImpressions[0]->getTagsPerImpression()));
            $this->impressionsManager->addTagToImpression($allImpressions[1], $newTag2);
            $this->assertEquals(1, count($allImpressions[1]->getTagsPerImpression()));

            $tagsPerImpression = $allImpressions[0]->getTagsPerImpression();
            $this->assertEquals(9, $tagsPerImpression[0]->getTagId());

            //Testing removeTagToImpression
            $this->impressionsManager->removeTagToImpression($allImpressions[0], $newTag);
            $this->assertEquals(1, count($allImpressions[0]->getTagsPerImpression()));
            $this->impressionsManager->removeTagToImpression($allImpressions[0], $newTag2);
            $this->assertEquals(0, count($allImpressions[0]->getTagsPerImpression()));
            $this->impressionsManager->removeTagToImpression($allImpressions[1], $newTag2);
            $this->assertEquals(0, count($allImpressions[1]->getTagsPerImpression()));
	}

    public function tearDown() {
            $sql = 'TRUNCATE TABLE impressionto';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE tagperimpressionto';
            $this->dao->send($sql);
    }

}
?>