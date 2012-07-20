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

class PeopleTag {
	private $id;
	private $userId;
	private $name;

	public function setId($id) {
		$this->id = $id;
	}

	public function getId() {
		return $this->id;
	}

	public function setUserId($userId) {
		$this->userId = $userId;
	}

	public function getUserId() {
		return $this->userId;
	}

	public function setName($name) {
		$this->name = $name;
	}

	public function getName() {
		return $this->name;
	}
}

class PeopleTagManager {
	private $provider = null;
	private static $Instance = null;

	function __construct() {
		if($this->provider === null) {
			$this->provider = new SQLPeopleTagProvider();
		}
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new PeopleTagManager();
		}

		return self::$Instance;
	}

	public function createTag($name, $userId) {
		try {
			$newTag = new PeopleTag();
			$newTag->setName($name);
			$newTag->setUserId($userId);

			$this->provider->storeTag($newTag);
			return $newTag;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to create the tag ' . $name . ' for user id ' . $userId, 0, $e);
		}
	}

	public function editTag(PeopleTag $tag) {
		try {
			$this->provider->updateTag($tag);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to edit the tag ' . $tag->getName(), 0, $e);
		}
	}

	public function removeTag(PeopleTag $tag) {
		try {
			$this->provider->deleteTag($tag);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to remove the tag ' . $tag->getName(), 0, $e);
		}
	}

	public function getAllTags($userId) {
		try {
			return $this->provider->retrieveAllTags($userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable get tags for user id ' . $userId, 0, $e);
		}
	}

	public function getTagName($tagId) {
		try {
			return $this->provider->getTagName($tagId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable get the name of the tag with id ' . $tagId, 0, $e);
		}
	}
}

class TagPerImpressionTO {
	private $id;
	private $tagId;
	private $impressionId;

	public function setId($id) {
		$this->id = $id;
	}

	public function getId() {
		return $this->id;
	}

	public function setTagId($id) {
		$this->tagId = $id;
	}

	public function getTagId() {
		return $this->tagId;
	}

	public function setImpressionId($id) {
		$this->impressionId = $id;
	}

	public function getImpressionId() {
		return $this->impressionId;
	}
}

class ImpressionTagManager {
	private $provider = null;
	private static $Instance = null;

	function __construct() {
		if($this->provider === null) {
			$this->provider = new SQLImpressionTagProvider();
		}
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new ImpressionTagManager();
		}

		return self::$Instance;
	}

	public function addTagToImpression(PeopleTag $tag, ImpressionTO $impressionTO) {
		try {
			$newTagToImpression = new TagPerImpressionTO();
			$newTagToImpression->setTagId($tag->getId());
			$newTagToImpression->setImpressionId($impressionTO->getId());
			$this->provider->storeTagPerImpressionTO($newTagToImpression);

			return $newTagToImpression;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to add the tag ' . $tag->getName());
		}
	}

	public function removeTagToImpression(PeopleTag $tag, ImpressionTO $impressionTO) {
		try {
			$tagsPerImpression = $this->provider->retrieveAllTagPerImpressionTO($impressionTO->getId());
			foreach ($tagsPerImpression as $currentTagPerImpression) {
				if ($tag->getId() == $currentTagPerImpression->getTagId()) {
					$tagPerImpressionToRemove = $currentTagPerImpression;
					break;
				}
			}

			$this->provider->deleteTagPerImpressionTO($tagPerImpressionToRemove);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to remove the tag ' . $tag->getName());
		}
	}

	public function getAllTagPerImpressionTO(ImpressionTO $impressionTO) {
		try {
			return $this->provider->retrieveAllTagPerImpressionTO($impressionTO->getId());
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to remove the tag ' . $tag->getName());
		}
	}

	public function removeTagPerImpressionTO(TagPerImpressionTO $tagPerImpressionTO) {
		try {
			return $this->provider->deleteTagPerImpressionTO($tagPerImpressionTO);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to remove the tag ' . $tag->getName());
		}
	}
}
?>