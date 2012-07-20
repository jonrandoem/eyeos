<?php

class CometSqlMessageProvider implements ICometMessageProvider {
    private $db;

    public function  __construct() {
		$this->db = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);;
    }

    /**
    * write user message to channel
    * @access       public
    * @param        string
    * @param        IChannel
    * @param        string
    * @return       void
    * @todo         return must return true or false
    */
    public function write($from, IChannel $channel, $data) {
		$Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');

		$sql = "INSERT INTO `netsync_messages` (`id`, `from`, `to`, `data`, `timestamp`) VALUES (NULL, :from, :to, :data, " . time() . ")";

		//$Logger->debug($sql);
		$stmt = $this->db->prepare($sql);
		$this->db->execute($stmt, Array(
			'from' => $from,
			'to' => $channel->getName(),
			'data' => $data
		));
    }

    /**
    * read from channel
    * @access       public
    * @param        IChannel Array()
    * @param        string
    * @param        int
    * @return       false or Array()
    * @todo         return must return Array with data or void Array
    */
    public function read($channels, $from, $lastId = 0) {
        $Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
        $sql = 'SELECT `netsync_messages`.* FROM `netsync_messages` INNER JOIN subscriptions ON netsync_messages.timestamp >= subscriptions.since AND netsync_messages.to = subscriptions.channel AND subscriptions.who = :from WHERE `to` IN (';
		$bindParam = Array(
			'from' => $from
		);
		$i = 0;

        foreach($channels as $channel) {
            $sql .= " :channel" . $i . ",";
			$bindParam['channel' . $i++] = $channel->getName();
        }
		if (count($channels) > 0) {
			$sql = substr($sql, 0, -1);
			$sql .= ')';
		} else {
			$sql = substr($sql, 0, -5);
		}
        

            //@todo this is a test!
        $sql .= ' AND netsync_messages.id > '.$lastId;

		$stmt = $this->db->prepare($sql);
        $results = $this->db->execute($stmt, $bindParam);
        if (count($results) == 0) {
            return false;
        }

		return $results->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function clearOldMessages() {
        $sql ="DELETE FROM `netsync_messages` WHERE `netsync_messages`.`timestamp` < " . (time() - 300);
        $this->db->send($sql);
    }
}

?>