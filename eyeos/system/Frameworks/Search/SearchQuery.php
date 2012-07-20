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

/*
 * This class has to take a query as input,
 * and return a query's string (the searched file name)
 * and a query's tokens array. (the searched token)
 */
class SearchQuery {

// Class Variables
    private $queryString;
    private $queryTokens;

    // Function: gets the queryString's value
    public function getQueryString() {
        return $this->queryString;
    }

    // Function: sets the queryString's value
    public function setQueryString ($queryString) {
        $this->queryString = $queryString;
    }

    // Function: gets the queryTokens array
    public function getQueryTokens () {
        return $this->queryTokens;
    }

    // Function: sets the queryTokens array
    public function setQueryTokens ($queryTokens) {
        $this->queryTokens = $queryTokens;
    }

    // Function: parses the query, and matches the tokens and the
    // searched words.
    public function parseQuery ($query) {
    // creating a parserManager Object, which takes care about
    // splitting the searched string and the tokens parameters
    // and check if the tokens and the parameters are correct.
        $parserManager = new ParserManager();

        // first of all we parse the query, so we can set the
        // queryString and the queryTokens variables in $obj.
        $parserManager->parseQuery ($this, $query);

        // once we have set the $queryString and the $queryTokens variables,
        // we analyze the tokens.
        $parserManager->checkTokens ($this);
    }
}
?>