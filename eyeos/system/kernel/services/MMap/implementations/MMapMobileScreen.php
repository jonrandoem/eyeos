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
class MMapMobileScreen extends Kernel implements IMMap {
	private static $scripts = null;
	public static function getInstance() {
		return parent::getInstance(__CLASS__);
	}

	protected function __construct() {
		self::$scripts = array(
			// Independant base scripts
			EYE_ROOT . '/extern/js/eyeosmobile/eyeMobileApplication.js',
			// Modernizr, for catch the browser suport for new audio & video tag
			EYE_ROOT . '/extern/js/modernizr/modernizr.audio.video.load.js',
		);
	}

	public function checkRequest(MMapRequest $request) {
//		return true;
		return self::isMobileBrowser() && (!$request->issetGET('mobile'));
	}

	public function processRequest(MMapRequest $request, MMapResponse $response) {
	    ob_start("ob_gzhandler");

		define('EYEOS_MOBILE', true);
		// header
		$expires = 60*60*24*90;
		$response->getHeaders()->append("Pragma: public");
		$response->getHeaders()->append("Cache-Control: max-age=".$expires.", must-revalidate");
		$response->getHeaders()->append('Expires: ' . gmdate('D, d M Y H:i:s', time()+$expires) . ' GMT');

		$body = '
			<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
			<html>
			  <head>
				<title>eyeOS mobile version</title>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
				foreach (self::$scripts as $script) {
					$body .= '<script type="text/javascript" src="eyeos/';
					$body .= $script;
					$body .= '"></script>' . "\n";
				};
				$body .= '<!-- Load jquery -->
				<script src="index.php?extern=js/jquery/jquery-1.5.1.min.js"></script>

				<!-- Load json support -->
				<script src="index.php?extern=js/jquery/lib/json/jquery.json-2.2.min.js"></script>
				
				<!-- Load eyeosmobile-->
				<script type="text/javascript" src="index.php?extern=js/eyeosmobile/eyeosmobile.js"></script>

				<!-- When jquery.mobile starts, we can call init method -->
				<script>
					$(document).bind("mobileinit", function () {
						eyeosmobile.start();
					});
					$invisibleBlockClicks = $(\'<div id="invisibleBlockClicks" style="background: rgba(0, 0, 0, 0.6);position: absolute;top: 0px;left: 0px;min-width: 100%;display: none;"></div>\');
					$invisibleBlockClicks.bind(\'touchstart touchmove\', function(e) {
						e.preventDefault();
						e.stopPropagation();
						return false;
					});
				</script>

				<!-- Load jquery mobile library, for testing not minified code-->
				<!-- <link rel="stylesheet" href="eyeos/extern/js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.css" /> -->
				<!-- <script src="index.php?extern=js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.js"></script> -->
				
				<link rel="stylesheet" href="eyeos/extern/js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.min.css" />
				<script src="index.php?extern=js/jquery/lib/jquerymobile/jquery.mobile-1.0a3.min.js"></script>

				<link rel="icon" type="image/png" href="index.php?extern=images/favicon.png" />
				<link rel="apple-touch-icon" href="index.php?extern=images/touch-icon.png" />
			  </head>
			  <body>
				<div data-role="page" id="main">
					<div data-role="content"></div>
				</div>
			  </body>
			</html>';

		$response->setBody($body);
	}

	/**
	 * Script from http://detectmobilebrowser.com
	 * If detect a mobile version of a browser return true, otherwise false
	 * 
	 * @return <Boolean>
	 */
	protected function isMobileBrowser () {
		$useragent=$_SERVER['HTTP_USER_AGENT'];
		if(preg_match('/android|avantgo|blackberry|blazer|compal|elaine|fennec|folio|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i',substr($useragent,0,4))) {
			return true;
		}
		return false;
	}
}
?>