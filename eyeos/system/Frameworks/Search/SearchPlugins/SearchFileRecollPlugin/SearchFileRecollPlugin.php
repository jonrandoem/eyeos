<?php

define('FRAMEWORK_SEARCH_RECOLL_DIR', 'recoll');

/**
 * 
 */
class SearchFileRecollPlugin extends AbstractSearchFilePlugin {
	private $tokensMap;
	private $searchQuery;
	private $totalFiles;
	private $results;

	function __construct () {
		$this->setValidTokens (Array ('ext', 'type'));
		$this->setTokensMap (Array ('ext', 'type'));
	}
	
	public static function createRecollUserConf(AbstractEyeosUser $user) {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			return;
		}
		
		$userDirPath = UMManager::getInstance()->getEyeosUserDirectory($user);
		$userRecollDirPath = $userDirPath . '/' . USERS_CONF_DIR . '/' . FRAMEWORK_SEARCH_RECOLL_DIR;
		$buffer = "\n";
		$buffer .= 'topdirs = ' . realpath($userDirPath) . "/files\n";
		$buffer .= 'noaspell = 1' . "\n";
		if (!is_dir($userRecollDirPath)) {
			mkdir($userRecollDirPath, 0777, true);
		}
		file_put_contents($userRecollDirPath . '/recoll.conf', $buffer, FILE_APPEND);
		shell_exec(realpath(FRAMEWORK_SEARCH_PATH) . '/utils/updateDB.pl ' . escapeshellarg(realpath($userRecollDirPath)));
	}

	public static function generateRecollIndex(AbstractEyeosUser $user) {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			return;
		}

		$userDirPath = UMManager::getInstance()->getEyeosUserDirectory($user);
		$userRecollDirPath = $userDirPath . '/' . USERS_CONF_DIR . '/' . FRAMEWORK_SEARCH_RECOLL_DIR;

		shell_exec(realpath(FRAMEWORK_SEARCH_PATH) . '/utils/updateDB.pl ' . escapeshellarg(realpath($userRecollDirPath)));
	}
	
	public static function callRecollIndex(IFile $file, $option) {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			return;
		}
		
		if ($file instanceof EyeosAbstractVirtualFile) {
			$file = $file->getRealFile();
		}
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$recollDirPath = UMManager::getEyeosUserDirectory($user) . '/' . USERS_CONF_DIR . '/' . FRAMEWORK_SEARCH_RECOLL_DIR;

		if ($option == '-d') {
			shell_exec('recollindex -c ' . escapeshellarg(realpath($recollDirPath)));
		}
		else {
			shell_exec('recollindex -c ' . escapeshellarg(realpath($recollDirPath)) . ' ' . escapeshellarg($option) . ' ' . escapeshellarg($file->getPathFromRoot()));
		}
		
	}
	
	public function getResults () {
		return $this->results;
	}

	public function getSearchQuery () {
		return $this->searchQuery;
	}
	
	public function getTokensMap () {
		return $this->tokensMap;
	}
	
	public function getTotalFiles () {
		return $this->totalFiles;
	}
	
	public static function init() {
//		//loading virtual files listener and registering it
//		require FRAMEWORK_SEARCH_PLUGINS_PATH . '/' . __CLASS__ . '/RecollVirtualFileListener.php';
//		EyeosGlobalFileEventsDispatcher::getInstance()->addListener(RecollVirtualFileListener::getInstance());
//
//		//loading UM listener and registering it
//		require FRAMEWORK_SEARCH_PLUGINS_PATH . '/' . __CLASS__ . '/RecollUMListener.php';
//		UMManager::getInstance()->addUMListener(RecollUMListener::getInstance());
	}
	
	public function resetSearchQuery() {
		$this->searchQuery = '';
	}
	
	public function search (SearchQuery $obj) {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			return array(0, array());
		}
		
		$this->results = array();

		// setting the queryString to the variable.
		$searchArray = explode (' ', $obj->getQueryString());
		foreach ($searchArray as $word) {
			$this->searchQuery .= 'filename:'.$word.'* ';
		}

		// setting the queryTokens to the variable.
		$queryTokens = $obj->getQueryTokens();

		// for each valid token, we add the token and its parameters to the $searchQuery variable.
		if ($queryTokens) {
			foreach ($queryTokens as $token => $parameters) {
				if (in_array($token, $this->getValidTokens())) {
					foreach ($parameters as $count => $value) {
						$this->searchQuery .= $token.':'.$value;
						if ($count < count($parameters) - 1) {
							$this->searchQuery .= ' OR ';
						}
						else {
							$this->searchQuery .= ' ';
						}
					}
					$this->searchQuery .= 'AND ';
				}
			}
			// searching for an AND at the end of the searchQuery, if it's there we delete it
			// to conform the query to the recoll standards.
			// ( by the way, an AND at the end of a query does not make any sense, do it? :P )
			$pos = strpos($this->searchQuery, 'AND', strlen($this->searchQuery) - 4);
			$this->searchQuery = substr($this->searchQuery, 0, $pos - 1);
		}

		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getName();
		$recollDirPath = UMManager::getEyeosUserDirectory($user) . '/' . USERS_CONF_DIR . '/' . FRAMEWORK_SEARCH_RECOLL_DIR;

		$result = shell_exec(AdvancedPathLib::realpath(FRAMEWORK_SEARCH_UTILS_PATH) . '/XmlBuilder.pl '
			. escapeshellarg(AdvancedPathLib::realpath($recollDirPath)) . ' ' . escapeshellarg($this->searchQuery) );

		$xmlResult = simplexml_load_string ($result);

		if ($xmlResult) {
                        $path = realpath(UMManager::getEyeosUserDirectory($user)) . '/files/';
			foreach ($xmlResult as $node => $markup) {
				if ($node == 'file') {
                                        $cleanPath = utf8_substr($markup->path, 7);
                                        $cleanPath = 'home://~' . $user . '/' . utf8_substr($cleanPath, strlen($path));
					$tempFile = Array ('type' => (string) $markup->type,
						'path' => (string) $cleanPath,
						'name' => (string) $markup->name,
						'size' => (string) $markup->size);
					$this->results[] = $tempFile;
				}
				else {
					if ($node == 'files') {
						$this->totalFiles = $markup;
					}
				}
			}
		}
		return array($this->totalFiles, $this->results);
	}
	
	public function setTokensMap (Array $tokens) {
		$this->tokensMap = $tokens;
	}

	public static function updateDb(AbstractEyeosUser $user) {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			return;
		}
		
		$userRecollDirPath = UMManager::getInstance()->getEyeosUserDirectory($user) . '/' . USERS_CONF_DIR . '/' . FRAMEWORK_SEARCH_RECOLL_DIR;
		shell_exec(realpath(FRAMEWORK_SEARCH_UTILS_PATH) . '/updateDB.pl ' . escapeshellarg(realpath($userRecollDirPath)));
	}
}
?>
