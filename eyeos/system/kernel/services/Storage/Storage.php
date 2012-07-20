<?php
/**
 * Require needed storage frameworks
 */

/**
 * The GenericDAO is required by each handler.
 * Each handler is extended from this.
 *
//require_once FRAMEWORK_STORAGE_PATH . '/SQL/GenericDAO.php';
 * 
 */

/**
 * Requires the DAO Handler class
 * @see /settings.php SQL_DAOHANDLER
 */
require_once FRAMEWORK_STORAGE_PATH . '/' . SQL_DAOHANDLER . '.php';
?>