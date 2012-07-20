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

class SqlEventNotificationProvider implements IEventNotificationProvider {
	private $dao;

	function __construct () {
		$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}
	
	public function storeEventNotification(AbstractEventNotification $event) {
		try {
			$event->setEventData(serialize($event->getEventData()));
			$this->dao->create($event->getEventInformation());
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to store the event information', 0, $e);
		}
	}

	public function updateEventNotification (AbstractEventNotification $event) {
		try {
			$event->setEventData(serialize($event->getEventData()));
			$this->dao->update($event->getEventInformation());
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to update the event information', 0, $e);
		}
	}

	public function retrieveAllEventNotifications($from, $to) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$from = intval($from);
		$to = intval($to);

		if($from < 0 || $to < 0 || $from > $to) {
			return false;
		}

		$dbh = $this->dao;
		$stmt = $dbh->prepare('SELECT * FROM eventnotificationinformation WHERE receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to);
		$bindParam = Array(
			'receiver' => $currentUserId
		);
		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();

		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}

		return $toReturn;
	}

	public function retrieveAllEventNotificationsByType($type, $from, $to) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$from = intval($from);
		$to = intval($to);
		$type .= '%';
		if($from < 0 || $to < 0 || $from > $to) {
			return false;
		}

		$dbh = $this->dao;
		$stmt = $dbh->prepare('SELECT * FROM eventnotificationinformation WHERE type LIKE :type AND receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to);
		$bindParam = Array(
			'type' => $type,
			'receiver' => $currentUserId
		);
		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();

		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}

		return $toReturn;
	}

	public function retrieveAllEventNotificationsBySender($sender, $from, $to) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$from = intval($from);
		$to = intval($to);
		
		if($from < 0 || $to < 0 || $from > $to) {
			return false;
		}

		$dbh = $this->dao;
		if ($sender === 'me') {
			$stmt = $dbh->prepare('SELECT * FROM eventnotificationinformation WHERE sender = :sender AND receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to);
		} else if ($sender === 'other'){
			$stmt = $dbh->prepare('SELECT * FROM eventnotificationinformation WHERE sender != :sender AND receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to);
		}

		$bindParam = Array(
			'receiver' => $currentUserId
		);
		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();

		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}

		return $toReturn;
	}

	public function retrieveAllEventNotificationsByDate($numberDays, $from, $to) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$from = intval($from);
		$to = intval($to);

		if($from < 0 || $to < 0 || $from > $to) {
			return false;
		}

		$dbh = $this->dao;

		$date = getdate();
		$endDate = strtotime($date['mon'] . '/' . $date['mday'] . '/' . $date['year']) + (24 * 3600);

		switch($numberDays) {
			case 1:
				$startDate = strtotime($date['mon'] . '/' . $date['mday'] . '/' . $date['year']);
				break;
			case 2:
				$startDate = strtotime($date['mon'] . '/' . $date['mday'] . '/' . $date['year']) - (24 * 3600);
				break;
			case 7:
				$startDate = strtotime($date['mon'] . '/' . $date['mday'] . '/' . $date['year']) - ($date['wday'] * 24 * 3600);
				break;
			case 31:
				$startDate = strtotime($date['mon'] . '/' . $date['mday'] . '/' . $date['year']) - ($date['mday'] * 24 * 3600);
				break;
		}

		$stmt = $dbh->prepare('SELECT * FROM eventnotificationinformation WHERE creationdate BETWEEN :startdate AND :enddate AND receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to);
		$bindParam = Array(
			'startdate' => $startDate,
			'enddate' => $endDate,
			'receiver' => $currentUserId
		);
		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		
		$toReturn = array();

		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}

		return $toReturn;
	}

	public function retrieveAllEventNotificationsEnded($from, $to) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$from = intval($from);
		$to = intval($to);

		if($from < 0 || $to < 0 || $from > $to) {
			return false;
		}

		$dbh = $this->dao;
		$stmt = $dbh->prepare('SELECT * FROM eventnotificationinformation WHERE hasended != 0 AND receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to);
		$bindParam = Array(
			'receiver' => $currentUserId
		);
		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();

		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}

		return $toReturn;
	}

	public function retrieveAllEventNotificationsNotEnded($from, $to) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$from = intval($from);
		$to = intval($to);
		
		if($from < 0 || $to < 0 || $from > $to) {
			return false;
		}
		
		$query = 'SELECT * FROM eventnotificationinformation WHERE hasended != 1 AND receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to;
		$dbh = $this->dao;
		$stmt = $dbh->prepare($query);

		$bindParam = Array(
			'receiver' => $currentUserId
		);

		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();

		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}
		
		return $toReturn;
	}

	public function retrieveAllQuestionEvents($from, $to) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$from = intval($from);
		$to = intval($to);

		if($from < 0 || $to < 0 || $from > $to) {
			return false;
		}

		$query = 'SELECT * FROM eventnotificationinformation WHERE isquestion = 1 AND hasended = 0 AND receiver = :receiver ORDER BY creationdate DESC LIMIT ' . $from . ', ' . $to;
		$dbh = $this->dao;
		$stmt = $dbh->prepare($query);

		$bindParam = Array(
			'receiver' => $currentUserId
		);

		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();

		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}

		return $toReturn;
	}
	
	public function retrieveEventNotification($info) {
		try {
			$this->dao->read($info);
			$info->setEventData(unserialize($info->getEventData()));
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to fetch the event information', 0, $e);
		}
	}

	public function searchEvents (EyeosEventNotification $event) {
		$query = 'SELECT * FROM eventnotificationinformation WHERE 1=1 ';

		if($event->isQuestion()) {
			$query .= 'AND isquestion = :isquestion ';
		}

		if($event->getType()) {
			$query .= 'AND type = :type ';
		}

		if($event->getEventData()) {
			$query .= 'AND eventdata LIKE :eventdata ';
		}

		if($event->getSender()) {
			$query .= 'AND sender = :sender ';
		}

		if($event->getReceiver()) {
			$query .= 'AND receiver = :receiver ';
		}
		
		$dbh = $this->dao;
		$stmt = $dbh->prepare($query);

		$bindParam = Array();
		if($event->isQuestion()) {
			$bindParam['isquestion'] = $event->isQuestion();
		}

		if($event->getType()) {
			$bindParam['type'] = $event->getType();
		}

		if($event->getEventData()) {
			$eventData = '%' . $event->getEventData() . '%';
			$bindParam['eventdata'] = $eventData;
		}

		if($event->getSender()) {
			$bindParam['sender'] = $event->getSender();
		}

		if($event->getReceiver()) {
			$bindParam['receiver'] = $event->getReceiver();
		}

		$query .= 'ORDER BY creationdate ASC';

		$stmt = $dbh->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();
		
		foreach ($result as $entry) {
			$objectClass = new EventNotificationInformation();
			$row = new $objectClass;
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$row->setEventData(unserialize($row->getEventData()));
			$toReturn[] = $row;
		}

		return $toReturn;
	}

	public function deleteEventNotification($event) {
		try {
			$this->dao->delete($event->getEventInformation());
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to delete the event information', 0, $e);
		}
	}
}

?>