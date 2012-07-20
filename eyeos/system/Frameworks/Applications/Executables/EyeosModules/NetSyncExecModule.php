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
 * ExecModule for NetSync
 * @package     kernel-frameworks
 * @subpackage  Application
  */
define("USERCHANNEL_PREFIX", '@');

class NetSyncExecModule implements IEyeosExecutableModule {

    public function checkExecutePermission() {
            SecurityManager::getInstance()->checkExecute($this);
    }
    /**
    * internal subscribe function (don't use directly)
    *
    * @access        private
    * @param         string     $channel    Channel to Join-in
    * @param         string     $password   Password to use
    * @return        boolean    return true on success
    */
    private function _subscribe($channel, $password) {
        $mySender = new CometManager();
        return $mySender->subscribe($channel, $password);
    }
    
    /**
    * internal unsubscribe function (don't use directly)
    *
    * @access        private
    * @param         string     $channel    channel to unsubscribe
    * @param         string     $username   user to unsubscribe
    * @return        boolean    return true on success
    * @todo          mockup function
    */

    private function _unsubscribe( $channel) {
        $mySender = new CometManager();
        //$channelto = new BasicChannel($channel);
        return $mySender->unsubscribe( $channel);

    }

    /**
    * subscribe to a channel
    *
    * @access        public
    * @param         string     $channel    channel to subscribe
    * @return        boolean    return true on success
    * @todo          mockup function
    */
    public function subscribe($params) {
        //@todo filter $channel and $password
        $username = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
        
        // exists channel?
        if( empty($params['channel']) ) {
            return false;
        }

		//check to see if trying to join a user channel
		//and deny it
		if(substr($params['channel'], 0, strlen('eyeID_EyeosUser_')) == 'eyeID_EyeosUser_') {
			return false;
		}
		
        // exists password?
        if( empty($params['password']) ) {
            $params['password'] = null;
        }
        // bypass pressence channel password
        if ( 0 == strcmp('pressence' , $params['channel'] ) ) {
            $params['password'] = null;
        }

        // trying to register userchannel?
        if ( 0 == strcmp(USERCHANNEL_PREFIX . "userchannel", $params['channel'] ) ) { 
            $params['channel'] = $username;
        }
        // finaly register any public channel
        return $this->_subscribe($params['channel'], $params['password']);
    }

    /**
    * unsubscribe from channel
    *
    * @access        public
    * @param         string     $channel    channel to unsubscribe
    * @return        boolean    return true on success
    */
    public function unsubscribe($params) {
        //@todo filter $channel
        if( empty($params['channel']) ) {
            return false;
        }
        return $this->_unsubscribe( $params['channel']);
    }

    /**
    * send message to channel
    *
    * @access        public
    * @param         string     $channel    channel to send message
    * @param         string     $message    message to send
    * @return        boolean    return true on success
    * @todo          mockup function
    */
    public function send($message) {
        //@todo filter $channel and $message
        // $params['message']
        $messageInfo = json_decode($message, true);
        $message = new NetSyncMessage ($messageInfo['type'], $messageInfo['name'],
                $messageInfo['to'], $messageInfo['data']);
        
        $myCometSender = new CometSenderLongPolling();
        return $myCometSender->send($message);
    }
   
    /**
    * receive messages
    *
    * @access        public
    * @return        json
    * @todo          mockup function
    */
    public function receive() {       
        $myCometManager= new CometManager();
        /*
        $dataToEncode = array(
            'delayIfError' =>  $myCometManager->delayIfError(),
            'socketRecycleTimeout' =>  $myCometManager->socketRecycleTimeout(),
            'messages' => $myCometManager->listen($username)
            );
         */
        //$Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
        //$Logger->debug('data to send: ' . $data);
        //return json_encode();
        //
        return $myCometManager->listen();
    }

	/**
	 * getSubscribers
	 *
	 * @access		public
	 * @param		string     $channel
	 * @return		json
	 */
	public function getSubscribers($params) {
		if( empty($params['channel']) ) {
            return false;
        }
		$myCometManager = new CometManager();
		$channels = $myCometManager->getSubscribers($params['channel']);
		$allchannels = array ();
		foreach ($channels as $channel) {
			$allchannels[] = $channel->getAttributesMap();
		}
		//$Logger = Logger::getLogger('system.Frameworks.EyeosModules.NetSync');
		//$Logger->debug('channels: ' . $channels);
        return json_encode($allchannels);
	}
}
?>
