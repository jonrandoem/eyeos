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
if(!defined('REAL_EYE_ROOT')) 
	define('REAL_EYE_ROOT', 'eyeos');
if(!defined('EYE_ROOT')) 
	define('EYE_ROOT', '.');
if(!defined('EYE_VERSION')) 
	define('EYE_VERSION', '2.4');

// DIRS

if(!defined('BOOT_DIR')) 
	define('BOOT_DIR', 'bootstrap');
if(!defined('SYSTEM_DIR')) 
	define('SYSTEM_DIR', 'system');
if(!defined('SYSTEM_CONF_DIR')) 
	define('SYSTEM_CONF_DIR', 'conf');
if(!defined('SYSTEM_CONF_PATH')) 
	define('SYSTEM_CONF_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR);
if(!defined('SYSTEM_SKEL_DIR')) 
	define('SYSTEM_SKEL_DIR', 'skel');
if(!defined('SYSTEM_SKEL_PATH')) 
	define('SYSTEM_SKEL_PATH', SYSTEM_CONF_PATH . '/' . SYSTEM_SKEL_DIR);
if(!defined('KERNEL_DIR')) 
	define('KERNEL_DIR', 'kernel');
if(!defined('SERVICES_DIR')) 
	define('SERVICES_DIR', 'services');
if(!defined('LIBRARIES_DIR')) 
	define('LIBRARIES_DIR', 'libs');
if(!defined('FRAMEWORKS_DIR')) 
	define('FRAMEWORKS_DIR', 'Frameworks');
if(!defined('IMPLEMENTATIONS_DIR')) 
	define('IMPLEMENTATIONS_DIR', 'implementations');
if(!defined('EXTERN_DIR')) 
	define('EXTERN_DIR', 'extern');
if(!defined('APPS_DIR')) 
	define('APPS_DIR', 'apps');
if(!defined('USERS_DIR')) 
	define('USERS_DIR', 'users');
if(!defined('USERS_PATH')) 
	define('USERS_PATH', EYE_ROOT . '/' . USERS_DIR);
if(!defined('USERS_CONF_DIR')) 
	define('USERS_CONF_DIR', 'conf');
if(!defined('USERS_FILES_DIR')) 
	define('USERS_FILES_DIR', 'files');
if(!defined('USERS_METAFILES_DIR')) 
	define('USERS_METAFILES_DIR', 'metafiles');
if(!defined('USERS_SHARE_DIR')) 
	define('USERS_SHARE_DIR', 'share');
if(!defined('USERS_META_DIR')) 
	define('USERS_META_DIR', 'meta');
if(!defined('USERS_META_SETTINGS_FILENAME')) 
	define('USERS_META_SETTINGS_FILENAME', 'settings.xml');
if(!defined('WORKGROUPS_DIR')) 
	define('WORKGROUPS_DIR', 'workgroups');
if(!defined('WORKGROUPS_PATH')) 
	define('WORKGROUPS_PATH', EYE_ROOT . '/' . WORKGROUPS_DIR);
if(!defined('WORKGROUPS_CONF_DIR')) 
	define('WORKGROUPS_CONF_DIR', 'conf');
if(!defined('WORKGROUPS_FILES_DIR')) 
	define('WORKGROUPS_FILES_DIR', 'files');
if(!defined('WORKGROUPS_METAFILES_DIR')) 
	define('WORKGROUPS_METAFILES_DIR', 'metafiles');
if(!defined('WORKGROUPS_META_DIR')) 
	define('WORKGROUPS_META_DIR', 'meta');
if(!defined('WORKGROUPS_META_SETTINGS_FILENAME')) 
	define('WORKGROUPS_META_SETTINGS_FILENAME', 'settings.xml');

//LIBS
if(!defined('LIBRARIES_PATH')) 
	define('LIBRARIES_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . KERNEL_DIR . '/' . LIBRARIES_DIR);
if(!defined('LIB_ABSTRACTION_DIR')) 
	define('LIB_ABSTRACTION_DIR', 'abstraction');
if(!defined('LIB_ABSTRACTION_PATH')) 
	define('LIB_ABSTRACTION_PATH', LIBRARIES_PATH . '/' . LIB_ABSTRACTION_DIR);
if(!defined('LIB_EXCEPTIONS_DIR')) 
	define('LIB_EXCEPTIONS_DIR', 'exceptions');
if(!defined('LIB_EXCEPTIONS_PATH')) 
	define('LIB_EXCEPTIONS_PATH', LIBRARIES_PATH . '/' . LIB_EXCEPTIONS_DIR);
if(!defined('LIB_EXCEPTIONS_SUBCLASSES_DIR')) 
	define('LIB_EXCEPTIONS_SUBCLASSES_DIR', 'subclasses');
if(!defined('LIB_EXCEPTIONS_SUBCLASSES_PATH')) 
	define('LIB_EXCEPTIONS_SUBCLASSES_PATH', LIB_EXCEPTIONS_PATH . '/' . LIB_EXCEPTIONS_SUBCLASSES_DIR);
if(!defined('LIB_EXCEPTIONS_USE_REALPATH')) 
	define('LIB_EXCEPTIONS_USE_REALPATH', false);
if(!defined('LIB_UTF8_DIR')) 
	define('LIB_UTF8_DIR', 'utf8');
if(!defined('LIB_UTF8_PATH')) 
	define('LIB_UTF8_PATH', LIBRARIES_PATH . '/' . LIB_UTF8_DIR);
if(!defined('LIB_IDGEN_DIR')) 
	define('LIB_IDGEN_DIR', 'idGen');
if(!defined('LIB_IDGEN_PATH')) 
	define('LIB_IDGEN_PATH', LIBRARIES_PATH . '/' . LIB_IDGEN_DIR);
if(!defined('LIB_IDGEN_CONFIGURATION_PATH')) 
	define('LIB_IDGEN_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . LIBRARIES_DIR . '/' . LIB_IDGEN_DIR);
if(!defined('LIB_IDGEN_SEMAPHORE_KEY')) 
	define('LIB_IDGEN_SEMAPHORE_KEY', 20090914);
if(!defined('LIB_LOG4PHP_DIR')) 
	define('LIB_LOG4PHP_DIR', 'log4php');
if(!defined('LIB_LOG4PHP_PATH')) 
	define('LIB_LOG4PHP_PATH', LIBRARIES_PATH . '/' . LIB_LOG4PHP_DIR);
if(!defined('LIB_LOG4PHP_CONFIGFILE_PATH')) 
	define('LIB_LOG4PHP_CONFIGFILE_PATH', SYSTEM_CONF_PATH . '/' . LIBRARIES_DIR . '/' . LIB_LOG4PHP_DIR . '/configuration.xml');
if(!defined('LIB_STREAMS_DIR')) 
	define('LIB_STREAMS_DIR', 'streams');
if(!defined('LIB_STREAMS_PATH')) 
	define('LIB_STREAMS_PATH', LIBRARIES_PATH . '/' . LIB_STREAMS_DIR);
if(!defined('LIB_UTILS_DIR')) 
	define('LIB_UTILS_DIR', 'utils');
if(!defined('LIB_UTILS_PATH')) 
	define('LIB_UTILS_PATH', LIBRARIES_PATH . '/' . LIB_UTILS_DIR);
if(!defined('LIB_OFFICE_SCREEN')) 
	define('LIB_OFFICE_SCREEN', 1);
if(!defined('LIB_OFFICE_SEPARATOR_ARG')) 
	define('LIB_OFFICE_SEPARATOR_ARG', '\'');
if(!defined('LIB_OFFICE_COMMAND')) 
	define('LIB_OFFICE_COMMAND', 'soffice');
if(!defined('LIB_OFFICE_CONVERSION')) 
	define('LIB_OFFICE_CONVERSION', 'uno');

//SERVICES
if(!defined('SERVICES_PATH')) 
	define('SERVICES_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . KERNEL_DIR . '/' . SERVICES_DIR);
if(!defined('SERVICE_FILESYSTEM_DIR')) 
	define('SERVICE_FILESYSTEM_DIR', 'FileSystem');
if(!defined('SERVICE_FILESYSTEM_PATH')) 
	define('SERVICE_FILESYSTEM_PATH', SERVICES_PATH . '/' . SERVICE_FILESYSTEM_DIR);
if(!defined('SERVICE_FILESYSTEM_LIBRARIES_DIR')) 
	define('SERVICE_FILESYSTEM_LIBRARIES_DIR', 'libs');
if(!defined('SERVICE_FILESYSTEM_LIBRARIES_PATH')) 
	define('SERVICE_FILESYSTEM_LIBRARIES_PATH', SERVICE_FILESYSTEM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_FILESYSTEM_LIBRARIES_DIR);
if(!defined('SERVICE_FILESYSTEM_CONFIGURATION_PATH')) 
	define('SERVICE_FILESYSTEM_CONFIGURATION_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR . '/' . SERVICES_DIR . '/' . SERVICE_FILESYSTEM_DIR);
if(!defined('SERVICE_FILESYSTEM_EYEOSABSTRACTVIRTUALFILE_USE_METADATA_CACHE')) 
	define('SERVICE_FILESYSTEM_EYEOSABSTRACTVIRTUALFILE_USE_METADATA_CACHE', false);		//adds maybe too much complexity with synchronization, so it is commented in EyeosAbstractVirtualFile
if(!defined('SERVICE_META_DIR')) 
	define('SERVICE_META_DIR', 'Meta');
if(!defined('SERVICE_META_PATH')) 
	define('SERVICE_META_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR);
if(!defined('SERVICE_META_CONFIGURATION_PATH')) 
	define('SERVICE_META_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_META_DIR);
if(!defined('SYSTEM_META_CONFIGURATION_PATH')) 
	define('SYSTEM_META_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/System/');
if(!defined('SERVICE_META_HANDLERS_DIR')) 
	define('SERVICE_META_HANDLERS_DIR', 'Handlers');
if(!defined('SERVICE_META_HANDLERS_PATH')) 
	define('SERVICE_META_HANDLERS_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_META_HANDLERS_DIR);
if(!defined('SERVICE_MMAP_DIR')) 
	define('SERVICE_MMAP_DIR', 'MMap');
if(!defined('SERVICE_MMAP_PATH')) 
	define('SERVICE_MMAP_PATH', SERVICES_PATH . '/' . SERVICE_MMAP_DIR);
if(!defined('SERVICE_SECURITY_DIR')) 
	define('SERVICE_SECURITY_DIR', 'Security');


//METADATA MANAGER
if(!defined('SERVICE_META_CONFIGURATION_FILE_EXTENSION')) 
	define('SERVICE_META_CONFIGURATION_FILE_EXTENSION', '.xml');
if(!defined('SERVICE_META_PROVIDERS_DIR')) 
	define('SERVICE_META_PROVIDERS_DIR', 'Providers');
if(!defined('SERVICE_META_PROVIDERS_PATH')) 
	define('SERVICE_META_PROVIDERS_PATH', SERVICE_META_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_META_PROVIDERS_DIR);
// METADATA CONVERTER
if(!defined('SERVICE_META_CONVERTER_DIR')) 
	define('SERVICE_META_CONVERTER_DIR', 'MetaDataConverter');
if(!defined('SERVICE_META_CONVERTER_HANDLERS_DIR')) 
	define('SERVICE_META_CONVERTER_HANDLERS_DIR', SERVICE_META_CONVERTER_DIR . '/Handlers');
if(!defined('SERVICE_META_CONVERTER_HANDLERS_PATH')) 
	define('SERVICE_META_CONVERTER_HANDLERS_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_META_CONVERTER_HANDLERS_DIR);
if(!defined('SERVICE_META_CONVERTER_FAILOVER_HANDLER')) 
	define('SERVICE_META_CONVERTER_FAILOVER_HANDLER', 'MetaDataConverterFailOverHandler');

if(!defined('SERVICE_SECURITY_PATH')) 
	define('SERVICE_SECURITY_PATH', SERVICES_PATH . '/' . SERVICE_SECURITY_DIR);
if(!defined('SERVICE_SECURITY_CONFIGURATION_PATH')) 
	define('SERVICE_SECURITY_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_SECURITY_DIR);
if(!defined('SERVICE_SECURITY_POLICYCONFIGURATIONS_DIR')) 
	define('SERVICE_SECURITY_POLICYCONFIGURATIONS_DIR', 'PolicyConfigurations');
if(!defined('SERVICE_SECURITY_POLICYCONFIGURATIONS_PATH')) 
	define('SERVICE_SECURITY_POLICYCONFIGURATIONS_PATH', SERVICE_SECURITY_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_SECURITY_POLICYCONFIGURATIONS_DIR);
if(!defined('SERVICE_SECURITY_POLICYCONFIGURATIONS_DEFAULTCONF_PATH')) 
	define('SERVICE_SECURITY_POLICYCONFIGURATIONS_DEFAULTCONF_PATH', SERVICE_SECURITY_CONFIGURATION_PATH . '/SecurityManager.xml');
if(!defined('SERVICE_SHARING_DIR')) 
	define('SERVICE_SHARING_DIR', 'Sharing');
if(!defined('SERVICE_SHARING_PATH')) 
	define('SERVICE_SHARING_PATH', SERVICES_PATH . '/' . SERVICE_SHARING_DIR);
if(!defined('SERVICE_SHARING_CONFIGURATION_PATH')) 
	define('SERVICE_SHARING_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_SHARING_DIR);
if(!defined('SERVICE_SHARING_MANAGERCLASSNAME')) 
	define('SERVICE_SHARING_MANAGERCLASSNAME', 'EyeosSharingManager');
if(!defined('SERVICE_STORAGE_DIR')) 
	define('SERVICE_STORAGE_DIR', 'Storage');
if(!defined('SERVICE_STORAGE_PATH')) 
	define('SERVICE_STORAGE_PATH', SERVICES_PATH . '/' . SERVICE_STORAGE_DIR);
if(!defined('SERVICE_UM_DIR')) 
	define('SERVICE_UM_DIR', 'UM');
if(!defined('SERVICE_UM_PATH')) 
	define('SERVICE_UM_PATH', SERVICES_PATH . '/' . SERVICE_UM_DIR);
if(!defined('SERVICE_UM_CONFIGURATION_PATH')) 
	define('SERVICE_UM_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_UM_DIR);
if(!defined('SERVICE_UM_AUTHCONFIGURATIONS_DIR')) 
	define('SERVICE_UM_AUTHCONFIGURATIONS_DIR', 'AuthConfigurations');
if(!defined('SERVICE_UM_AUTHCONFIGURATIONS_PATH')) 
	define('SERVICE_UM_AUTHCONFIGURATIONS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_AUTHCONFIGURATIONS_DIR);
if(!defined('SERVICE_UM_AUTHCONFIGURATION_CONF_PATH')) 
	define('SERVICE_UM_AUTHCONFIGURATION_CONF_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_UM_DIR . '/' . SERVICE_UM_AUTHCONFIGURATIONS_DIR);
if(!defined('SERVICE_UM_AUTHCONFIGURATION_DEFAULTCONF_PATH')) 
	define('SERVICE_UM_AUTHCONFIGURATION_DEFAULTCONF_PATH', SERVICE_UM_AUTHCONFIGURATION_CONF_PATH . '/eyeos_default.xml');
if(!defined('SERVICE_UM_CREDENTIALS_DIR')) 
	define('SERVICE_UM_CREDENTIALS_DIR', 'Credentials');
if(!defined('SERVICE_UM_CREDENTIALS_PATH')) 
	define('SERVICE_UM_CREDENTIALS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_CREDENTIALS_DIR);
if(!defined('SERVICE_UM_LOGINMODULES_DIR')) 
	define('SERVICE_UM_LOGINMODULES_DIR', 'LoginModules');
if(!defined('SERVICE_UM_LOGINMODULES_PATH')) 
	define('SERVICE_UM_LOGINMODULES_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_LOGINMODULES_DIR);
if(!defined('SERVICE_UM_PRINCIPALS_DIR')) 
	define('SERVICE_UM_PRINCIPALS_DIR', 'Principals');
if(!defined('SERVICE_UM_PRINCIPALS_PATH')) 
	define('SERVICE_UM_PRINCIPALS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_PRINCIPALS_DIR);
if(!defined('SERVICE_UM_PRINCIPALSMANAGERS_DIR')) 
	define('SERVICE_UM_PRINCIPALSMANAGERS_DIR', 'PrincipalsManagers');
if(!defined('SERVICE_UM_PRINCIPALSMANAGERS_PATH')) 
	define('SERVICE_UM_PRINCIPALSMANAGERS_PATH', SERVICE_UM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' .SERVICE_UM_PRINCIPALSMANAGERS_DIR);

//FRAMEWORKS
if(!defined('FRAMEWORKS_PATH')) 
	define('FRAMEWORKS_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . FRAMEWORKS_DIR);
if(!defined('FRAMEWORK_APPLICATIONS_DIR')) 
	define('FRAMEWORK_APPLICATIONS_DIR','Applications');
if(!defined('FRAMEWORK_APPLICATIONS_PATH')) 
	define('FRAMEWORK_APPLICATIONS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_APPLICATIONS_DIR);
if(!defined('FRAMEWORK_LISTENERS_DIR')) 
	define('FRAMEWORK_LISTENERS_DIR','Listeners');
if(!defined('FRAMEWORK_LISTENERS_PATH')) 
	define('FRAMEWORK_LISTENERS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_LISTENERS_DIR);
if(!defined('FRAMEWORK_SEARCH_DIR')) 
	define('FRAMEWORK_SEARCH_DIR', 'Search');
if(!defined('FRAMEWORK_SEARCH_PATH')) 
	define('FRAMEWORK_SEARCH_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_SEARCH_DIR);
if(!defined('FRAMEWORK_PEOPLE_DIR')) 
	define('FRAMEWORK_PEOPLE_DIR', 'People');
if(!defined('FRAMEWORK_PEOPLE_PATH')) 
	define('FRAMEWORK_PEOPLE_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_PEOPLE_DIR);
if(!defined('FRAMEWORK_CALENDAR_DIR')) 
	define('FRAMEWORK_CALENDAR_DIR', 'Calendar');
if(!defined('FRAMEWORK_CALENDAR_PATH')) 
	define('FRAMEWORK_CALENDAR_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_CALENDAR_DIR);
if(!defined('FRAMEWORK_CALENDAR_CONFIGURATION_PATH')) 
	define('FRAMEWORK_CALENDAR_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . FRAMEWORKS_DIR . '/' . FRAMEWORK_CALENDAR_DIR);
if(!defined('FRAMEWORK_EVENTS_DIR')) 
	define('FRAMEWORK_EVENTS_DIR', 'Events');
if(!defined('FRAMEWORK_EVENTS_PATH')) 
	define('FRAMEWORK_EVENTS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_EVENTS_DIR);
if(!defined('FRAMEWORK_PRESENCE_DIR')) 
	define('FRAMEWORK_PRESENCE_DIR', 'Presence');
if(!defined('FRAMEWORK_PRESENCE_PATH')) 
	define('FRAMEWORK_PRESENCE_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_PRESENCE_DIR);
if(!defined('FRAMEWORK_TAGS_DIR')) 
	define('FRAMEWORK_TAGS_DIR', 'Tags');
if(!defined('FRAMEWORK_TAGS_PATH')) 
	define('FRAMEWORK_TAGS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_TAGS_DIR);
if(!defined('FRAMEWORK_TAGS_CONFIGURATION_PATH')) 
	define('FRAMEWORK_TAGS_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . FRAMEWORKS_DIR . '/' . FRAMEWORK_TAGS_DIR);
if(!defined('FRAMEWORK_NETSYNC_DIR')) 
	define('FRAMEWORK_NETSYNC_DIR', 'NetSync');
if(!defined('FRAMEWORK_NETSYNC_PATH')) 
	define('FRAMEWORK_NETSYNC_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_NETSYNC_DIR);
if(!defined('FRAMEWORK_URLSHARE_DIR')) 
	define('FRAMEWORK_URLSHARE_DIR', 'UrlShare');
if(!defined('FRAMEWORK_URLSHARE_PATH')) 
	define('FRAMEWORK_URLSHARE_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_URLSHARE_DIR);


// MEMORY
if(!defined('DEFAULT_MEMORYMANAGER')) 
	define('DEFAULT_MEMORYMANAGER', 'MemorySession');

// UM
/**
 * Available UM Principals Managers:
 * LDAP: LDAPPrincipalsManager
 * eyeOSDB : EyeosSQLPrincipalsManager
 */
if(!defined('SERVICE_UM_PRINCIPALSMANAGER')) 
	define('SERVICE_UM_PRINCIPALSMANAGER', 'EyeosSQLPrincipalsManager');
if(!defined('SERVICE_UM_USER_CLASSNAME')) 
	define('SERVICE_UM_USER_CLASSNAME', 'EyeosUser');
if(!defined('SERVICE_UM_GROUP_CLASSNAME')) 
	define('SERVICE_UM_GROUP_CLASSNAME', 'EyeosGroup');
if(!defined('SERVICE_UM_WORKGROUP_CLASSNAME')) 
	define('SERVICE_UM_WORKGROUP_CLASSNAME', 'EyeosWorkgroup');
if(!defined('SERVICE_UM_USERWORKGROUPASSIGNATION_CLASSNAME')) 
	define('SERVICE_UM_USERWORKGROUPASSIGNATION_CLASSNAME', 'EyeosUserWorkgroupAssignation');
if(!defined('SERVICE_UM_DEFAULTUSERSGROUP')) 
	define('SERVICE_UM_DEFAULTUSERSGROUP', 'users');

// LDAP
if(!defined('LDAP_HOSTNAME')) 
	define('LDAP_HOSTNAME', 'localhost');
if(!defined('LDAP_PORT')) 
	define('LDAP_PORT', 389);
if(!defined('LDAP_BIND_RDN')) 
	define('LDAP_BIND_RDN', null);
if(!defined('LDAP_BIND_PASSWORD')) 
	define('LDAP_BIND_PASSWORD', null);
if(!defined('LDAP_BASE_DN')) 
	define('LDAP_BASE_DN', 'ou=eyeosuser,dc=eyeos,dc=org');
if(!defined('LDAP_OPT_PROTOCOL_VERSION_VALUE')) 
	define('LDAP_OPT_PROTOCOL_VERSION_VALUE', 3);
if(!defined('LDAP_UID_ATTRIBUTE_NAME')) 
	define('LDAP_UID_ATTRIBUTE_NAME', 'uid');

// DATA
if(!defined('DEFAULT_DATAMANAGER')) 
	define('DEFAULT_DATAMANAGER', 'DataJSON');

// COOKIE
if(!defined('COOKIE_NAME')) 
	define('COOKIE_NAME', 'eyeos');
if(!defined('FLASHFIX')) 
	define('FLASHFIX', 'flashfix');

// STORAGE
if(!defined('SQL_DAOHANDLER')) 
	define('SQL_DAOHANDLER', 'SQL/EyeosDAO');
if(!defined('SQL_HOST')) 
	define('SQL_HOST', 'localhost');
if(!defined('SQL_CONNECTIONSTRING')) 
	define('SQL_CONNECTIONSTRING', 'mysql:dbname=eyeos;host='.SQL_HOST);
if(!defined('SQL_USERNAME')) 
	define('SQL_USERNAME', 'root');
if(!defined('SQL_PASSWORD')) 
	define('SQL_PASSWORD', 'root');
// NETSYNC 
if(!defined('SQL_NETSYNC_DBNAME')) 
	define('SQL_NETSYNC_DBNAME', 'eyeos');


    
//APPLICATIONS
if(!defined('APPLICATIONS_INFORMATION_PROVIDER')) 
	define('APPLICATIONS_INFORMATION_PROVIDER','ApplicationsInformationProviderXml');

/*
//ACTIVEMQ URL
if(!defined('ACTIVEMQ_DESTINATION_URL')) 
	define('ACTIVEMQ_DESTINATION_URL', 'ws://127.0.0.1:8001/activemq');
if(!defined('ACTIVEMQ_CHANNEL_PREFIX')) 
	define('ACTIVEMQ_CHANNEL_PREFIX', '/topic/');
if(!defined('STOMP_PROXY_URL')) 
	define('STOMP_PROXY_URL', 'tcp://127.0.0.1:61613');
*/

//DIRECTORY TO BE USED AS TEMPORAL
if(!defined('SYSTEM_TEMP_DIR')) 
	define('SYSTEM_TEMP_DIR', '/tmp');

//QOOXDOO BUILD
if(!defined('QOOXDOO_BUILD_FILENAME_JS')) 
	define('QOOXDOO_BUILD_FILENAME_JS', 'qx.js');
if(!defined('QOOXDOO_BUILD_FILENAME_GZIP')) 
	define('QOOXDOO_BUILD_FILENAME_GZIP', 'qx.js.gz');

if(!defined('MAIL_FROM')) 
	define('MAIL_FROM', 'noreply@$_SERVER["SERVER_NAME"]');
if(!defined('MAIL_HOST')) 
	define('MAIL_HOST', 'localhost');
if(!defined('MAIL_PORT')) 
	define('MAIL_PORT', 25);

//URLSHARE SETTINGS
if(!defined('URLSHARE_MAILFROM')) 
	define('URLSHARE_MAILFROM', MAIL_FROM);
if(!defined('URLSHARE_SUBJECT')) 
	define('URLSHARE_SUBJECT', 'New share incoming');
if(!defined('URLSHARE_MAIL')) 
	define('URLSHARE_MAIL', '
			<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
			<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
			<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
			<title>eyeOS: File shared</title>
			</head>

			<body>
			<p>Dear user,</p>
			<p>a new file was shared with you</p>
			<p>You can download <strong>%%FILENAME%%</strong> using this url:</p>
			<table width="434" border="0">
			  <tr>
				<td width="109" bgcolor="#999999"><strong>URL:</strong></td>
				<td width="212" bgcolor="#CCCCCC"><a href="%%URLSTRING%%">%%FILENAME%%</a></td>
			  </tr>
			  <tr><td bgcolor="#999999"><strong>Password:</strong></td><td bgcolor="#CCCCCC">%%PASSWORD%%</td></tr>
			  <tr><td bgcolor="#999999"><strong>Valid until:</strong></td><td bgcolor="#CCCCCC">%%TIMELIMIT%%</td></tr>
			</table>
			<p>Thanks<br />
			  <em><br />
			  </em>eyeOS<em><br /></p>
			</body>
			</html>');

if(!defined('REMEMBER_PASSWORD_SUBJECT')) 
	define('REMEMBER_PASSWORD_SUBJECT', 'Password reset from eyeOS');
if(!defined('REMEMBER_PASSWORD_TEXT')) 
	define('REMEMBER_PASSWORD_TEXT', 'The password for your user <b>%s</b> has been reset to <b>%s</b>.');
if(!defined('REMEMBER_PASSWORD_DISCLAIMER')) 
	define('REMEMBER_PASSWORD_DISCLAIMER', '<br><br>You can use this new password to access your account.');
if(!defined('REMEMBER_PASSWORD_FROM')) 
	define('REMEMBER_PASSWORD_FROM', MAIL_FROM);
if(!defined('REMEMBER_PASSWORD_ENABLED')) 
	define('REMEMBER_PASSWORD_ENABLED', true);

//RELEASE OR DEBUG
if(!defined('SYSTEM_TYPE')) 
	define('SYSTEM_TYPE', 'release');

?>