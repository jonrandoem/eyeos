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
 * takes care about splitting the searched string and
 * the tokens parameters, and check if the tokens
 * and the parameters are correct.
 */
class ParserManager {
    // Function: splits the searched string and the tokens parameters
    public function parseQuery (SearchQuery $obj, $searchedQuery) {
        $queryString = '';
        $queryTokens = array ();

        // Parsing the query splitting on " ", to recognize
        // a searched word and a token with his own parameters.
        $searchedQuery = explode (' ', $searchedQuery);

        // Analizying each parsed value, to set the $queryString and
        // the $queryTokens variables.
        foreach ($searchedQuery as $key => $value) {
        // cheking if ":" char is present or not.
            $finded = strpos ($value, ':');
            // if it is, means that we are looking at a token.
            if ($finded) {
            // matching the token from the query.
                $token = substr ($searchedQuery[$key], 0, $finded);
                // matching the parameters list from the query.
                $parameters = substr ($searchedQuery[$key], $finded+1,
                                        strlen( $searchedQuery[$key] )-1);
                // if the parameters list is not empty, we can build it.
                if (!empty ($parameters)) {
                    $parameters = explode (',', $parameters);

                    // creating an array with the token as key, and the
                    // parameters list as values.
                    $queryTokens = array_merge ((array) $queryTokens,
                                                array ($token => $parameters));
                }
                // and unset his value on the $searchedQuery struct.
                unset ($searchedQuery[$key]);
            }
            // if not, means that we are looking at a searched word.
            else {
            // in this case, we just merge the $parsedString with
            // the new searched word finded.
                if (empty ($queryString)) {
                    $queryString .= $value;
                }
                else {
                    $queryString .= ' ' . $value;
                }

                // and unset his value on the $searchedQuery struct.
                unset ($searchedQuery[$key]);
            }
        }

        // setting the $queryString and $queryTokens class variables.
        $obj->setQueryString ($queryString);
        $obj->setQueryTokens ($queryTokens);
    }

    // Function: checks if the tokens and the parameters are correct.
    public function checkTokens (SearchQuery $obj) {
        // first, we need to retrive all the available tokens.
        $availableTokens = $this->getAvailableTokens();

        // once we did that, we can analyze each token we've received in
        // queryTokens, and try to find if it matches one of the availables
        // token's module we have.
        $queryTokens = $obj->getQueryTokens();
        if ($queryTokens) {
            foreach ($queryTokens as $token => $parameters) {
                if (array_key_exists ($token, $availableTokens)) {
                    $tokenObj = new $availableTokens[$token] ($queryTokens[$token]);
                    $tokenObj->checkToken ($parameters);

                    if (! ($tokenObj->getIsValid())) {
                        unset ($queryTokens[$token]);
                    }
                }
                else {
                    unset ($queryTokens[$token]);
                }
            }
            $obj->setQueryTokens ($queryTokens);
        }
    }

    private function getAvailableTokens () {
        $tokens = array();

        // reading the directory's files.
        $directory = new DirectoryIterator (FRAMEWORK_SEARCH_TOKENS_PATH);

        // loading into $tokens all the valid Token Class files.
        foreach ($directory as $fileInfo) {
        // storing the file name into the variable.
            $className = $fileInfo->getFileName();

            // if the file is a valid *.php file, we parse its name,
            // to cut the ".php" and the "token" part.
            // i.e. : if the file name is "TokenType.php" we parse its name
            // so it becames "type". In that way it's easier to check if
            // a token is valid or not. (using the array_key_exists instead of loops)
            // to be even faster, we store in the array keys the value of the token name
            // (means the parsed string, without ".php" and "Token" part), and
            // in the array values the Class name, so we can call it without
            // rebuilding the string.
            if (!$fileInfo->isDot() && strpos ($className, '.php')) {
                $toRemove = strpos ($className, '.php');
                $className = substr ($className, 0, $toRemove);
                $tokenName = str_replace ('token', '', strtolower ($className));
                $tokens = array_merge ((array)$tokens, array( $tokenName => $className));
            }
        }
        return $tokens;
    }
}
?>