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
 * This class allows to define simple allow/deny rules on URL.
 * Usage: scheme://[host]/path[/[-]|[*]]
 * Examples:
 * <ul>
 * 	<li><b>sys:///path/to/file</b>: Defines a rule for the file or folder itself (*not* its content if it's a folder)</li>
 *  <li><b>sys:///path/to/folder/*</b>: Defines a rule for the folder and its content, non-recursively</li>
 *  <li><b>sys:///path/to/folder/-</b>: Defines a rule for the folder and its content, recursively</li>
 *  <li><b>/path/to/folder</b>: Defines a rule to the path part of the URL, whatever the scheme/host/username/password is</li>
 * </ul>
 * 
 * @package kernel-services
 * @subpackage Security
 */
class URLSecurityHandler implements ISecurityHandler {
	const PARAM_ALLOW = 'allow';
	const PARAM_ACTIONS = 'actions';
	const PARAM_DENY = 'deny';
	const PARAM_POLICY = 'policy';
	const PARAM_PATHSEPARATOR = 'pathSeparator';
	
	const PARAM_POLICY_DENY_ALLOW = 'deny-allow';
	const PARAM_POLICY_ALLOW_DENY = 'allow-deny';
	
	const RECURSIVE_CHAR = '-';
	const WILD_CHAR = '*';
	
	/**
	 * @var EyeHandlerFailureException
	 */
	private $failureException = null;
	
	private $separator = ',';
	private $actions = '';
	private $defaultDeny = false;
	private $allowedUrls = array();
	private $deniedUrls = array();
	
	/**
	 * 
	 * @param array $params Special parameters for the handler.
	 */
	public function __construct(array $params = null) {
		// check for missing arguments
		if (!isset($params[self::PARAM_ALLOW]) && !isset($params[self::PARAM_DENY])) {
			throw new EyeMissingArgumentException('Missing parameter $params[' . self::PARAM_ALLOW . '] or $params[' . self::PARAM_DENY . ']');
		}
		
		// 'pathsSeparator' parameter (for 'allow' and 'deny' parameters)
		if (isset($params[self::PARAM_PATHSEPARATOR])) {
			if(!is_string($params[self::PARAM_PATHSEPARATOR]) || utf8_strlen($params[self::PARAM_PATHSEPARATOR]) > 1) {
				throw new EyeInvalidArgumentException('Parameter $params[' . self::PARAM_PATHSEPARATOR . '] must be a character.');
			} else {
				$this->separator = $params[self::PARAM_PATHSEPARATOR];
			}
		}
		// 'actions' parameter (actions to allow or deny)
		if (isset($params[self::PARAM_ACTIONS])) {
			if(!is_string($params[self::PARAM_ACTIONS])) {
				throw new EyeInvalidArgumentException('Parameter $params[' . self::PARAM_ACTIONS . '] must be a string.');
			} else {
				$this->actions = array_map('trim', explode(',', $params[self::PARAM_ACTIONS]));
			}
		} else {
			// all actions
			$this->actions = array(
				SecurityConstants::READ_ACTION,
				SecurityConstants::WRITE_ACTION,
				SecurityConstants::DELETE_ACTION,
				SecurityConstants::EXECUTE_ACTION
			);
		}
		
		// 'allow' parameter (list of allowed paths)
		if (isset($params[self::PARAM_ALLOW])) {
			if (!is_string($params[self::PARAM_ALLOW])) {
				throw new EyeInvalidArgumentException('Parameter $params[' . self::PARAM_ALLOW . '] must be a string.');
			} else {
				$this->allowedUrls = array_map('trim', explode($this->separator, $params[self::PARAM_ALLOW]));
			}
		}
		// 'deny' parameter (list of denied paths)
		if (isset($params[self::PARAM_DENY])) {
			if(!is_string($params[self::PARAM_DENY])) {
				throw new EyeInvalidArgumentException('Parameter $params[' . self::PARAM_DENY . '] must be a string.');
			} else {
				$this->deniedUrls = array_map('trim', explode($this->separator, $params[self::PARAM_DENY]));
			}
		}
		// 'policy' parameter (allow/deny or deny/allow = behaviour in case no given rule is applicable)
		if (isset($params[self::PARAM_POLICY])) {
			if($params[self::PARAM_POLICY] == self::PARAM_POLICY_DENY_ALLOW) {
				$this->defaultDeny = ($params[self::PARAM_POLICY] == self::PARAM_POLICY_DENY_ALLOW) ? true : false;
			}  else if ($params[self::PARAM_POLICY] == self::PARAM_POLICY_ALLOW_DENY) {
				$this->defaultDeny = ($params[self::PARAM_POLICY] == self::PARAM_POLICY_ALLOW_DENY) ? false : true;
			} else {
				throw new EyeInvalidArgumentException('Invalid parameter $params[' . self::PARAM_POLICY . ']: expecting "'
					. self::PARAM_POLICY_DENY_ALLOW . '" or "' . self::PARAM_POLICY_ALLOW_DENY . '".');
			}
		}
	}
	
	/**
	 * TODO
	 * 
	 * @param mixed $object
	 * @param IPermission $permission
	 * @param LoginContext $context
	 * @return bool TRUE if the handler performed the permission check successfully, FALSE otherwise.
	 * 
	 * @throws EyeInvalidArgumentException
	 * @throws EyeUnexpectedValueException
	 * @throws EyeAccessControlException
	 */
	public function checkPermission($object, IPermission $permission, LoginContext $context) {
		if (!$object instanceof IFile) {
			throw new EyeInvalidArgumentException('$object must be an IFile.');
		}
		
		$url = $object->getAbsolutePath();
		$allowed = !$this->defaultDeny;
		$denyUrlRule = 'DENY by default';
		
		$refPermission = new VirtualFilePermission('', $this->actions);
		if (!$this->defaultDeny) {
			foreach($this->deniedUrls as $deniedUrl) {
				if (self::impliesUrl($deniedUrl, $url) && $refPermission->implies($permission)) {
					$allowed = false;
					$denyUrlRule = 'DENY on "' . $deniedUrl . '"';
					break;
				}
			}
		}
		foreach($this->allowedUrls as $allowedUrl) {
			if (self::impliesUrl($allowedUrl, $url) && $refPermission->implies($permission)) {
				$allowed = true;
			}
		}
		if (!$allowed) {
			throw new EyeAccessControlException('Access denied to file ' . $object->getPath() . ' (security rule: ' . $denyUrlRule . ').');
		}
		return true;
	}
	
	public function getFailureException() {
		return null;
	}
	
	/**
	 * 
	 * @param string $referenceUrl
	 * @param string $requestedUrl
	 * @param bool $requestedUrlIsDir
	 * @return bool
	 */
	protected static function impliesUrl($referenceUrl, $requestedUrl) {
		$refUrlParts = AdvancedPathLib::parse_url($referenceUrl);
		$requestedUrlParts = AdvancedPathLib::parse_url($requestedUrl);
		
		// schemes must match
		if ($refUrlParts['scheme'] != $requestedUrlParts['scheme']) {
			return false;
		}
		// hosts must match (except if reference host is "*")
		// TODO: add ability to provide a partial host (e.g. "*.eyeos.org")
		if (isset($refUrlParts['host'])) {
			if ($refUrlParts['host'] != self::WILD_CHAR) {
				if (!isset($requestedUrlParts['host']) || $refUrlParts['host'] != $requestedUrlParts['host']) {
					return false;
				}
			}
		}
		
		// initialize reference URL
		$referenceIsDirectory = false;
		$referenceIsRecursive = false;
		$refCanonicalPath = AdvancedPathLib::getCanonicalPath($refUrlParts['path']);
		//var_dump('$refCanonicalPath: ' . $refCanonicalPath);
		
		// analyze reference URL (directory? recursive?)
		$length = utf8_strlen($refCanonicalPath);
		$lastChar = ($length > 0) ? utf8_substr($refCanonicalPath, -1) : 0;
		$lastCharButOneIdx = ($length > 0) ? utf8_substr($refCanonicalPath, -2, 1) : 0;
		if ($lastChar == self::RECURSIVE_CHAR && $lastCharButOneIdx == '/') {
			$referenceIsDirectory = true;
			$referenceIsRecursive = true;
			$refCanonicalPath = utf8_substr($refCanonicalPath, 0, -1);
		} elseif ($lastChar == self::WILD_CHAR && $lastCharButOneIdx == '/') {
			$referenceIsDirectory = true;
			$referenceIsRecursive = utf8_substr($refCanonicalPath, 0, -1);
		}
		
		// initialize requested URL
		$canonicalPath = AdvancedPathLib::getCanonicalPath($requestedUrlParts['path']);
		
		//var_dump($canonicalPath . ' ### ' . $refCanonicalPath);
		//var_dump('refIsDir: ' . ($referenceIsDirectory ? 'true' : 'false'));
		//var_dump('refIsRecursive: ' . ($referenceIsRecursive ? 'true' : 'false'));
		
		// check implication
		$implies = false;
		if ($referenceIsDirectory) {
			if ($referenceIsRecursive) {
				$implies = utf8_strlen($canonicalPath) > utf8_strlen($refCanonicalPath)
					&& ($canonicalPath == $refCanonicalPath
						|| utf8_strpos($canonicalPath, $refCanonicalPath) === 0);
			} else {
				$lastSeparatorIdx = utf8_strrpos($canonicalPath, '/');
				if ($lastSeparatorIdx === false) {
					$implies = false;
				} else {
					$implies = utf8_strlen($refCanonicalPath) == ($lastSeparatorIdx + 1)
						&& utf8_substr($refCanonicalPath, 0, $lastSeparatorIdx + 1) == utf8_substr($canonicalPath, 0, $lastSeparatorIdx + 1);
				}
			}
		} else {
			$implies = $refCanonicalPath == $canonicalPath;
		}
		//var_dump('$implies= ' . ($implies? 'true' : 'false'));
		return $implies;
	}
}
?>
