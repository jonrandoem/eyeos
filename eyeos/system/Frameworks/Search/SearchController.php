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
 * is the general controller of the Search Framework.
 * It uses the SearchQuery and the SearchManager classes to
 * create a valid SearchQuery Object with a given string and search it.
 * Example of usage:
 *	$searchController = new SearchController();
 *	$results = $searchController->search($query);
 */
class SearchController {
/**
 * Parses the $query into an SearchQuery Object, and send it to the
 * SearchManager Obect, which prepare and execute the search, and
 * returns the results.
 *
 * Example of returned value:
 *	<pre>
 *	array(
 *		'category' => array (
 *			'amount' => integer
 *			'results' => array ('type' => (string) $markup->type,
								'path' => (string) $markup->path,
								'name' => (string) $markup->name,
								'size' => (string) $markup->size)
 *		)
 *	)
 * </pre>
 *
 * FIXME: to be fixed using a generic Searchresult object.
 *
 *
 * @see SearchQuery
 * @see SearchManager
 * 
 * @param string $query
 * @return array $results
 */
	public function search($query) {
		$searchQuery = new SearchQuery();
		$searchQuery->parseQuery($query);

		$searchManager = new SearchManager();
		return $searchManager->search($searchQuery);
	}
}
?>