<?php

require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/AbstractChannel.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/IChannel.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/IChannelProvider.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/IChannelSecurityChecker.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/ICometListener.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/ICometManager.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/ICometMessageProvider.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/ICometSender.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/IPasswordChannel.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/IPasswordChannelProvider.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/interfaces/ISubscriptionProvider.php');

require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/implementations/BasicChannel.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/implementations/ChannelPasswordSecurityChecker.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/implementations/CometListenerLongPolling.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/implementations/CometSenderLongPolling.php');
require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/implementations/Pressence.php');

require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/channelproviders/SqlChannelProvider.php');

require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/messageproviders/CometSqlMessageProvider.php');

require_once(FRAMEWORK_NETSYNC_PATH . '/cometlib/subscriptionproviders/SqlSubscriptionProvider.php');


class CometManager implements ICometManager {
	private $db;
	
        /**
        * Constructor of CometManager
        * @access       public
        * @todo         best error handling
        * @todo         pass database link with paramether, don't use global
        */
	public function  __construct() {
	    $this->db = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

        /**
        * Listen for new comet messages
        * @access       public
        * @param        string
        * @return       Array()
        */
	public function listen() {
        $Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
	    $myCometListener = new CometListenerLongPolling();
        $data = $myCometListener->listen($this);
	    return $data;
	}
	
        /**
        * Send new comet messages
        * @access       public
        * @param        string
        * @param        IChannel
        * @param        string
        * @return       void
        * @todo         Best error handling in $myCometSender->send
        */
	public function send(NetSyncMessage $message) {
	    $myCometSender = new CometSenderLongPolling();
	    return $myCometSender->send($message);
	}

		/**
		* Get all the user subscriptions to a given channel
		* @access	public
		* @param	string
		* @return	array
		**/
	public function getSubscriptions($channel) {
		$myProvider = new SqlSubscriptionProvider();
		return $myProvider->getSubscriptions($channel);
	}

		/**
		* Using the pressence timestamp, determines if a user is online or not
		* @access	public
		* @param	string
		* @return	array
		**/
	public function isUserConnected($user) {
		$myProvider = new SqlSubscriptionProvider();
		return $myProvider->isUserConnected($user);
	}

		/**
		* Get all the subscribers to a given channel
		* @access	public
		* @param	string
		* @return	array
		**/
	public function getSubscribers($channel) {
		$myProvider = new SqlSubscriptionProvider();
		return $myProvider->getSubscribers($channel);
	}

		/**
		* Get all the channels with an optional pattern
		* @access	public
		* @param	Optional String
		* @return	array
		**/
	public function getAllChannels($pattern) {
		$myProvider = new SqlSubscriptionProvider();
		return $myProvider->getAllChannels($pattern);
	}

        /**
        * Susbcribe to comet channels
        * @access       public
        * @param        string
        * @param        IChannel
        * @return       boolean
        */
	public function subscribe($channel, $password) {
            $Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
	    $myCometSender = new CometSenderLongPolling();
	    return $myCometSender->subscribe($channel, $password);
	}

        /**
        * Unsusbcribe to comet channels
        * @access       public
        * @param        string
        * @param        IChannel
        * @return       void
        */
	public function unsubscribe($channel) {
	    $myCometSender = new CometSenderLongPolling();
	    return $myCometSender->unsubscribe($channel);
	}

        /**
        * Start comet session
        * @access       public
        * @param        string
        * @return       void
        * @todo         Best error handling on subscription
        * @todo         Don't create local provider, share with all class
        */
        /*
	public function startSession($from) {
	    $myProvider = new SqlSubscriptionProvider();
	    $myProvider->removeAllSubscriptions($from);
	}
        */
        /**
        * End comet session
        * @access       public
        * @param        string
        * @return       void
        * @todo         Best error handling on session logout
        */
        /*
	public function endSession($from) {
	    $myPressence = new Pressence();
	    $myPressence->markOffline($from);
            $myProvider = new SqlSubscriptionProvider();
	    $myProvider->removeAllSubscriptions($from);
	}
        */
        /**
        * Get server delay if error
        * @access       public
        * @return       int
        * @todo         this is a mockup function
        */
        public function delayIfError() {
			//@todo var this value depending the server load
            return 5000;
        }
        /**
        * Server set the client timeout for comet connection
        * @access       public
        * @return       int
        * @todo         this is a mockup function
        */
        public function socketRecycleTimeout() {
			//@todo var this value depending the server load
            return 10000;
        }
        
        /**
        * register application callback when message is sended
        * @access       public
        * @param        string
        * @param        string
        * @return       void
        */
    public function registerCallback($userFunction, $filename) {
        $Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
        $Logger->debug("Registering callback: " . $filename . ":" . $userFunction);

        $myCometSender = new CometSenderLongPolling();
        return $myCometSender->registerCallback($userFunction, $filename);
    }

}

?>
