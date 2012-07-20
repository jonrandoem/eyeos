<?php

class SqlChannelProvider implements IPasswordChannelProvider {
    private $db;

    /**
    * Constructor of SqlChannelProvider
    * @access       public
    * @todo         best error handling
    * @todo         pass database link with paramether, don't use global
    */
    public function  __construct() {
	    $this->db = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
    }

    /**
    * get channel descriptor
    * @access       public
    * @param        string
    * @return       BasicChannel instance 
    */
    public function getChannel($name) {
	//we don't need anything from the database in this basic implementation
	//so this is a factory of BasicChannels
	return new BasicChannel($name);
    }

    /**
    * get password from channel
    * @access       public
    * @param        IChannel
    * @return       false or string
    * @todo         Return string or void string '', never two different types.
    */
	public function getPassword(IChannel $channel) {
		$channelName = $channel->getName();

		$sql = "SELECT `password` FROM `channels` WHERE `channel` = :channel";
		$stmt = $this->db->prepare($sql);

		$stmt = $this->dao->execute($stmt, Array(
					'channel' => $channel
				));
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if (count($results) > 0) {
			$row = $results[0];
			return $row['password'];
		}
		return false;
	}
}

?>