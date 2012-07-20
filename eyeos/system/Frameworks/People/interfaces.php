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


interface IImpressionsProvider {
	public function storeImpressionTO(ImpressionTO $impressionTO);
	public function deleteImpressionTO(ImpressionTO $impressionTO) ;
	public function retrieveAllImpressionsTO(ImpressionTO $impressionTO);
	public function retrieveImpressionTOByTarget($sourceId, $targetId);
}

interface IRelationsProvider {
	public function storeRelation(Relation $relation);
	public function updateRelation(Relation $relation);
	public function deleteRelation(Relation $relation);
	public function searchRelation(Relation $relation);
	public function retrieveAllRelationsByUserId(IUser $user);
	public function retrieveLastRelationsByUserId(IUser $user, $limit);
}

interface IPeopleTagProvider {
	public function storeTag(PeopleTag $tag);
	public function deleteTag(PeopleTag $tag);
	public function updateTag(PeopleTag $tag);
	public function retrieveAllTags($userId);
	public function getTagName($tagId);
}

interface IImpressionTagProvider {
	public function storeTagPerImpressionTO(TagPerImpressionTO $tagPerImpression);
	public function deleteTagPerImpressionTO(TagPerImpressionTO $tagPerImpressionTO);
	public function retrieveAllTagPerImpressionTO($impressionId);
}

class PeopleEvent extends EventObject {
	public function __construct($source, $relatedSource = null) {
		parent::__construct($source, $relatedSource);
	}
}

interface IPeopleListener extends IEventListener {
	public function contactCreated(PeopleEvent $e);
	public function contactConfirmed(PeopleEvent $e);
	public function contactBeforeDeletion(PeopleEvent $e);
	public function contactDeleted(PeopleEvent $e);

	public function tagAddedToContact(PeopleEvent $e);
	public function beforeTagDeletionToContact(PeopleEvent $e);
	public function tagDeletedToContact(PeopleEvent $e);

	public function tagCreated(PeopleEvent $e);
	public function tagModified(PeopleEvent $e);
	public function tagRemoved(PeopleEvent $e);
}

abstract class AbstractPeopleAdapter implements IPeopleListener {
	public function contactCreated(PeopleEvent $e) {}
	public function contactConfirmed(PeopleEvent $e) {}
	public function contactBeforeDeletion(PeopleEvent $e) {}
	public function contactDeleted(PeopleEvent $e) {}

	public function tagAddedToContact(PeopleEvent $e) {}
	public function beforeTagDeletionToContact(PeopleEvent $e) {}
	public function tagDeletedToContact(PeopleEvent $e) {}

	public function tagCreated(PeopleEvent $e) {}
	public function tagModified(PeopleEvent $e) {}
	public function beforeTagDeletion(PeopleEvent $e) {}
	public function tagRemoved(PeopleEvent $e) {}
}

interface IObservablePeopleManager {
	public function addPeopleListener(IPeopleListener $listener, $currentRequestOnly = true);
	public function fireEvent($type, PeopleEvent $event);
	public function getAllPeopleListeners();
	public function removePeopleListener(IPeopleListener $listener);
}
?>