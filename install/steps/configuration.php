<?php

function toptext() {
    return 'Configure your eyeOS';
}

function getContent() {
    if(isset($_POST['mysqlhost'])) {
        $link = mysql_connect($_POST['mysqlhost'], $_POST['mysqluser'], $_POST['mysqlpass']);
        if(!$link) {
            echo '<p>Unable to connect to databse: '.mysql_error().'</p>';
            echo '<p><a href="index.php?step=configuration">Click here to go back</a></p>';
			return;
        }

        if(!mysql_select_db($_POST['mysqldb'], $link)) {
            echo '<p>Unable to select databse: '.mysql_error().'</p>';
            echo '<p><a href="index.php?step=configuration">Click here to go back</a></p>';
			return;
        }

        set_time_limit(0);
        $files = array(
            '../eyeos/extras/EyeosUMSQL/EyeosUMSQL.sql',
            '../eyeos/extras/EyeosTagsSQL/EyeosTags.sql',
            '../eyeos/extras/EyeosMetaSQL/EyeosMetaSQL.sql',
            '../eyeos/extras/EyeosPeopleSQL/EyeosPeopleSQL.sql',
            '../eyeos/extras/EyeosPeopleSQL/EyeosPeopleUpdateSQL.sql',
            '../eyeos/extras/PresenceSQL/Presence.sql',
            '../eyeos/extras/rMailApplicationSQL/rMailApplication.sql',
            '../eyeos/extras/CalendarSQL/Calendar.sql',
            '../eyeos/extras/GroupCalendarSQL/GroupCalendar.sql',
            '../eyeos/extras/EyeosEventsNotificationSQL/EyeosEventNotification.sql',
            '../eyeos/extras/LanguageAdminSQL/languageAdmin.sql',
            '../eyeos/extras/netSyncSQL/netSync.sql',
            '../eyeos/extras/UrlShareSQL/UrlShareSQL.sql'
        );

        foreach($files as $file) {
            $content = file_get_contents($file);
            $content = explode("\n", $content);
            $buffer = "";
            foreach($content as $line) {
                $line = str_replace("\r", "", $line);
                $line = trim($line);
                $buffer .= $line."\r\n";
                if(substr($line, -1, 1) == ';') {
                    mysql_query($buffer, $link);
                    //echo "executing: ".$buffer;
                    $buffer = "";
                } 
            }
        }

        $rootpass = sha1($_POST['eyerootpass'] . sha1($_POST['eyerootpass']));

	$sql = 'UPDATE eyeosuser set password = \''.$rootpass.'\' where id = \'eyeID_EyeosUser_root\'';

	mysql_query($sql, $link);

	$settingstext = getSettingsText($_POST['mysqlhost'], $_POST['mysqldb'], $_POST['mysqluser'], $_POST['mysqlpass']);

	file_put_contents('../settings.php', $settingstext);

	header('Location: index.php?step=end');
    } else {
        echo '<center><h2 class="bigtitle">eyeOS 2 configuration</h2></center>';
        ?>
<script>
function checkandsend() {
    if(document.getElementById('eyerootpass').value != "") {
        document.getElementById('forminfo').submit();
	document.getElementById('configcontent').innerHTML = '<center><p>Installing eyeOS...</p><img style="margin-top:40px" src="ajax-loader.gif" /></center>';
    } else {
        alert('eyeOS root password cannot be empty');
    }
}
</script>
<div id="configcontent">
    <center>Database configuration</center>
    <form id="forminfo" action="index.php?step=configuration" method="post">
    <table style="margin-top:20px;width:600px;">
        <tr>
            <td style="padding-right:10px;" align="right">MySQL Host:</td>
            <td><input name="mysqlhost" type="text" class="box" value="localhost" /></td>
        </tr>
        <tr>
            <td style="padding-right:10px;" align="right">MySQL Database:</td>
            <td><input name="mysqldb" type="text" class="box" value="eyeos" /></td>
        </tr>
        <tr>
            <td style="padding-right:10px;" align="right">MySQL Username:</td>
            <td><input name="mysqluser" type="text" class="box" value="" /></td>
        </tr>
        <tr>
            <td style="padding-right:10px;" align="right">MySQL Password:</td>
            <td><input name="mysqlpass" type="password" class="box" value="" /></td>
        </tr>
    </table>
    <br />
    <center>EyeOS configuration</center>
    <table style="margin-top:20px;width:600px;">
        <tr>
            <td style="padding-right:10px;" align="right">eyeOS root password:</td>
            <td><input id="eyerootpass" name="eyerootpass" type="text" class="box" value="" /></td>
        </tr>
    </table>
    <br />
    <p id="sendbtn"><center><a href="javascript:checkandsend();"><div><img src="next.png" border="0" /></div><div style="margin-top:20px;">Continue with the installation</div></a></center></p>
    </form>
</div>
<?php
    }
}

function getSettingsText($mysqlhost, $mysqldb, $mysqluser, $mysqlpass) {
    return "<?php
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
* version 3 along with this program in the file \"LICENSE\".  If not, see
* <http://www.gnu.org/licenses/agpl-3.0.txt>.
*
* See www.eyeos.org for more details. All requests should be sent to licensing@eyeos.org
*
* The interactive user interfaces in modified source and object code versions
* of this program must display Appropriate Legal Notices, as required under
* Section 5 of the GNU Affero General Public License version 3.
*
* In accordance with Section 7(b) of the GNU Affero General Public License version 3,
* these Appropriate Legal Notices must retain the display of the \"Powered by
* eyeos\" logo and retain the original copyright notice. If the display of the
* logo is not reasonably feasible for technical reasons, the Appropriate Legal Notices
* must display the words \"Powered by eyeos\" and retain the original copyright notice.
*/
define('REAL_EYE_ROOT', 'eyeos');
define('EYE_ROOT', '.');
define('EYE_VERSION', '2.5');

// DIRS

define('BOOT_DIR', 'bootstrap');
define('SYSTEM_DIR', 'system');
define('SYSTEM_CONF_DIR', 'conf');
define('SYSTEM_CONF_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR);
define('SYSTEM_SKEL_DIR', 'skel');
define('SYSTEM_SKEL_PATH', SYSTEM_CONF_PATH . '/' . SYSTEM_SKEL_DIR);
define('KERNEL_DIR', 'kernel');
define('SERVICES_DIR', 'services');
define('LIBRARIES_DIR', 'libs');
define('FRAMEWORKS_DIR', 'Frameworks');
define('IMPLEMENTATIONS_DIR', 'implementations');
define('EXTERN_DIR', 'extern');
define('APPS_DIR', 'apps');
define('USERS_DIR', 'users');
define('USERS_PATH', EYE_ROOT . '/' . USERS_DIR);
define('USERS_CONF_DIR', 'conf');
define('USERS_FILES_DIR', 'files');
define('USERS_METAFILES_DIR', 'metafiles');
define('USERS_SHARE_DIR', 'share');
define('USERS_META_DIR', 'meta');
define('USERS_META_SETTINGS_FILENAME', 'settings.xml');
define('WORKGROUPS_DIR', 'workgroups');
define('WORKGROUPS_PATH', EYE_ROOT . '/' . WORKGROUPS_DIR);
define('WORKGROUPS_CONF_DIR', 'conf');
define('WORKGROUPS_FILES_DIR', 'files');
define('WORKGROUPS_METAFILES_DIR', 'metafiles');
define('WORKGROUPS_META_DIR', 'meta');
define('WORKGROUPS_META_SETTINGS_FILENAME', 'settings.xml');

//LIBS
define('LIBRARIES_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . KERNEL_DIR . '/' . LIBRARIES_DIR);
define('LIB_ABSTRACTION_DIR', 'abstraction');
define('LIB_ABSTRACTION_PATH', LIBRARIES_PATH . '/' . LIB_ABSTRACTION_DIR);
define('LIB_EXCEPTIONS_DIR', 'exceptions');
define('LIB_EXCEPTIONS_PATH', LIBRARIES_PATH . '/' . LIB_EXCEPTIONS_DIR);
define('LIB_EXCEPTIONS_SUBCLASSES_DIR', 'subclasses');
define('LIB_EXCEPTIONS_SUBCLASSES_PATH', LIB_EXCEPTIONS_PATH . '/' . LIB_EXCEPTIONS_SUBCLASSES_DIR);
define('LIB_EXCEPTIONS_USE_REALPATH', false);
define('LIB_UTF8_DIR', 'utf8');
define('LIB_UTF8_PATH', LIBRARIES_PATH . '/' . LIB_UTF8_DIR);
define('LIB_IDGEN_DIR', 'idGen');
define('LIB_IDGEN_PATH', LIBRARIES_PATH . '/' . LIB_IDGEN_DIR);
define('LIB_IDGEN_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . LIBRARIES_DIR . '/' . LIB_IDGEN_DIR);
define('LIB_IDGEN_SEMAPHORE_KEY', 20090914);
define('LIB_LOG4PHP_DIR', 'log4php');
define('LIB_LOG4PHP_PATH', LIBRARIES_PATH . '/' . LIB_LOG4PHP_DIR);
define('LIB_LOG4PHP_CONFIGFILE_PATH', SYSTEM_CONF_PATH . '/' . LIBRARIES_DIR . '/' . LIB_LOG4PHP_DIR . '/configuration.xml');
define('LIB_STREAMS_DIR', 'streams');
define('LIB_STREAMS_PATH', LIBRARIES_PATH . '/' . LIB_STREAMS_DIR);
define('LIB_UTILS_DIR', 'utils');
define('LIB_UTILS_PATH', LIBRARIES_PATH . '/' . LIB_UTILS_DIR);
define('LIB_OFFICE_SCREEN', 1);
define('LIB_OFFICE_SEPARATOR_ARG', '\'');
define('LIB_OFFICE_COMMAND', 'soffice');
define('LIB_OFFICE_CONVERSION', 'uno');

//SERVICES
define('SERVICES_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . KERNEL_DIR . '/' . SERVICES_DIR);
define('SERVICE_FILESYSTEM_DIR', 'FileSystem');
define('SERVICE_FILESYSTEM_PATH', SERVICES_PATH . '/' . SERVICE_FILESYSTEM_DIR);
define('SERVICE_FILESYSTEM_LIBRARIES_DIR', 'libs');
define('SERVICE_FILESYSTEM_LIBRARIES_PATH', SERVICE_FILESYSTEM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_FILESYSTEM_LIBRARIES_DIR);
define('SERVICE_FILESYSTEM_CONFIGURATION_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR . '/' . SERVICES_DIR . '/' . SERVICE_FILESYSTEM_DIR);
define('SERVICE_FILESYSTEM_EYEOSABSTRACTVIRTUALFILE_USE_METADATA_CACHE', false);		//adds maybe too much complexity with synchronization, so it is commented in EyeosAbstractVirtualFile
define('SERVICE_META_DIR', 'Meta');
define('SERVICE_META_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR);
define('SERVICE_META_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_META_DIR);
define('SYSTEM_META_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/System/');
define('SERVICE_META_HANDLERS_DIR', 'Handlers');
define('SERVICE_META_HANDLERS_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_META_HANDLERS_DIR);
define('SERVICE_MMAP_DIR', 'MMap');
define('SERVICE_MMAP_PATH', SERVICES_PATH . '/' . SERVICE_MMAP_DIR);
define('SERVICE_SECURITY_DIR', 'Security');


//METADATA MANAGER
define('SERVICE_META_CONFIGURATION_FILE_EXTENSION', '.xml');
define('SERVICE_META_PROVIDERS_DIR', 'Providers');
define('SERVICE_META_PROVIDERS_PATH', SERVICE_META_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_META_PROVIDERS_DIR);
// METADATA CONVERTER
define('SERVICE_META_CONVERTER_DIR', 'MetaDataConverter');
define('SERVICE_META_CONVERTER_HANDLERS_DIR', SERVICE_META_CONVERTER_DIR . '/Handlers');
define('SERVICE_META_CONVERTER_HANDLERS_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_META_CONVERTER_HANDLERS_DIR);
define('SERVICE_META_CONVERTER_FAILOVER_HANDLER', 'MetaDataConverterFailOverHandler');

define('SERVICE_SECURITY_PATH', SERVICES_PATH . '/' . SERVICE_SECURITY_DIR);
define('SERVICE_SECURITY_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_SECURITY_DIR);
define('SERVICE_SECURITY_POLICYCONFIGURATIONS_DIR', 'PolicyConfigurations');
define('SERVICE_SECURITY_POLICYCONFIGURATIONS_PATH', SERVICE_SECURITY_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_SECURITY_POLICYCONFIGURATIONS_DIR);
define('SERVICE_SECURITY_POLICYCONFIGURATIONS_DEFAULTCONF_PATH', SERVICE_SECURITY_CONFIGURATION_PATH . '/SecurityManager.xml');
define('SERVICE_SHARING_DIR', 'Sharing');
define('SERVICE_SHARING_PATH', SERVICES_PATH . '/' . SERVICE_SHARING_DIR);
define('SERVICE_SHARING_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_SHARING_DIR);
define('SERVICE_SHARING_MANAGERCLASSNAME', 'EyeosSharingManager');
define('SERVICE_STORAGE_DIR', 'Storage');
define('SERVICE_STORAGE_PATH', SERVICES_PATH . '/' . SERVICE_STORAGE_DIR);
define('SERVICE_UM_DIR', 'UM');
define('SERVICE_UM_PATH', SERVICES_PATH . '/' . SERVICE_UM_DIR);
define('SERVICE_UM_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_UM_DIR);
define('SERVICE_UM_AUTHCONFIGURATIONS_DIR', 'AuthConfigurations');
define('SERVICE_UM_AUTHCONFIGURATIONS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_AUTHCONFIGURATIONS_DIR);
define('SERVICE_UM_AUTHCONFIGURATION_CONF_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_UM_DIR . '/' . SERVICE_UM_AUTHCONFIGURATIONS_DIR);
define('SERVICE_UM_AUTHCONFIGURATION_DEFAULTCONF_PATH', SERVICE_UM_AUTHCONFIGURATION_CONF_PATH . '/eyeos_default.xml');
define('SERVICE_UM_CREDENTIALS_DIR', 'Credentials');
define('SERVICE_UM_CREDENTIALS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_CREDENTIALS_DIR);
define('SERVICE_UM_LOGINMODULES_DIR', 'LoginModules');
define('SERVICE_UM_LOGINMODULES_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_LOGINMODULES_DIR);
define('SERVICE_UM_PRINCIPALS_DIR', 'Principals');
define('SERVICE_UM_PRINCIPALS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_PRINCIPALS_DIR);
define('SERVICE_UM_PRINCIPALSMANAGERS_DIR', 'PrincipalsManagers');
define('SERVICE_UM_PRINCIPALSMANAGERS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_PRINCIPALSMANAGERS_DIR);

//FRAMEWORKS
define('FRAMEWORKS_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . FRAMEWORKS_DIR);
define('FRAMEWORK_APPLICATIONS_DIR','Applications');
define('FRAMEWORK_APPLICATIONS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_APPLICATIONS_DIR);
define('FRAMEWORK_LISTENERS_DIR','Listeners');
define('FRAMEWORK_LISTENERS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_LISTENERS_DIR);
define('FRAMEWORK_SEARCH_DIR', 'Search');
define('FRAMEWORK_SEARCH_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_SEARCH_DIR);
define('FRAMEWORK_PEOPLE_DIR', 'People');
define('FRAMEWORK_PEOPLE_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_PEOPLE_DIR);
define('FRAMEWORK_CALENDAR_DIR', 'Calendar');
define('FRAMEWORK_CALENDAR_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_CALENDAR_DIR);
define('FRAMEWORK_CALENDAR_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . FRAMEWORKS_DIR . '/' . FRAMEWORK_CALENDAR_DIR);
define('FRAMEWORK_EVENTS_DIR', 'Events');
define('FRAMEWORK_EVENTS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_EVENTS_DIR);
define('FRAMEWORK_PRESENCE_DIR', 'Presence');
define('FRAMEWORK_PRESENCE_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_PRESENCE_DIR);
define('FRAMEWORK_TAGS_DIR', 'Tags');
define('FRAMEWORK_TAGS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_TAGS_DIR);
define('FRAMEWORK_TAGS_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . FRAMEWORKS_DIR . '/' . FRAMEWORK_TAGS_DIR);
define('FRAMEWORK_NETSYNC_DIR', 'NetSync');
define('FRAMEWORK_NETSYNC_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_NETSYNC_DIR);
define('FRAMEWORK_URLSHARE_DIR', 'UrlShare');
define('FRAMEWORK_URLSHARE_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_URLSHARE_DIR);


// MEMORY
define('DEFAULT_MEMORYMANAGER', 'MemorySession');

// UM
/**
 * Available UM Principals Managers:
 * LDAP: LDAPPrincipalsManager
 * eyeOSDB : EyeosSQLPrincipalsManager
 */
define('SERVICE_UM_PRINCIPALSMANAGER', 'EyeosSQLPrincipalsManager');
define('SERVICE_UM_USER_CLASSNAME', 'EyeosUser');
define('SERVICE_UM_GROUP_CLASSNAME', 'EyeosGroup');
define('SERVICE_UM_WORKGROUP_CLASSNAME', 'EyeosWorkgroup');
define('SERVICE_UM_USERWORKGROUPASSIGNATION_CLASSNAME', 'EyeosUserWorkgroupAssignation');
define('SERVICE_UM_DEFAULTUSERSGROUP', 'users');

// LDAP
define('LDAP_HOSTNAME', 'localhost');
define('LDAP_PORT', 389);
define('LDAP_BIND_RDN', null);
define('LDAP_BIND_PASSWORD', null);
define('LDAP_BASE_DN', 'ou=eyeosuser,dc=eyeos,dc=org');
define('LDAP_OPT_PROTOCOL_VERSION_VALUE', 3);
define('LDAP_UID_ATTRIBUTE_NAME', 'uid');

// DATA
define('DEFAULT_DATAMANAGER', 'DataJSON');

// COOKIE
define('COOKIE_NAME', 'eyeos');
define('FLASHFIX', 'flashfix');

// STORAGE
define('SQL_DAOHANDLER', 'SQL/EyeosDAO');
define('SQL_HOST', '".$mysqlhost."');
define('SQL_CONNECTIONSTRING', 'mysql:dbname=".$mysqldb.";host='.SQL_HOST);
define('SQL_USERNAME', '".$mysqluser."');
define('SQL_PASSWORD', '".$mysqlpass."');
// NETSYNC 
define('SQL_NETSYNC_DBNAME', '".$mysqldb."');


    
//APPLICATIONS
define('APPLICATIONS_INFORMATION_PROVIDER','ApplicationsInformationProviderXml');

/*
//ACTIVEMQ URL
define('ACTIVEMQ_DESTINATION_URL', 'ws://".$_SERVER['HTTP_HOST'].":8001/activemq');
define('ACTIVEMQ_CHANNEL_PREFIX', '/topic/');
define('STOMP_PROXY_URL', 'tcp://127.0.0.1:61613');
*/

//DIRECTORY TO BE USED AS TEMPORAL
define('SYSTEM_TEMP_DIR', '/tmp');

//QOOXDOO BUILD
define('QOOXDOO_BUILD_FILENAME_JS', 'qx.js');
define('QOOXDOO_BUILD_FILENAME_GZIP', 'qx.js.gz');

define('MAIL_FROM', 'noreply@".'$_SERVER["SERVER_NAME"]'."');
define('MAIL_HOST', 'localhost');
define('MAIL_PORT', 25);

//URLSHARE SETTINGS
define('URLSHARE_MAILFROM', MAIL_FROM);
define('URLSHARE_SUBJECT', 'New share incoming');
define('URLSHARE_MAIL', '
			<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">
			<html xmlns=\"http://www.w3.org/1999/xhtml\">
			<head>
			<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />
			<title>eyeOS: File shared</title>
			</head>

			<body>
			<p>Dear user,</p>
			<p>a new file was shared with you</p>
			<p>You can download <strong>%%FILENAME%%</strong> using this url:</p>
			<table width=\"434\" border=\"0\">
			  <tr>
				<td width=\"109\" bgcolor=\"#999999\"><strong>URL:</strong></td>
				<td width=\"212\" bgcolor=\"#CCCCCC\"><a href=\"%%URLSTRING%%\">%%FILENAME%%</a></td>
			  </tr>
			  <tr><td bgcolor=\"#999999\"><strong>Password:</strong></td><td bgcolor=\"#CCCCCC\">%%PASSWORD%%</td></tr>
			  <tr><td bgcolor=\"#999999\"><strong>Valid until:</strong></td><td bgcolor=\"#CCCCCC\">%%TIMELIMIT%%</td></tr>
			</table>
			<p>Thanks<br />
			  <em><br />
			  </em>eyeOS<em><br /></p>
			</body>
			</html>');

define('REMEMBER_PASSWORD_SUBJECT', 'Password reset from eyeOS');
define('REMEMBER_PASSWORD_TEXT', 'The password for your user <b>%s</b> has been reset to <b>%s</b>.');
define('REMEMBER_PASSWORD_DISCLAIMER', '<br><br>You can use this new password to access your account.');
define('REMEMBER_PASSWORD_FROM', MAIL_FROM);
define('REMEMBER_PASSWORD_ENABLED', true);

//RELEASE OR DEBUG
define('SYSTEM_TYPE', 'release');

?>";
}
?>