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

class ContactManagerTest extends PHPUnit_Framework_TestCase {
		private $contactManager;
        private $dao;

        function __construct() {
            $this->contactManager= new ContactManager();
            $this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
		}

        public function setUp() {
            // Deleting all impressions in database. HARD-CODED
            $sql = 'TRUNCATE TABLE impressionto';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE relation';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE tagperimpressionto';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE tag';
            $this->dao->send($sql);
        }

        public function testAddNewContact() {
            $source = '9';
            $target ='18';
            $target2 = '34' ;

            $this->contactManager->addNewContact($source, $target);
            $this->contactManager->addNewContact($source, $target2);

            $contacts = $this->contactManager->getAllContacts($source);
            $this->assertEquals(2, count($contacts));
            $this->assertEquals('18', $contacts[0]->getImpression()->getImpressionTO()->getTargetId());
            $this->assertEquals('34', $contacts[1]->getImpression()->getImpressionTO()->getTargetId());
            $this->assertEquals('pending', $contacts[0]->getRelation()->getState());
		}

        public function testConfirmContact() {
            $source = '9';
            $target ='18';
            $target2 = '34' ;

            $this->contactManager->addNewContact($source, $target);

            //Testing confirmContact()
            $contacts = $this->contactManager->getAllContacts($source);
            $this->assertEquals('pending', $contacts[0]->getRelation()->getState());
            $this->contactManager->confirmContact($source, $target);
            $this->assertEquals('accepted', $contacts[0]->getRelation()->getState());
		}

        public function testGetAllContacts() {
            $source = '9';
            $target ='18';
            $target2 = '34' ;

            $this->contactManager->addNewContact($source, $target);
            $this->contactManager->addNewContact($source, $target2);

            //Testing also getAllContacts
            $contacts = $this->contactManager->getAllContacts($source);
            $this->assertEquals(2, count($contacts));
            $this->assertEquals('18', $contacts[0]->getImpression()->getImpressionTO()->getTargetId());
            $this->assertEquals('34', $contacts[1]->getImpression()->getImpressionTO()->getTargetId());
            $this->assertEquals('pending', $contacts[0]->getRelation()->getState());
		}

        public function testRemoveContact() {
            $source = '9';
            $target ='18';
            $target2 = '34' ;

            $this->contactManager->addNewContact($source, $target);
            $this->contactManager->addNewContact($source, $target2);

            //Testing removeContact()
            $contacts = $this->contactManager->getAllContacts($source);
            $this->contactManager->removeContact($contacts[1]);
            $contacts = $this->contactManager->getAllContacts($source);
            $this->assertEquals(1, count($contacts));
            $this->contactManager->removeContact($contacts[0]);
            $contacts = $this->contactManager->getAllContacts($source);
            $this->assertEquals(0, count($contacts));
		}

        public function testAddTagToContact() {
            $source = '9';
            $target ='18';
            $target2 = '34' ;

            $this->contactManager->addNewContact($source, $target);
            $this->contactManager->addNewContact($source, $target2);

            //Testing addTagToContact();
            $tag = new PeopleTag();
            $tag->setId(7);
            $tag->setName('Friends');

            $contacts = $this->contactManager->getAllContacts($source);
            $this->contactManager->addTagToContact($tag, $contacts[0]);
            $tagsPerImpression = $contacts[0]->getImpression()->getTagsPerImpression();
            $this->assertEquals(1, count($tagsPerImpression) );
            $this->assertEquals(7, $tagsPerImpression[0]->getTagId());

		}

        public function testRemoveTagToContact() {
            $source = '9';
            $target ='18';
            $target2 = '34' ;

            $this->contactManager->addNewContact($source, $target);
            $this->contactManager->addNewContact($source, $target2);

            //Testing addTagToContact();
            $tag = new PeopleTag();
            $tag->setId(7);
            $tag->setName('Friends');

            $contacts = $this->contactManager->getAllContacts($source);
            $this->contactManager->addTagToContact($tag, $contacts[0]);
            $tagsPerImpression = $contacts[0]->getImpression()->getTagsPerImpression();
            $this->assertEquals(1, count($tagsPerImpression) );
            $this->assertEquals(7, $tagsPerImpression[0]->getTagId());

            //Testing removeTagToContact()
            $this->contactManager->removeTagToContact($tag, $contacts[0]);
            $tagsPerImpression = $contacts[0]->getImpression()->getTagsPerImpression();
            $this->assertEquals(0, count($tagsPerImpression) );
		}

        public function tearDown() {
            // Deleting all impressions in database. HARD-CODED
            $sql = 'TRUNCATE TABLE impressionto';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE relation';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE tagperimpressionto';
            $this->dao->send($sql);
            $sql = 'TRUNCATE TABLE tag';
            $this->dao->send($sql);
        }
}

?>