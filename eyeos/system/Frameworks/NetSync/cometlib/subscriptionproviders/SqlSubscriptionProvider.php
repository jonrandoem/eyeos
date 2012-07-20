<?php
global $netsync_db;

class SqlSubscriptionProvider implements ISubscriptionProvider {
	private $db;

	public function  __construct() {
	    $this->db = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

    public function getHooks() {
		$sql = "SELECT * FROM `netsyncHooks` WHERE 1";

		$results = $this->db->send($sql);
		$results = $results->fetchAll(PDO::FETCH_ASSOC);
		$hooks = Array();
		if (count($results)) {
			return $hooks;
		}
		
		foreach ($results as $result) {
			array_push($hooks, $result);
		}
		return $hooks;
	}

	/**
	* Refresh the since value of the pressence subscription...
	 * this is completly couppled, however pressence was removed without reason
	 * ...
	* @access       public
	* @param        username to refresh
	* @return       null
	* @todo         error handling? Maybe not, its in the listener loop
	*/
	public function refreshPressence($username) {
		$sql = ("UPDATE `subscriptions` SET `since` = '".time()."' WHERE `channel` = 'pressence' AND `who` = :who LIMIT 1;");
		$stmt = $this->db->prepare($sql);
		$this->db->execute($stmt, Array('who' => $username));
		
	}

	/**
	* Get All Channels
	* @access       public
	* @param        Optional String for the like query
	* @return       Array()
	* @todo         Best error handling in mysql_query
	*/
	public function getAllChannels($pattern = null) {
		$sql = "SELECT DISTINCT `channel` FROM `subscriptions`";
		if ($pattern) {
			$sql .= "WHERE `channel` LIKE '%:pattern%'";
			$stmt = $this->db->prepare($sql);
			$stmt = $this->execute($stmt, Array('pattern' => $pattern));
			
		} else {
			$stmt = $this->db->send($sql);
		}
		
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
	    $channels = array();
		if (count($results) == 0) {
			return $channels;
	    }
	    foreach ($results as $result) {
			//$channels[] = new BasicChannel($row['channel']);
			$channels[] = $result['channel'];
	    }
	    return $channels;
	}

	/**
	* Remove all subscriptions from user
	* @access       public
	* @param        string
	* @return       void
	* @todo         Best error handling in mysql_query
	*/
	public function removeAllSubscriptions($from) {
	    $sql = "DELETE FROM `subscriptions` WHERE `who` = :who";
	    $stmt = $this->db->prepare($sql);
		$this->db->execute($stmt, Array(
			'who' => $from
		));
	}

	/**
	* get subscriptions from user
	* @access       public
	* @param        string
	* @return       Boolean/Array()
	* @todo         return Array or void Array, never two types
	*/
	public function getSubscriptions($from) {
	    $sql = "SELECT * FROM `subscriptions` WHERE `who` = :who";
		$stmt = $this->db->prepare($sql);
	    $results = $this->db->execute($stmt, Array('who' => $from));

		$results = $results->fetchAll(PDO::FETCH_ASSOC);
	    if ($results && count($results) == 0) {
			return false;
	    }
	    $channels = array();
	    foreach ($results as $result) {
			$channels[] = new BasicChannel($result['channel']);
	    }
	    return $channels;
	}

	public function isUserConnected($user) {
		$limit = time()-30; //now minus 30 seconds of timeout
	    $sql = "SELECT * FROM `subscriptions` WHERE `channel` = 'pressence' AND `since` > ".$limit." AND `who` = :who";
	    $stmt = $this->db->prepare($sql);
		$results = $this->db->execute($stmt, Array('who' => $user));
		$results = $results->fetchAll(PDO::FETCH_ASSOC);
		
	    if (count($results) == 0) {
			return false;
	    }

		return true;
	}

	/**
	* get subscribers from channel
	* @access       public
	* @param        string
	* @return       Boolean/Array()
	* @todo         return Array or void Array, never two types
	*/
	public function getSubscribers($channel) {
	    $sql = "SELECT * FROM `subscriptions` WHERE `channel` = :channel";
	    $stmt = $this->db->prepare($sql);
		$results = $this->db->execute($stmt, Array('channel' => $channel));
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
	    if (count($results) == 0) {
			return false;
	    }
	    $channels = array();
	    foreach ($results as $result) {
			$channels[] = new BasicChannel($result['channel']);
	    }
	    return $channels;
	}

	/**
	* unsuscribe user from channel
	* @access       public
	* @param        string
	* @param        IChannel
	* @return       void
	*/
	public function unsubscribe($from, $channel) {
        $Logger = Logger::getLogger('system.Framework.NetSync.unsubscribe');
	    $sql = "DELETE FROM `subscriptions` WHERE `channel` = :channel AND `who` = :who";
		$stmt = $this->db->prepare($sql);
		$results = $this->db->execute($stmt, Array('channel' => $channel, 'who' => $from));
	}

	/**
	* subscribe user to channel
	* @access       public
	* @param        string
	* @param        IChannel
	* @return       void
	* @todo         return true or false
	*/
	public function subscribe($from, $channel) {
            $Logger = Logger::getLogger('system.Framework.NetSync.subscribe');
            $sql = "INSERT INTO `subscriptions` (`who` , `channel`, `since`) VALUES (:who, :channel,'".time()."')";
			$bindParam = Array(
				'who' => $from,
				'channel' => $channel
			);
			$stmt = $this->db->prepare($sql);
			$this->db->execute($stmt, $bindParam);
	}

    public function registerCallback($userFunction, $filename) {
            $Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
            $Logger->debug('SQLSubscriptionProvider registerCallback called with ' . $userFunction . " in filename: " . $filename);
            $sql = "INSERT INTO `netsyncHooks` (`callback` , `file`) VALUES (:callback, :filename)";
            $stmt = $this->db->prepare($sql);
			try {
				$this->db->execute($stmt, Array('callback' => $userFunction, 'filename' => $filename));
			} catch (Exception $e) {

			}
    }
}

?>
