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
class TaggableVirtualFilesHandler implements ITaggableObjectsHandler {	
	const OBJECTDATA_KEY_PATH = 'path';
	
	private static $Instance = null;
	
	protected function __construct() {}
	
	/**
	 * @param ITaggable $object
	 * @return boolean
	 */
	public function checkType($classType) {
		return is_child_of($classType, 'IFile');
	}
	
	public function createTaggableObject(array $taggableObjectData) {
		if (!isset($taggableObjectData[self::OBJECTDATA_KEY_PATH])) {
			throw new EyeInvalidArgumentException('Given $taggableObjectData is not valid (missing "' . self::OBJECTDATA_KEY_PATH . '" key).');
		}
		return FSI::getFile($taggableObjectData[self::OBJECTDATA_KEY_PATH]);
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
		}
		return self::$Instance;
	}
	
	public function & getTaggableObjectData(ITaggable $object, array & $taggableObjectData) {
		if (!($object instanceof IFile)) {
			throw new EyeInvalidClassException('$object must be an instance of IFile.');
		}
		if (!$object->exists()) {
			throw new EyeFileNotFoundException('Unable to tag non-existing file ' . $object->getPath(). '.');
		}
		$taggableObjectData[self::OBJECTDATA_KEY_PATH] = $object->getPath();
		return $taggableObjectData;
	}
}
?>
