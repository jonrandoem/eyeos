<?php

class CometListenerLongPolling implements ICometListener {

	private $lastId = 0;

	public function __construct() {
		if (!isset($_SESSION['comet']) || !isset($_SESSION['comet']['lastid'])) {
			$_SESSION['comet']['lastid'] = 0;
		}
		$this->lastId = $_SESSION['comet']['lastid'];
	}

	public function listen($manager) {
		$userId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$username = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getName();
		$subscriptionProvider = new SqlSubscriptionProvider();

		if ($subscriptionProvider->getSubscriptions($userId) == false) {
			/**
			 * User try to listen message, but for same reason (connection problem, logout)
			 * netSync delete subscriptions to this user.
			 *
			 * Stop LongPolling and notify client
			 */
			echo "forceRefresh";

			exit;
		}

		//$myPressence = new Pressence();
		//$myPressence->markOnline($username, $manager);
		session_write_close();
		set_time_limit(0);
		ignore_user_abort(1);
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');
		$Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
		//one of every 20 loops, will update the pressence time
		//but the first one, should do it ever
		$loop = 20;
		while (1) {
			try {
				echo "\n";
				ob_flush();
				flush();
				if (connection_status() != CONNECTION_NORMAL) {
					//Maybe user gone offline
					sleep(35);
					//Check if user is still connected
					if (!$subscriptionProvider->isUserConnected($userId)) {
						// if not notify to all contacts
						$contacts = PeopleController::getInstance()->getAllContacts($userId);
						$ids = array();
						$myCometSender = new CometSenderLongPolling();
						foreach ($contacts as $contact) {
							$id = $contact->getRelation()->getSourceId();
							if ($id == $userId) {
								$id = $contact->getRelation()->getTargetId();
							}
							$message = new NetSyncMessage('status', 'offline', $id, $userId);
							//TODO24 ultra hardcoded, we need some kind of php listeners here!
							$myCometSender->send($message);
						}
						shell_exec('rm -rf ' . escapeshellarg(EYE_ROOT . '/' . USERS_DIR . '/' . utf8_basename($username) . '/files/.office/'));
						$subscriptionProvider->removeAllSubscriptions($userId);
					}
					exit;
				}

				if ($loop == 20) {
					$mySubscriptionProvider = new SqlSubscriptionProvider();
					$mySubscriptionProvider->refreshPressence($userId);
					$loop = 0;
				} else {
					$loop++;
				}


				$mySubscriptionProvider = new SqlSubscriptionProvider();
				$channels = $mySubscriptionProvider->getSubscriptions($userId);
				$messageProvider = new CometSqlMessageProvider();
				if (is_array($channels)) {
					$messages = $messageProvider->read($channels, $userId, $this->lastId);
					if (is_array($messages) && count($messages) > 0) {
						@session_start();
						usort($messages, "customMessageComparation");
						$_SESSION['comet']['lastid'] = $messages[count($messages) - 1]['id'];
						//$Logger->debug("last message id: " . $_SESSION['comet']['lastid']);
						//@todo use pseudo-random-related-to-tableid or something as transaction ID, no a id of table
						return $messages;
					}
				}
				sleep(1);
			} catch (Exception $e) {
				$logger = Logger::getLogger('netsync');
				$logger->fatal('Exception in netsync!');
				$logger->fatal(ExceptionStackUtil::getStackTrace($e, false));
				exit;
			}
		}
	}

}

function customMessageComparation($a, $b) {
	if ($a['id'] == $b['id']) {
		return 0;
	}
	return ($a['id'] < $b['id']) ? -1 : 1;
}

?>