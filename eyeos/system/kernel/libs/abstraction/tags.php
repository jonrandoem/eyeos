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
 * Defines some convenient methods to manage tags directly from the taggable objects.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface ITaggable extends EyeObject {
	/**
	 * 
	 * @param ITag $tag
	 */
	public function addTag(ITag $tag);
	
	/**
	 * 
	 * @param AbstractEyeosPrincipal $principal
	 * @return array(ITag)
	 */
	public function getAllTags(AbstractEyeosPrincipal $principal = null);
	
	/**
	 * 
	 * @param ITag $tag
	 */
	public function removeTag(ITag $tag);
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface ITag extends ISimpleMapObject {
	const DEFAULT_COLOR = '#ff0000';
	
	public function __construct($label = null, $color = null);
	public function __toString();
	public function getColor();
	public function getId();
	public function getLabel();
	public function setColor($color);
	public function setId($id);
	public function setLabel($label);
}
?>
