<?php
ob_start();

//##### redefined constants from settings.php (see commented lines) #####
define('REAL_EYE_ROOT', 'eyeos');
define('EYE_ROOT', '.');

// DIRS
define('BOOT_DIR', 'bootstrap');
define('SYSTEM_DIR', 'system');
define('SYSTEM_CONF_DIR', 'conf');
//define('SYSTEM_CONF_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR);
define('SYSTEM_SKEL_DIR', 'skel');
//define('SYSTEM_SKEL_PATH', SYSTEM_CONF_PATH . '/' . SYSTEM_SKEL_DIR);
define('KERNEL_DIR', 'kernel');
define('SERVICES_DIR', 'services');
define('LIBRARIES_DIR', 'libs');
define('FRAMEWORKS_DIR', 'Frameworks');
define('IMPLEMENTATIONS_DIR', 'implementations');
define('EXTERN_DIR', 'extern');
define('APPS_DIR', 'apps');
define('USERS_DIR', 'users');
//define('USERS_PATH', EYE_ROOT . '/' . USERS_DIR);
define('USERS_CONF_DIR','conf');
define('USERS_FILES_DIR','files');
define('USERS_METAFILES_DIR','metafiles');
define('USERS_SHARE_DIR','share');
define('USERS_META_DIR', 'meta');
define('USERS_META_SETTINGS_FILENAME', 'settings.xml');
define('WORKGROUPS_DIR', 'workgroups');
//define('WORKGROUPS_PATH', EYE_ROOT . '/' . WORKGROUPS_DIR);
define('WORKGROUPS_CONF_DIR', 'conf');
define('WORKGROUPS_FILES_DIR', 'files');
define('WORKGROUPS_METAFILES_DIR', 'metafiles');
define('WORKGROUPS_META_DIR', 'meta');
define('WORKGROUPS_META_SETTINGS_FILENAME', 'settings.xml');

//##### special constants, only for tests #####
define('EYEOS_TESTS_DIR', 'tests');
define('EYE_ROOT_TESTS_PATH', EYE_ROOT . '/' . EYEOS_TESTS_DIR);
define('EYEOS_TESTS_TMP_DIR', 'tmp');
define('EYEOS_TESTS_TMP_PATH', EYE_ROOT_TESTS_PATH . '/' . EYEOS_TESTS_TMP_DIR);
define('EYEOS_DOC_PATH', EYE_ROOT . '/../doc');

//##### redefined constants from settings.php (see commented lines) #####
define('USERS_PATH', EYE_ROOT_TESTS_PATH . '/' . USERS_DIR);
define('WORKGROUPS_PATH', EYE_ROOT_TESTS_PATH . '/' . WORKGROUPS_DIR);
define('SYSTEM_CONF_PATH', EYE_ROOT_TESTS_PATH . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR);
define('SYSTEM_SKEL_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR . '/' . SYSTEM_SKEL_DIR);

require_once('settings.php');

//##### redefined constants from settings.php (see commented lines) #####
define('SERVICE_SECURITY_CONFIGURATION_PATH', EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR . '/' . SERVICES_DIR . '/' . SERVICE_SECURITY_DIR);
define('SERVICE_SECURITY_POLICYCONFIGURATIONS_DEFAULTCONF_PATH', SERVICE_SECURITY_CONFIGURATION_PATH . '/SecurityManager.xml');


//initialize the system
require_once('./'.SYSTEM_DIR.'/'.BOOT_DIR.'/Bootstrap.php');

//startup
Bootstrap::init();

MemoryManager::getInstance()->reset();

//setting error reporting to E_ALL (yes, even notices, because we should be able to avoid them too!)
error_reporting(E_ALL);

register_shutdown_function('__shutdown_test');


//register some "constants" that will be used by various tests
$GLOBALS['eyeos_UnitTests'] = array(
	// default groups and users from EyeosUMSQL.sql
	'initGroupNames' => array('root', 'admin', 'um', 'users', 'vfs', 'lfs', 'rfs', 'mnt', 'sys', 'wg', 'wg-managers', 'exec'),
	'initUserNames' => array('root', 'john', '_register')
	
	// more to come...
);

try {
	__start_test();
} catch (Exception $e) {
	echo 'Uncaught exception while initializing unit tests! Aborting.' . "\n";
	ExceptionStackUtil::printStackTrace($e, false);
	exit;
}

function __start_test() {
	$dbh = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	
	// Drop tables
	try {
		$dbh->send('DROP TABLE `eyeosuserworkgroupassignation`');
	} catch (PDOException $e) {}
	try {
		$dbh->send('DROP TABLE `eyeosworkgroup`');
	} catch (PDOException $e) {}
	try {
		$dbh->send('DROP TABLE `eyeosprincipalgroupassignation`');
	} catch (PDOException $e) {}
	try {
		$dbh->send('DROP TABLE `eyeosuser`');
	} catch (PDOException $e) {}
	try {
		$dbh->send('DROP TABLE `eyeosgroup`');
	} catch (PDOException $e) {}
	
	// Create tables with initial content
	$initSqlScript = file_get_contents('./extras/EyeosUMSQL/EyeosUMSQL.sql');
	$dbh->send($initSqlScript);
	
	
	// Here we're using a test AuthConfiguration using FakeEyeosLoginModule, that allows to login
	// as root even without root user in the database so we can create... a real user root for
	// the rest of the tests :)
	// (the UM service is not accessible for writing by anyone, only root, members of "admin" or
	// "um" system groups)
	$originalConf = AuthConfiguration::getConfiguration();
	AuthConfiguration::setConfiguration(new XMLAuthConfiguration('./tests/system/conf/services/UM/AuthConfigurations/init_tests.xml'));
	
	// We need a valid login context to create test principals
	$myUManager = UMManager::getInstance();
	$subject = new Subject();
	$loginContext = new LoginContext('root', $subject);
	$subject->getPrivateCredentials()->append(new FakeEyeosCredential('root', 'root'));
	$loginContext->login();
	
	// Create "login" process
	$procManager = ProcManager::getInstance();
	$myProcess = new Process('login');
	$procManager->execute($myProcess);
	$procManager->setProcessLoginContext($myProcess->getPid(), $loginContext);
	
	// Delete pre-existing users because we need to create users in a clean way,
	// to trigger any action that is supposed to take place on user creation
	// (folder creation, default configuration files, etc.)
	try {
		$john = $myUManager->getUserByName('john');
		$myUManager->deletePrincipal($john);
	} catch (EyeNoSuchUserException $e) {}
	try {
		$root = $myUManager->getUserByName('root');
		$myUManager->deletePrincipal($root);
	} catch (EyeNoSuchUserException $e) {}
	
	// Create root
	$group = $myUManager->getGroupByName('root');
	$user = $myUManager->getNewUserInstance();
	$user->setName('root');
	$user->setPassword('root', true);
	$user->setPrimaryGroupId($group->getId());
	$myUManager->createUser($user);
	
	// Create john
	$group = $myUManager->getGroupByName(SERVICE_UM_DEFAULTUSERSGROUP);
	$user = $myUManager->getNewUserInstance();
	$user->setName('john');
	$user->setPassword('john', true);
	$user->setPrimaryGroupId($group->getId());
	$myUManager->createUser($user);
	
	// Now switch to a real authentication with root
	AuthConfiguration::setConfiguration($originalConf);
	$subject = new Subject();
	$loginContext = new LoginContext('init', $subject);
	$subject->getPrivateCredentials()->append(new EyeosPasswordCredential('root', 'root'));
	$loginContext->login();
	
	$procManager = ProcManager::getInstance();
	$procManager->setProcessLoginContext($myProcess->getPid(), $loginContext);
}

function __shutdown_test() {
	try {
		// We need to be root to delete test principals
		$myUManager = UMManager::getInstance();
		$subject = new Subject();
		$loginContext = new LoginContext('init', $subject);
		$subject->getPrivateCredentials()->append(new EyeosPasswordCredential('root', 'root'));
		$loginContext->login();
		
		// we need a fake shutdown process
		$procManager = ProcManager::getInstance();
		$myProcess = new Process('shutdown');
		$procManager->execute($myProcess);
		$procManager->setProcessLoginContext($myProcess->getPid(), $loginContext);
		
		// clean deletion of users
		foreach(UMManager::getInstance()->getAllUsers() as $user) {
			UMManager::getInstance()->deletePrincipal($user);
		}
		
		AdvancedPathLib::rmdirs(USERS_PATH, true);
		
	} catch (Exception $e) {
		echo 'Uncaught exception on shutdown!' . "\n";
		ExceptionStackUtil::printStackTrace($e, false);
	}
}

?>