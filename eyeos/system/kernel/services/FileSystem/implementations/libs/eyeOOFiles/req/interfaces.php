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

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface IVirtualFile extends IFile {
	/**
	 * @return IFile
	 */
	public function getRealFile();
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface ISecurableFile extends IFile {
	/**
	 * @throws EyeSecurityException
	 */
	public function checkAdminPermission();
	
	/**
	 * @throws EyeSecurityException
	 */
	public function checkDeletePermission();
	
	/**
	 * @throws EyeSecurityException
	 */
	public function checkReadPermission();
	
	/**
	 * @throws EyeSecurityException
	 */
	public function checkWritePermission();
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface ISecurableRemoteFile extends IFile {
	/**
	 * @throws EyeSecurityException
	 */
	public function checkConnectPermission();
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface IShareableFile extends IShareable, IFile {
	/**
	 * Returns all the principals with write permissions on this shared file.
	 * 
	 * @return array(AbstractEyeosPrincipal)
	 */
	public function getAllEditors();
	
	/**
	 * Returns all the principals with read permissions on this shared file.
	 * 
	 * @return array(AbstractEyeosPrincipal)
	 */
	public function getAllViewers();
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class VirtualFileMetaData extends BasicMetaData {
	// nothing more here
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class VirtualFilePermission extends SimplePermission {
	// nothing more here
}
//cis team
class GroupCalendarPermission extends SimplePermission { 
	// nothing more here
}
// cis team
?>