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
* */

class PresenceManager implements IPresenceManager {
	private $provider;
	const timeInterval = 180;

	public function __construct() {
		$this->provider = new SQLPresenceProvider();

        //Every time we made a request we check the presence of zombies
        self::deleteZombies();
	}

	/**
	 * Notify to the System the user is connected
	 * 
	 * @param Presence $presence 
	 */
	public function ping (Presence $presence) {
		if (!isset($presence) || !$presence instanceof Presence) {
			throw new EyeInvalidArgumentException('Missing or invalid $presence');
		}

		$searchPresence = self::retrievePresencesByUsersId(array($presence->getUserId()));
		if ($searchPresence !== null && is_array($searchPresence) && count($searchPresence) == 1) {
			$searchPresence = current($searchPresence);
			$searchPresence->setLastSeen($presence->getLastSeen());
			
			$this->getProvider()->updatePresence($searchPresence);
		} else {
			$this->getProvider()->storePresence($presence);
			$this->notifyNewPresence($presence);
		}
    }


    protected function notifyNewPresence ($presence) {
        $userId = $presence->getUserId();

        $peopleController = PeopleController::getInstance();
        $contacts = $peopleController->getAllContacts($userId);

        foreach($contacts as $contact) {
            if ($contact->getRelation()->getSourceId() != $userId) {
                $contactId = $contact->getRelation()->getSourceId();
            } else {
                $contactId = $contact->getRelation()->getTargetId();
            }

            $NetSyncMessage = new NetSyncMessage('presence', 'userConnect', $contactId, $userId);
            NetSyncController::getInstance()->send($NetSyncMessage);
        }
        
		
	}

	protected function notifyClosedPresence ($presence) {
		$userId = $presence->getUserId();

		$peopleController = PeopleController::getInstance();
		$contacts = $peopleController->getAllContacts($userId);

		foreach($contacts as $contact) {
			if ($contact->getRelation()->getSourceId() != $userId) {
				$contactId = $contact->getRelation()->getSourceId();
			} else {
				$contactId = $contact->getRelation()->getTargetId();
			}
            $NetSyncMessage = new NetSyncMessage('presence', 'userDisconnect', $contactId, $userId);
            NetSyncController::getInstance()->send($NetSyncMessage);
        }
	}

	/**
	 * Notify to the System the user is disconnected
	 *
	 * @param Presence $presence
	 */
	public function close (Presence $presence) {
		if (!isset($presence) || !$presence instanceof Presence) {
			throw new EyeInvalidArgumentException('Missing or invalid $presence');
		}

        //var_dump($presence->getUserId());
        $searchPresence = self::retrievePresencesByUsersId(array($presence->getUserId()));
		if ($searchPresence !== null && is_array($searchPresence) && count($searchPresence) == 1) {
            $searchPresence = current($searchPresence);
           // var_dump($searchPresence);
            $this->getProvider()->deletePresence($searchPresence);
            $this->notifyClosedPresence($searchPresence);
        }
		
	}
	
	/**
	 * Retrieve an array of presences providing his usersIds
	 *
	 * @param array(
	 *  Presence $presence
	 * )
	 */
	public function retrievePresencesByUsersId ($usersId) {
		if (!isset($usersId) || !is_array($usersId)) {
			throw new EyeInvalidArgumentException('Missing or invalid $usersId');
		}

		return $this->getProvider()->retrievePresencesByUsersId($usersId);
	}

    /**
	 * Retrieve an array of presences providing his usersIds
	 *
	 * @param array(
	 *  Presence $presence
	 * )
	 */
	public function checkPresenceByUserId ($userId) {
		if (!isset($userId) || !is_string($userId)) {
			throw new EyeInvalidArgumentException('Missing or invalid $userId');
		}

		$results = self::checkPresencesByUsersId(Array($userId));
        return $results[$userId];
	}

    /**
	 * Check the presence of zombies and delete it.
     * A zombies is a user that is not online anymore
	 *
	 * @param array(
	 *  Presence $presence
	 * )
	 */
	protected function deleteZombies () {
		$presences = $this->getProvider()->retrieveAllPresences();

		foreach ($presences as $presence) {
			if (((time() - $presence->getLastSeen()) > self::timeInterval)) {
				$this->close($presence);
			}
		}

	}

	/**
	 * Check the presence of the users specified in the last $timeInterval seconds.
	 *
	 * @param array $usersId Array of strings
	 * @param integer $timeInterval Optional number of seconds after a user is consired disconnected
	 * 
	 * @return array(
	 *  userId => true/false
	 * )
	 */
	public function checkPresencesByUsersId($usersId, $timeInterval = self::timeInterval) {
		$presences = self::retrievePresencesByUsersId($usersId);

		$return = array();
		foreach ($usersId as $userId) {
			$return[$userId] = 'false';
		}

		foreach ($presences as $presence) {
			if (((time() - $presence->getLastSeen()) <= $timeInterval)) {
				$return[$presence->getUserId()] = 'true';
			}
		}

		return $return;
	}

	private function getProvider() {
		return $this->provider;
	}
}
?>
