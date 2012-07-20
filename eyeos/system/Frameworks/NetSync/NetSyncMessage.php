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

class NetSyncMessage implements ISimpleMapObject {

    private $from;
    private $type;
    private $name;
    private $data;
    private $to;

    public function __construct($type, $name, $to, $data = null) {
        $currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
        $this->setFrom($currentUserId);

        if (!isset($type) || !is_string($type)) {
            throw new EyeInvalidArgumentException('Missing or invalid $type');
        }
        if (!isset($name) || !is_string($name)) {
            throw new EyeInvalidArgumentException('Missing or invalid $name');
        }
        if (!isset($to) || !is_string($to)) {
            throw new EyeInvalidArgumentException('Missing or invalid $to');
        }

        $this->setType($type);
        $this->setName($name);
        $this->setTo($to);

        if (isset($data)) {
            $this->setData($data);
        }
    }

    public function setType($type) {
        $this->type = $type;
    }
    public function getType() {
        return $this->type;
    }
    public function setName($name) {
        $this->name = $name;
    }
    public function getName() {
        return $this->name;
    }
    public function setData($data) {
        $this->data = $data;
    }
    public function getData() {
        return $this->data;
    }
    public function setTo($to) {
        $this->to = $to;
    }
    public function getTo() {
        return $this->to;
    }
    protected function setFrom($from) {
        $this->from = $from;
    }
    public function getFrom() {
        return $this->from;
    }

    public function getAttributesMap() {
        $result['from'] = $this->getFrom();
        $result['type'] = $this->getType();
        $result['name'] = $this->getName();
        $result['data'] = json_encode($this->getData());
        $result['to'] = $this->getTo();
        return json_encode($result);
    }
}
?>