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

class ImpressionTO {
	private $id;
	private $sourceId;
	private $targetId;

	public function setId($id) {
		$this->id = $id;
	}

	public function getId() {
		return $this->id;
	}

	public function setSourceId($Id) {
		$this->sourceId = $Id;
	}

	public function getSourceId() {
		return $this->sourceId;
	}

	public function setTargetId($Id) {
		$this->targetId = $Id;
	}

	public function getTargetId() {
		return $this->targetId;
	}
}

class ImpressionsManager {
	private $provider = null;
	private $peopleTagManager = null;
	private $impressionTagManager = null;
	private static $Instance = null;

	public function __construct() {
		if($this->provider === null) {
			$this->provider = new SQLImpressionsProvider();
		}

		if($this->peopleTagManager === null) {
			$this->peopleTagManager = PeopleTagManager::getInstance();
		}

		if($this->impressionTagManager === null) {
			$this->impressionTagManager = ImpressionTagManager::getInstance();
		}
	}

    public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new ImpressionsManager();
		}

		return self::$Instance;
	}
	
	public function createImpression($sourceId, $targetId) {
		try {
			$newImpressionTO = new ImpressionTO();
			$newImpressionTO->setSourceId($sourceId);
			$newImpressionTO->setTargetId($targetId);

			$this->provider->storeImpressionTO($newImpressionTO);
			return $newImpressionTO;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to create the impression with target ' . $targetId . ' and source ' . $sourceId);
		}
	}

	public function getImpression($sourceId, $targetId) {
		try {
			return $this->provider->retrieveImpressionTOByTarget($sourceId, $targetId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to get the impression with target ' . $targetId . ' and source ' . $sourceId);
		}
	}

	public function getImpressionTOByTargetId($sourceId, $targetId) {
		try {
			return $this->provider->retrieveImpressionTOByTarget($sourceId, $targetId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to get the impression with target ' . $targetId);
		}
	}
	
	public function removeImpression(ImpressionTO $impressionTO) {
		try {
			foreach($this->getTagsPerImpression($impressionTO) as $tagPerImpression) {
				$this->impressionTagManager->removeTagPerImpressionTO($tagPerImpression);
			}

			$this->provider->deleteImpressionTO($impressionTO);

			if ($impressionTO != null) {
				$otherImpressionTO = $this->getImpressionToByTargetId($impressionTO->getTargetId(), $impressionTO->getSourceId());
			} else {
				$otherImpressionTO = null;
			}

			if ($otherImpressionTO != null) {
				$this->provider->deleteImpressionTO($otherImpressionTO);
			}
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to remove the impression ' . $impressionTO->getId());
		}
	}
	
	public function addTagToImpression(PeopleTag $tag, ImpressionTO $impressionTO) {
		try {
			$this->impressionTagManager->addTagToImpression($tag, $impressionTO);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}
	
	public function removeTagToImpression(PeopleTag $tag, ImpressionTO $impressionTO) {
		try {
			$this->impressionTagManager->removeTagToImpression($tag, $impressionTO);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getTagsPerImpression(ImpressionTO $impressionTO) {
		try {
			return $this->impressionTagManager->getAllTagPerImpressionTO($impressionTO);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to get the tags for the impression ' . $impressionTO->getId());
		}
	}

	public function createTag($name, $userId) {
		try {
			return $this->peopleTagManager->createTag($name, $userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function editTag(PeopleTag $tag) {
		try {
			$this->peopleTagManager->editTag($tag);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function removeTag(PeopleTag $tag) {
		try {
			$this->peopleTagManager->removeTag($tag);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getAllTags($userId) {
		try {
			return $this->peopleTagManager->getAllTags($userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getTagName($tagId) {
		try {
			return $this->peopleTagManager->getTagName($tagId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

}
?>