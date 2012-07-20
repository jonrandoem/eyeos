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
 * @subpackage MMap
 */
class MMapScreen extends Kernel implements IMMap {
	private static $scripts = null;
	public static function getInstance() {
		return parent::getInstance(__CLASS__);
	}

	protected function __construct() {
		self::$scripts = array(
			// Independant base scripts
			EYE_ROOT . '/extern/js/prototype.js',
			EYE_ROOT . '/extern/js/eyeos.utils.js',

			// Legacy widgets and GUI components
			// TODO: should be refactorized (most of them) and moved to /extern/eyeos/ui/*
			EYE_ROOT . '/extern/js/qx.ui.decoration.RoundBorderBeveled.js',
			EYE_ROOT . '/extern/js/eyeos.ui.menu.Button.js',
			EYE_ROOT . '/extern/js/eyeos.ui.menu.Separator.js',
			EYE_ROOT . '/extern/js/eyeos.ui.menu.CheckBox.js',
			EYE_ROOT . '/extern/js/eyeos.ui.menu.SwitchButton.js',
			EYE_ROOT . '/extern/js/eyeos.ui.menu.Menu.js',
			EYE_ROOT . '/extern/js/eyeos.ui.menubar.MenuBar.js',
			EYE_ROOT . '/extern/js/eyeos.ui.menubar.Button.js',
			EYE_ROOT . '/extern/js/eyeos.ui.genericbar.IItems.js',
			EYE_ROOT . '/extern/js/eyeos.ui.genericbar.IActions.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.ToolBar.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.MenuButton.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.Button.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.Part.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.Part.Grid.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.Header.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.ImageHeader.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.LabelHeader.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.SelectBox.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.ListItem.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.Spinner.js',
			EYE_ROOT . '/extern/js/eyeos.ui.form.Spinner.js',
			EYE_ROOT . '/extern/js/eyeos.ui.form.SelectBox.js',
			EYE_ROOT . '/extern/js/eyeos.ui.form.ColorButton.js',
			EYE_ROOT . '/extern/js/eyeos.ui.form.Slider.js',
			EYE_ROOT . '/extern/js/eyeos.ui.control.ColorPopup.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.ColorButton.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.ImageMenuButton.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.CheckBox.js',
			EYE_ROOT . '/extern/js/eyeos.ui.toolbar.ToggleButton.js',
			EYE_ROOT . '/extern/js/eyeos.ui.tree.TreeFolder.js',
			EYE_ROOT . '/extern/js/eyeos.ui.tree.TreeColorFolder.js',

			// NetSync ExecModule dependencies
			EYE_ROOT . '/extern/js/jquery/jquery-1.5.1.js',

			// Desktop Scripts
			// TODO: should be refactorized (most of them) and moved to /extern/eyeos/ui/*
			EYE_ROOT . '/extern/js/qx.ui.EyeDesktop.js',
			EYE_ROOT . '/extern/js/eyeos.ui.Window.js',
			EYE_ROOT . '/extern/js/qx.ui.EyePanel.js',
			EYE_ROOT . '/extern/js/qx.ui.EyeTaskBar.js',
			EYE_ROOT . '/extern/js/qx.ui.EyeTaskButtons.js',
			EYE_ROOT . '/extern/js/qx.ui.EyeTabDesktop.js',
                    
			//files
			EYE_ROOT . '/extern/js/eyeos.files.File.js',

			// Dashboard Scripts
			EYE_ROOT . '/extern/js/eyeos.dashboard.Board.js',
			EYE_ROOT . '/extern/js/eyeos.dashboard.Container.js',
			EYE_ROOT . '/extern/js/eyeos.dashboard.Widget.js',

			//NetSync Scripts
			EYE_ROOT . '/extern/js/eyeos/netSync/lib/ByteSocket.js',
			EYE_ROOT . '/extern/js/eyeos/netSync/lib/StompClient.js',
			EYE_ROOT . '/extern/js/eyeos/netSync/NetSync.js',
			EYE_ROOT . '/extern/js/eyeos/netSync/Message.js',

			// ContactManager Scripts
			EYE_ROOT . '/extern/js/eyeos/AbstractMetadata.js',
			EYE_ROOT . '/extern/js/eyeos/contacts/Contact.js',
			EYE_ROOT . '/extern/js/eyeos/contacts/ContactManager.js',
			EYE_ROOT . '/extern/js/eyeos/contacts/Metadata.js',

			//Event Scripts
			EYE_ROOT . '/extern/js/eyeos/events/Event.js',
			EYE_ROOT . '/extern/js/eyeos/events/EventInformation.js',

			//Tag Scripts
			EYE_ROOT . '/extern/js/eyeos/tag/BasicTag.js',

			// Tabs Scripts
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Events/Scroller.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Events/rowrendererDefault.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Events/Page.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Events/Sidebar.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Events/FilterButton.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Events/Table.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Events/Search.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Page.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/TagButton.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Item.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/ContactAdd.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/ContactAll.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/AdminInviteContact.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/ContactPending.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/GroupAll.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/GroupAdd.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/NewGroupWindow.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/GroupAdminWindow.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/GroupTag.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/GroupCalendar.js',
			EYE_ROOT . '/extern/js/eyeos/ui/tabs/Application.js',

			// eyeOS widgets
			EYE_ROOT . '/extern/js/eyeos/ui/widgets/LocationSelectBox.js',
			EYE_ROOT . '/extern/js/eyeos/ui/widgets/LocationComboBox.js',
			EYE_ROOT . '/extern/js/eyeos/ui/widgets/TreeLocationComboBox.js',
			EYE_ROOT . '/extern/js/eyeos/ui/widgets/celleditor.LocationSelectBox.js',
			EYE_ROOT . '/extern/js/eyeos/ui/widgets/TextArea.js',
			EYE_ROOT . '/extern/js/eyeos/ui/widgets/Image.js',

			// Other System Scripts
			EYE_ROOT . '/extern/js/eyeos.system.EyeApplication.js',
			EYE_ROOT . '/extern/js/eyeos.dialogs.js',
			EYE_ROOT . '/extern/js/eyeos.dialogs.FileChooser.js',
			EYE_ROOT . '/extern/js/eyeos.dialogs.IconChooser.js',

			// Social Bar Scripts
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.SocialBar.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.SocialTab.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.ISocialBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.Label.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.Info.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.InfoBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.Activity.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.ActivityBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.TagWindow.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.TagBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.Note.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.NoteBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.Shared.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.SharedBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.ShareWindow.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.ShareWindowItem.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.SharedWithBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.SharedWithContact.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.SharedElement.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.ContextButton.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.MenuButton.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.Relation.js',
			EYE_ROOT . '/extern/js/SocialBar/InfoFactory/eyeos.socialbar.InfoFactory.js',
			EYE_ROOT . '/extern/js/SocialBar/InfoFactory/eyeos.socialbar.file2InfoConverter.js',
			EYE_ROOT . '/extern/js/SocialBar/SharedFactory/eyeos.socialbar.SharedFactory.js',
			EYE_ROOT . '/extern/js/SocialBar/SharedFactory/eyeos.socialbar.file2SharedConverter.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLBox.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLComposite.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLElement.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLWindow.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLWindow.toolbar.Actions.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLWindow.toolbar.bottom.Items.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLWindow.toolbar.bottom.Conf.js',
			EYE_ROOT . '/extern/js/SocialBar/eyeos.socialbar.URLWindow.toolbar.top.Items.js',
			EYE_ROOT . '/extern/js/security.js',
			// PHP.JS library
			EYE_ROOT . '/extern/js/php.full.namespaced.min.js',
		);
	}
	 
	public function checkRequest(MMapRequest $request) {
		return true;
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response) {
	    	ob_start("ob_gzhandler");

		// header
		$expires = 60*60*24*90;
		$response->getHeaders()->append("Pragma: public");
		$response->getHeaders()->append("Cache-Control: max-age=".$expires.", must-revalidate");
		$response->getHeaders()->append('Expires: ' . gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');
		
		if(SYSTEM_TYPE == 'release') {
		    $eyeosjs = file_get_contents('extern/js/eyeos.compressed.js');
			if(!file_exists(SERVICE_MMAP_PATH . '/cache/basesystem.cache')) {
				$fileInputStreams = array();
				foreach(self::$scripts as &$scriptPath) {
						$fileInputStreams[] = new FileInputStream($scriptPath);
				}
				$data = "";
				foreach($fileInputStreams as $file) {
					$reader = new BasicInputStreamReader($file);
					$data .= $reader->readAll();
				}
				file_put_contents(SERVICE_MMAP_PATH . '/cache/basesystem.cache', JSMin::minify($data));
			}
		}

                $body = '<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<link rel="icon" type="image/png" href="index.php?extern=images/favicon.png" />
		<script type="text/javascript"';
		
                if(SYSTEM_TYPE == 'release') {
					$body .= '>'.$eyeosjs;
                } else {
                    $body .= ' src="index.php?extern=js/eyeos.js">';
                }

		$body .= '</script>
		<script type="text/javascript">
		'.file_get_contents('extern/js/qx.js').'
		</script>
		';
                
		if(SYSTEM_TYPE == 'release') {
			$body .= '<script>'.file_get_contents(SERVICE_MMAP_PATH . '/cache/basesystem.cache').'</script>';
		} else {
			foreach(self::$scripts as $script) {
				$body .= '<script type="text/javascript" src="eyeos/';
				$body .= $script;
				$body .= '"></script>'."\n";
			}
		}
		
		$body .= '<script src="eyeos/extern/js/tinymce/jscripts/tiny_mce/tiny_mce_gzip.js"></script>

		<script type="text/javascript">
			if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", eyeos.bootstrap, false);
			} else if (document.attachEvent) {
				document.attachEvent("onreadystatechange", function () {
					if (document.readyState == "complete") {
						eyeos.bootstrap();
					}
				});
			} else {
				window.onload = eyeos.bootstrap;
			}
		</script>
		<title>Welcome to eyeOS '. EYE_VERSION .'</title>
	</head>
	<body></body>
</html>';

		$response->setBody($body);
	}
}
?>