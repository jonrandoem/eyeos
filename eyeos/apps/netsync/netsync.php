<?php

abstract class netsyncApplication extends EyeosApplicationExecutable {
    /*
     * ######################################################  PRIVATE INTERFACE
     */
    
    // nothing implemented
    
    /*
     * #######################################################  PUBLIC INTERFACE
     */

    /**
     * program entrypoint
     * 
     * @access public
     * @param AppExecutionContext $context
     * @param MMapResponse $response 
     */
    public static function __run(AppExecutionContext $context, MMapResponse $response) {
		$buffer = '';
		$basePath = EYE_ROOT . '/' . APPS_DIR . '/netsync/';
		$buffer .= file_get_contents($basePath . 'netsync.js');
		$response->appendToBody($buffer);

		//notify users about my new online status, i'm inside netsync!
		$peopleController = PeopleController::getInstance();
		//now we have the patch, lets apply it!
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$contacts = $peopleController->getAllContacts($currentUserId);
		$ids = array();
		$myCometSender = new CometSenderLongPolling();

		foreach($contacts as $contact) {
			$id = $contact->getRelation()->getSourceId();
			if($id == $currentUserId) {
				$id = $contact->getRelation()->getTargetId();
			}
			$message = new NetSyncMessage('status','online', $id, $currentUserId);
			$myCometSender->send($message);
		}
    }
}
?>
