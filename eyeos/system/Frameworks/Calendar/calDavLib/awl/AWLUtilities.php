<?php
/**
* Utility functions of a general nature which are used by
* most AWL library classes.
*
* @package   awl
* @subpackage   Utilities
* @author    Andrew McMillan <andrew@catalyst.net.nz>
* @copyright Catalyst IT Ltd
* @license   http://gnu.org/copyleft/gpl.html GNU GPL v2
*/

if ( !function_exists('dbg_error_log') ) {
  /**
  * Writes a debug message into the error log using printf syntax.  If the first
  * parameter is "ERROR" then the message will _always_ be logged.
  * Otherwise, the first parameter is a "component" name, and will only be logged
  * if $c->dbg["component"] is set to some non-null value.
  *
  * If you want to see every log message then $c->dbg["ALL"] can be set, to
  * override the debugging status of the individual components.
  *
  * @var string $component The component to identify itself, or "ERROR", or "LOG:component"
  * @var string $format A format string for the log message
  * @var [string $parameter ...] Parameters for the format string.
  */
  function dbg_error_log() {
    global $c;
    $argc = func_num_args();
    $args = func_get_args();
    $type = "DBG";
    $component = array_shift($args);
    if ( substr( $component, 0, 3) == "LOG" ) {
      // Special escape case for stuff that always gets logged.
      $type = 'LOG';
      $component = substr($component,4);
    }
    else if ( $component == "ERROR" ) {
      $type = "***";
    }
    else if ( isset($c->dbg["ALL"]) ) {
      $type = "ALL";
    }
    else if ( !isset($c->dbg[strtolower($component)]) ) return;

    if ( 2 <= $argc ) {
      $format = array_shift($args);
    }
    else {
      $format = "%s";
    }
    @error_log( $c->sysabbr.": $type: $component:". vsprintf( $format, $args ) );
  }
}



if ( !function_exists('apache_request_headers') ) {
  /**
  * Forward compatibility so we can use the non-deprecated name in PHP4
  * @package awl
  */
  function apache_request_headers() {
    return getallheaders();
  }
}



if ( !function_exists('dbg_log_array') ) {
  /**
  * Function to dump an array to the error log, possibly recursively
  *
  * @var string $component Which component should this log message identify itself from
  * @var string $name What name should this array dump identify itself as
  * @var array $arr The array to be dumped.
  * @var boolean $recursive Should the dump recurse into arrays/objects in the array
  */
  function dbg_log_array( $component, $name, $arr, $recursive = false ) {
    if ( !isset($arr) || (gettype($arr) != 'array' && gettype($arr) != 'object') ) {
      dbg_error_log( $component, "%s: array is not set, or is not an array!", $name);
      return;
    }
    foreach ($arr as $key => $value) {
      dbg_error_log( $component, "%s: >>%s<< = >>%s<<", $name, $key,
                      (gettype($value) == 'array' || gettype($value) == 'object' ? gettype($value) : $value) );
      if ( $recursive && (gettype($value) == 'array' || (gettype($value) == 'object' && "$key" != 'self' && "$key" != 'parent') ) ) {
        dbg_log_array( $component, "$name"."[$key]", $value, $recursive );
      }
    }
  }
}



if ( !function_exists("session_salted_md5") ) {
  /**
  * Make a salted MD5 string, given a string and (possibly) a salt.
  *
  * If no salt is supplied we will generate a random one.
  *
  * @param string $instr The string to be salted and MD5'd
  * @param string $salt Some salt to sprinkle into the string to be MD5'd so we don't get the same PW always hashing to the same value.
  * @return string The salt, a * and the MD5 of the salted string, as in SALT*SALTEDHASH
  */
  function session_salted_md5( $instr, $salt = "" ) {
    if ( $salt == "" ) $salt = substr( md5(rand(100000,999999)), 2, 8);
    dbg_error_log( "Login", "Making salted MD5: salt=$salt, instr=$instr, md5($salt$instr)=".md5($salt . $instr) );
    return ( sprintf("*%s*%s", $salt, md5($salt . $instr) ) );
  }
}



if ( !function_exists("session_salted_sha1") && version_compare(phpversion(), "4.9.9") > 0 ) {
  /**
  * Make a salted SHA1 string, given a string and (possibly) a salt.  PHP5 only (although it
  * could be made to work on PHP4 (@see http://www.openldap.org/faq/data/cache/347.html). The
  * algorithm used here is compatible with OpenLDAP so passwords generated through this function
  * should be able to be migrated to OpenLDAP by using the part following the second '*', i.e.
  * the '{SSHA}....' part.
  *
  * If no salt is supplied we will generate a random one.
  *
  * @param string $instr The string to be salted and SHA1'd
  * @param string $salt Some salt to sprinkle into the string to be SHA1'd so we don't get the same PW always hashing to the same value.
  * @return string A *, the salt, a * and the SHA1 of the salted string, as in *SALT*SALTEDHASH
  */
  function session_salted_sha1( $instr, $salt = "" ) {
    if ( $salt == "" ) $salt = substr( str_replace('*','',base64_encode(sha1(rand(100000,9999999),true))), 2, 9);
    dbg_error_log( "Login", "Making salted SHA1: salt=$salt, instr=$instr, encoded($instr$salt)=".base64_encode(sha1($instr . $salt, true).$salt) );
    return ( sprintf("*%s*{SSHA}%s", $salt, base64_encode(sha1($instr.$salt, true) . $salt ) ) );
  }
}


if ( !function_exists("session_validate_password") ) {
  /**
  * Checks what a user entered against the actual password on their account.
  * @param string $they_sent What the user entered.
  * @param string $we_have What we have in the database as their password.  Which may (or may not) be a salted MD5.
  * @return boolean Whether or not the users attempt matches what is already on file.
  */
  function session_validate_password( $they_sent, $we_have ) {
    if ( preg_match('/^\*\*.+$/', $we_have ) ) {
      //  The "forced" style of "**plaintext" to allow easier admin setting
      return ( "**$they_sent" == $we_have );
    }

    if ( preg_match('/^\*(.+)\*{[A-Z]+}.+$/', $we_have, $regs ) ) {
      if ( function_exists("session_salted_sha1") ) {
        // A nicely salted sha1sum like "*<salt>*{SSHA}<salted_sha1>"
        $salt = $regs[1];
        $sha1_sent = session_salted_sha1( $they_sent, $salt ) ;
        return ( $sha1_sent == $we_have );
      }
      else {
        dbg_error_log( "ERROR", "Password is salted SHA-1 but you are using PHP4!" );
        echo <<<EOERRMSG
<html>
<head>
<title>Salted SHA1 Password format not supported with PHP4</title>
</head>
<body>
<h1>Salted SHA1 Password format not supported with PHP4</h1>
<p>At some point you have used PHP5 to set the password for this user and now you are
   using PHP4.  You will need to assign a new password to this user using PHP4, or ensure
   you use PHP5 everywhere (recommended).</p>
<p>AWL has now switched to using salted SHA-1 passwords by preference in a format
   compatible with OpenLDAP.</p>
</body>
</html>
EOERRMSG;
        exit;
      }
    }

    if ( preg_match('/^\*(.+)\*.+$/', $we_have, $regs ) ) {
      // A nicely salted md5sum like "*<salt>*<salted_md5>"
      $salt = $regs[1];
      $md5_sent = session_salted_md5( $they_sent, $salt ) ;
      return ( $md5_sent == $we_have );
    }

    // Anything else is bad
    return false;

  }
}



if ( !function_exists("replace_uri_params") ) {
  /**
  * Given a URL (presumably the current one) and a parameter, replace the value of parameter,
  * extending the URL as necessary if the parameter is not already there.
  * @param string $uri The URI we will be replacing parameters in.
  * @param array $replacements An array of replacement pairs array( "replace_this" => "with this" )
  * @return string The URI with the replacements done.
  */
  function replace_uri_params( $uri, $replacements ) {
    $replaced = $uri;
    foreach( $replacements AS $param => $new_value ) {
      $rxp = preg_replace( '/([\[\]])/', '\\\\$1', $param );  // Some parameters may be arrays.
      $regex = "/([&?])($rxp)=([^&]+)/";
      dbg_error_log("core", "Looking for [%s] to replace with [%s] regex is %s and searching [%s]", $param, $new_value, $regex, $replaced );
      if ( preg_match( $regex, $replaced ) )
        $replaced = preg_replace( $regex, "\$1$param=$new_value", $replaced);
      else
        $replaced .= "&$param=$new_value";
    }
    if ( ! preg_match( '/\?/', $replaced  ) ) {
      $replaced = preg_replace("/&(.+)$/", "?\$1", $replaced);
    }
    $replaced = str_replace("&amp;", "--AmPeRsAnD--", $replaced);
    $replaced = str_replace("&", "&amp;", $replaced);
    $replaced = str_replace("--AmPeRsAnD--", "&amp;", $replaced);
    dbg_error_log("core", "URI <<$uri>> morphed to <<$replaced>>");
    return $replaced;
  }
}


if ( !function_exists("uuid") ) {
/**
 * Generates a Universally Unique IDentifier, version 4.
 *
 * RFC 4122 (http://www.ietf.org/rfc/rfc4122.txt) defines a special type of Globally
 * Unique IDentifiers (GUID), as well as several methods for producing them. One
 * such method, described in section 4.4, is based on truly random or pseudo-random
 * number generators, and is therefore implementable in a language like PHP.
 *
 * We choose to produce pseudo-random numbers with the Mersenne Twister, and to always
 * limit single generated numbers to 16 bits (ie. the decimal value 65535). That is
 * because, even on 32-bit systems, PHP's RAND_MAX will often be the maximum *signed*
 * value, with only the equivalent of 31 significant bits. Producing two 16-bit random
 * numbers to make up a 32-bit one is less efficient, but guarantees that all 32 bits
 * are random.
 *
 * The algorithm for version 4 UUIDs (ie. those based on random number generators)
 * states that all 128 bits separated into the various fields (32 bits, 16 bits, 16 bits,
 * 8 bits and 8 bits, 48 bits) should be random, except : (a) the version number should
 * be the last 4 bits in the 3rd field, and (b) bits 6 and 7 of the 4th field should
 * be 01. We try to conform to that definition as efficiently as possible, generating
 * smaller values where possible, and minimizing the number of base conversions.
 *
 * @copyright  Copyright (c) CFD Labs, 2006. This function may be used freely for
 *              any purpose ; it is distributed without any form of warranty whatsoever.
 * @author      David Holmes <dholmes@cfdsoftware.net>
 *
 * @return  string  A UUID, made up of 32 hex digits and 4 hyphens.
 */

  function uuid() {

    // The field names refer to RFC 4122 section 4.1.2

    return sprintf('%04x%04x-%04x-%03x4-%04x-%04x%04x%04x',
        mt_rand(0, 65535), mt_rand(0, 65535), // 32 bits for "time_low"
        mt_rand(0, 65535), // 16 bits for "time_mid"
        mt_rand(0, 4095),  // 12 bits before the 0100 of (version) 4 for "time_hi_and_version"
        bindec(substr_replace(sprintf('%016b', mt_rand(0, 65535)), '01', 6, 2)),
            // 8 bits, the last two of which (positions 6 and 7) are 01, for "clk_seq_hi_res"
            // (hence, the 2nd hex digit after the 3rd hyphen can only be 1, 5, 9 or d)
            // 8 bits for "clk_seq_low"
        mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535) // 48 bits for "node"
    );
  }
}

if ( !function_exists("translate") ) {
  require_once("Translation.php");
}

 if ( !function_exists("clone") && version_compare(phpversion(), '5.0') < 0) {
  /**
  * PHP5 screws with the assignment operator changing so that $a = $b means that
  * $a becomes a reference to $b.  There is a clone() that we can use in PHP5, so
  * we have to emulate that for PHP4.  Bleargh.
  */
  eval( 'function clone($object) { return $object; }' );
}

if ( !function_exists("quoted_printable_encode") ) {
  /**
  * Process a string to fit the requirements of RFC2045 section 6.7.  Note that
  * this works, but replaces more characters than the minimum set. For readability
  * the spaces aren't encoded as =20 though.
  */
  function quoted_printable_encode($string) {
    return preg_replace('/[^\r\n]{73}[^=\r\n]{2}/', "$0=\r\n", str_replace("%","=",str_replace("%20"," ",rawurlencode($string))));
  }
}


if ( !function_exists("clean_by_regex") ) {
  /**
  * Clean a value by applying a regex to it.  If it is an array apply it to
  * each element in the array recursively.  If it is an object we don't mess
  * with it.
  */
  function clean_by_regex( $val, $regex ) {
    if ( is_null($val) ) return null;
    switch( $regex ) {
      case 'int':     $regex = '#^\d+$#';     break;
    }
    if ( is_array($val) ) {
      foreach( $val AS $k => $v ) {
        $val[$k] = clean_by_regex($v,$regex);
      }
    }
    else if ( ! is_object($val) ) {
      if ( preg_match( $regex, $val, $matches) ) {
        $val = $matches[0];
      }
      else {
        $val = '';
      }
    }
    return $val;
  }
}


if ( !function_exists("param_to_global") ) {
  /**
  * Convert a parameter to a global.  We first look in _POST and then in _GET,
  * and if they passed in a bunch of valid characters, we will make sure the
  * incoming is cleaned to only match that set.
  *
  * @param string $varname The name of the global variable to put the answer in
  * @param string $match_regex The part of the parameter matching this regex will be returned
  * @param string $alias1  An alias for the name that we should look for first.
  * @param    "    ...     More aliases, in the order which they should be examined.  $varname will be appended to the end.
  */
  function param_to_global( ) {
    $args = func_get_args();

    $varname = array_shift($args);
    $GLOBALS[$varname] = null;

    $match_regex = null;
    $argc = func_num_args();
    if ( $argc > 1 ) {
      $match_regex = array_shift($args);
    }

    $args[] = $varname;
    foreach( $args AS $k => $name ) {
      if ( isset($_POST[$name]) ) {
        $result = $_POST[$name];
        break;
      }
      else if ( isset($_GET[$name]) ) {
        $result = $_GET[$name];
        break;
      }
    }
    if ( !isset($result) ) return null;

    if ( isset($match_regex) ) {
      $result = clean_by_regex( $result, $match_regex );
    }

    $GLOBALS[$varname] = $result;
    return $result;
  }
}


if ( !function_exists("get_fields") ) {
  /**
  * @var array $_AWL_field_cache is a cache of the field names for a table
  */
  $_AWL_field_cache = array();


  /**
  * Get the names of the fields for a particular table
  * @param string $tablename The name of the table.
  * @return array of string The public fields in the table.
  */
  function get_fields( $tablename ) {
    global $_AWL_field_cache;

    if ( !isset($_AWL_field_cache[$tablename]) ) {
      dbg_error_log( "DataUpdate", ":get_fields: Loaded fields for table '$tablename'" );
      $sql = "SELECT f.attname, t.typname FROM pg_attribute f ";
      $sql .= "JOIN pg_class c ON ( f.attrelid = c.oid ) ";
      $sql .= "JOIN pg_type t ON ( f.atttypid = t.oid ) ";
      $sql .= "WHERE relname = ? AND attnum >= 0 order by f.attnum;";
      $qry = new PgQuery( $sql, $tablename );
      $qry->Exec("DataUpdate");
      $fields = array();
      while( $row = $qry->Fetch() ) {
        $fields["$row->attname"] = $row->typname;
      }
      $_AWL_field_cache[$tablename] = $fields;
    }
    return $_AWL_field_cache[$tablename];
  }
}

