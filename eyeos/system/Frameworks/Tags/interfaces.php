<?php
/*

				                   ____  _____
				  ___  __  _____  / __ \/ ___/
				 / _ \/ / / / _ \/ / / /\__ \
				/  __/ /_/ /  __/ /_/ /___/ /
				\___/\__, /\___/\____//____/
				    /____/        2.0 Future

               Cloud Computing Operating System
                        www.eyeos.org

                  eyeos is released under the
		GNU Affero General Public License Version 3 (AGPL3)
         provided with this release in the file "LICENSE"
        or via web at http://gnu.org/licenses/agpl-3.0.txt

        Copyright 2005-2009 eyeos Team (team@eyeos.org)
*/

/**
 * 
 * @package kernel-frameworks
 * @subpackage Tags
 */
interface ITagManager extends ISingleton {
	// Principal2Tags
	public function createTag(IPrincipal $principal, ITag $tag);
	public function deleteTag(ITag $tag);
	public function getTag(IPrincipal $principal, ITag $tag);
	public function updateTag(ITag $tag, ITag $newTag);
	
	// Tags2Objects
	public function addAllTags(ITaggable $object, array $tags);
	public function addTag(ITaggable $object, ITag $tag);
	public function clearTags(IPrincipal $principal, ITaggable $object);
	public function removeAllTags(ITaggable $object, array $tags);
	public function removeTag(ITaggable $object, ITag $tag);
	
	//Mixed
	public function getAllTags(IPrincipal $principal, ITaggable $object = null);
	
	/**
	 * 
	 * @param string $string A string or a tag
	 * @param array(IPrincipal) $principals
	 * @return array(EyeObject)
	 */
	public function search($string, array $principals = null);
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Tags
 */
interface ITagProvider extends ISingleton {
	// Principal2Tags
	
	/**
	 * @throws EyeTagAlreadyExistsException
	 */
	public function createTag($principalId, ITag $tag);
	public function deleteTag(ITag $tag);
	
	/**
	 * @throws EyeNoSuchTagException
	 */
	public function getTag($principalId, ITag $tag);
	public function updateTag(ITag $tag, ITag $newTag);
	
	// Tags2Objects
	public function addAllTags(array $objectData, $handlerClassName, array $tags);
	public function removeAllTags(array $objectData, array $tags);
	
	//Mixed
	public function getAllTags($principalId, $objectId = null);
	
	/**
	 * 
	 * @param string $string
	 * @param array $principalIds
	 * @return array(array)
	 */
	public function search($string, array $principalIds = null);
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Tags
 */
interface ITaggableObjectsHandler extends ISingleton {
	public function checkType($classType);
	public function createTaggableObject(array $taggableObjectData);
	public function & getTaggableObjectData(ITaggable $object, array & $taggableObjectData);
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Tags
 */
class BasicTag implements ITag {
	private $color = null;
	private $id = null;
	private $label = null;
	
	public function __construct($label = null, $color = null) {
		if ($label !== null) {
			$this->setLabel($label);
		}
		if ($color !== null) {
			$this->setColor($color);
		} else {
			$this->setColor(ITag::DEFAULT_COLOR);
		}
	}
	
	public function __toString() {
		return $this->label;
	}
	
	public function getColor() {
		return $this->color;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function getAttributesMap() {
		return get_object_vars($this);
	}
	
	public function setColor($color) {
		$this->color = (string) $color;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function setLabel($label) {
		if ($this->label !== null) {
			throw new EyeBadMethodCallException('Cannot overwrite a tag label.');
		}
		if (!is_string($label)) {
			throw new EyeInvalidArgumentException('$label must be a string.');
		}
		$this->label = $label;
	}
}
?>