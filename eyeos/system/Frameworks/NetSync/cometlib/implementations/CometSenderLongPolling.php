<?php

class CometSenderLongPolling implements ICometSender {
    private $db;

    public function  __construct() {

    }

    private function callHooks($messages) {
			$mySubscriptionProvider = new SqlSubscriptionProvider();
            $hooks = $mySubscriptionProvider->getHooks();
            $Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
            foreach ($hooks as $oneHook) {
                $Logger->debug("Next hook to call:" . $oneHook['file'] . ":> " . $oneHook['callback']);
                require_once($oneHook['file']);
                if ( is_callable($oneHook['callback']) ) {
                    $messages = call_user_func($oneHook['callback'], $messages);
                }
                else {
                    $Logger->error("Function declared in hooks: \"" . $oneHook['callback'] . "\" is not callable!");
                }
            }
            return $messages;
    }
    
    //public function send($from, IChannel $channel, $data) {
    public function send(NetSyncMessage $message) {
        $myProcManager = ProcManager::getInstance();
        $username = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
        $channel = new BasicChannel($message->getTo());
        $messageProvider = new CometSqlMessageProvider();
        $message = $this->callHooks($message);
        $messageProvider->clearOldMessages();

        $messageProvider->write($username, $channel, $message->getAttributesMap());

        //control errors?
        return true;
    }

    public function subscribe($channel, $password = null) {
        $myProcManager = ProcManager::getInstance();
        $username = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
        $subscriptionProvider = new SqlSubscriptionProvider();

        //$toChannel = new BasicChannel($channel);
        //$toChannel->setPassword($password);
        //if($toChannel->checkAccess()) {
                $this->unsubscribe($channel);
                $subscriptionProvider->subscribe($username, $channel);
            return true;
        //} else {
        //    return false;
        //}
    }

    public function unsubscribe($channel) {
        $myProcManager = ProcManager::getInstance();
        $username = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
        $subscriptionProvider = new SqlSubscriptionProvider();
        return $subscriptionProvider->unsubscribe($username, $channel);
    }

    public function registerCallback($userFunction, $filename) {
        $subscriptionProvider = new SqlSubscriptionProvider();
        return $subscriptionProvider->registerCallback($userFunction, $filename);
    }

	public function getAllChannels($pattern) {
		$subscriptionProvider = new SqlSubscriptionProvider();
		return $subscriptionProvider->getAllChannels($pattern);
	}
}

?>