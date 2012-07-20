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

//The following constants are commented because they are redefined in init.php
//############################################################################
//define('REAL_EYE_ROOT', 'eyeos');
//define('EYE_ROOT', '.');
//
//// DIRS
//define('BOOT_DIR', 'bootstrap');
//define('SYSTEM_DIR', 'system');
//define('SYSTEM_CONF_DIR', 'conf');
//define('SYSTEM_CONF_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR);
//define('SYSTEM_SKEL_DIR', 'skel');
//define('SYSTEM_SKEL_PATH', SYSTEM_CONF_PATH . '/' . SYSTEM_SKEL_DIR);
//define('KERNEL_DIR', 'kernel');
//define('SERVICES_DIR', 'services');
//define('LIBRARIES_DIR', 'libs');
//define('FRAMEWORKS_DIR', 'Frameworks');
//define('IMPLEMENTATIONS_DIR', 'implementations');
//define('EXTERN_DIR', 'extern');
//define('APPS_DIR', 'apps');
//define('USERS_DIR', 'users');
//define('USERS_PATH', EYE_ROOT . '/' . USERS_DIR);
//define('USERS_CONF_DIR','conf');
//define('USERS_FILES_DIR','files');
//define('USERS_METAFILES_DIR','metafiles');
//define('USERS_SHARE_DIR','share');
//define('USERS_META_DIR', 'meta');
//define('USERS_META_SETTINGS_FILENAME', 'settings.xml');

//LIBS
define('LIBRARIES_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . KERNEL_DIR . '/' . LIBRARIES_DIR);
define('LIB_ABSTRACTION_DIR', 'abstraction');
define('LIB_ABSTRACTION_PATH', LIBRARIES_PATH . '/' . LIB_ABSTRACTION_DIR);
define('LIB_EXCEPTIONS_DIR', 'exceptions');
define('LIB_EXCEPTIONS_PATH', LIBRARIES_PATH . '/' . LIB_EXCEPTIONS_DIR);
define('LIB_EXCEPTIONS_SUBCLASSES_DIR', 'subclasses');
define('LIB_EXCEPTIONS_USE_REALPATH', false);
define('LIB_EXCEPTIONS_SUBCLASSES_PATH', LIB_EXCEPTIONS_PATH . '/' . LIB_EXCEPTIONS_SUBCLASSES_DIR);
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

//SERVICES
define('SERVICES_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . KERNEL_DIR . '/' . SERVICES_DIR);
define('SERVICE_FILESYSTEM_DIR', 'FileSystem');
define('SERVICE_FILESYSTEM_PATH', SERVICES_PATH . '/' . SERVICE_FILESYSTEM_DIR);
define('SERVICE_FILESYSTEM_LIBRARIES_DIR', 'libs');
define('SERVICE_FILESYSTEM_LIBRARIES_PATH', SERVICE_FILESYSTEM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_FILESYSTEM_LIBRARIES_DIR);
define('SERVICE_FILESYSTEM_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_FILESYSTEM_DIR);
define('SERVICE_FILESYSTEM_EYEOSABSTRACTVIRTUALFILE_USE_METADATA_CACHE', false);		//adds maybe too much complexity with synchronization, so it is commented in EyeosAbstractVirtualFile
define('SERVICE_META_DIR', 'Meta');
define('SERVICE_META_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR);
define('SERVICE_META_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_META_DIR);
define('SERVICE_META_HANDLERS_DIR', 'Handlers');
define('SERVICE_META_HANDLERS_PATH', SERVICES_PATH . '/' . SERVICE_META_DIR . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_META_HANDLERS_DIR);
define('SERVICE_MMAP_DIR', 'MMap');
define('SERVICE_MMAP_PATH', SERVICES_PATH . '/' . SERVICE_MMAP_DIR);
define('SERVICE_SECURITY_DIR', 'Security');
define('SERVICE_SECURITY_PATH', SERVICES_PATH . '/' . SERVICE_SECURITY_DIR);
//define('SERVICE_SECURITY_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . SERVICES_DIR . '/' . SERVICE_SECURITY_DIR);
define('SERVICE_SECURITY_POLICYCONFIGURATIONS_DIR', 'PolicyConfigurations');
define('SERVICE_SECURITY_POLICYCONFIGURATIONS_PATH', SERVICE_SECURITY_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_SECURITY_POLICYCONFIGURATIONS_DIR);
//define('SERVICE_SECURITY_POLICYCONFIGURATIONS_DEFAULTCONF_PATH', SERVICE_SECURITY_CONFIGURATION_PATH . '/SecurityManager.xml');
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
define('FRAMEWORK_TAGS_DIR', 'Tags');
define('FRAMEWORK_TAGS_PATH', FRAMEWORKS_PATH . '/' . FRAMEWORK_TAGS_DIR);
define('FRAMEWORK_TAGS_CONFIGURATION_PATH', SYSTEM_CONF_PATH . '/' . FRAMEWORKS_DIR . '/' . FRAMEWORK_TAGS_DIR);

// MEMORY
define('DEFAULT_MEMORYMANAGER', 'MemorySession');

// UM
define('SERVICE_UM_PRINCIPALSMANAGER', 'EyeosSQLPrincipalsManager');
define('SERVICE_UM_USER_CLASSNAME', 'EyeosUser');
define('SERVICE_UM_GROUP_CLASSNAME', 'EyeosGroup');
define('SERVICE_UM_WORKGROUP_CLASSNAME', 'EyeosWorkgroup');
define('SERVICE_UM_USERWORKGROUPASSIGNATION_CLASSNAME', 'EyeosUserWorkgroupAssignation');
define('SERVICE_UM_DEFAULTUSERSGROUP', 'users');

// DATA
define('DEFAULT_DATAMANAGER', 'DataJSON');

// COOKIE
define('COOKIE_NAME', 'eyeos');
define('FLASHFIX', 'flashfix');

// STORAGE
define('SQL_CONNECTIONSTRING', 'mysql:dbname=eyeos_tests;host=127.0.0.1');
define('SQL_USERNAME', 'root');
define('SQL_PASSWORD', 'root');
?>