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

class RecollVirtualFileListener extends AbstractFileAdapter {
	private static $Instance = NULL;

	protected function __construct() {}

	public function directoryCreated(FileEvent $e) {
		if ($e->getSource() instanceof EyeUserFile) {
			SearchFileRecollPlugin::callRecollIndex($e->getSource()->getRealFile(), '-d');
		}
	}

	public function fileCreated(FileEvent $e) {
		if ($e->getSource() instanceof EyeUserFile) {
			SearchFileRecollPlugin::callRecollIndex($e->getSource()->getRealFile(), '-i');
		}
	}

	public function fileDeleted(FileEvent $e) {
		if ($e->getSource() instanceof EyeUserFile) {
			SearchFileRecollPlugin::callRecollIndex($e->getSource()->getRealFile(), '-e');
		}
	}

	public function fileMoved(FileEvent $e) {
		if ($e->getSource() instanceof EyeUserFile) {
			SearchFileRecollPlugin::callRecollIndex($e->getSource()->getRealFile(), '-e');
		}
		
		if ($e->getSource() instanceof EyeosAbstractVirtualFile
			&& $e->getRelatedSource() instanceof EyeUserFile
			&& $e->getSource()->getRoot()->equals($e->getRelatedSource()->getRoot())) {
			SearchFileRecollPlugin::callRecollIndex($e->getRelatedSource()->getRealFile(), '-i');
		}
	}

	public function fileRenamed(FileEvent $e) {
		if ($e->getSource() instanceof EyeUserFile) {
			SearchFileRecollPlugin::callRecollIndex($e->getSource()->getRealFile(), '-e');
			SearchFileRecollPlugin::callRecollIndex($e->getRelatedSource()->getRealFile(), '-i');
		}
	}

	public function fileWritten(FileEvent $e) {
		if ($e->getSource() instanceof EyeUserFile) {
			SearchFileRecollPlugin::callRecollIndex($e->getSource()->getRealFile(), '-i');
		}
	}

	public static function getInstance() {
		if ( self::$Instance === null) {
			self::$Instance = new RecollVirtualFileListener();
		}
		return self::$Instance;
	}
}
?>
