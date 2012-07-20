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
 * This class is the parent of all eyeos system specific exceptions that indicates
 * something wrong happened while processing a request or performing an operation.
 */
class EyeSystemException extends EyeException {}

	//
	//	BOOTSTRAP
	//
	
	class EyeBootstrapException extends EyeSystemException {}

	//
	//	SERVICES
	//

	class EyeServiceException extends EyeSystemException {}

		class EyeMetaDataException extends EyeException {}

			class EyeMetaDataCreationException extends EyeMetaDataException {}
			
			class EyeMetaDataDeletionException extends EyeMetaDataException {}
			
			class EyeMetaDataNotFoundException extends EyeMetaDataException {}
			
			class EyeMetaDataUpdateException extends EyeMetaDataException {}

		class EyeMMapException extends EyeServiceException {}
		
		class EyeProcException extends EyeServiceException {}
		
		class EyeSharingException extends EyeServiceException {}
		
			class EyeNoSuchSharedObjectException extends EyeSharingException {}
		
		class EyeUMException extends EyeServiceException {}
		
			class EyeInvalidPrincipalNameException extends EyeUMException {}
		
			class EyeNonEmptyGroupException extends EyeUMException {}
			
			class EyeNoSuchPrincipalException extends EyeUMException {}
		
				class EyeNoSuchUserException extends EyeNoSuchPrincipalException {}
			
				class EyeNoSuchGroupException extends EyeNoSuchPrincipalException {}
				
				class EyeNoSuchWorkgroupException extends EyeNoSuchPrincipalException {}
			
			class EyeNoSuchAssignationException extends EyeUMException {}
			
			class EyePrincipalAlreadyExistsException extends EyeUMException {}
		
				class EyeUserAlreadyExistsException extends EyePrincipalAlreadyExistsException {}
			
				class EyeGroupAlreadyExistsException extends EyePrincipalAlreadyExistsException {}
				
				class EyeWorkgroupAlreadyExistsException extends EyePrincipalAlreadyExistsException {}

	//
	//	FRAMEWORKS
	//

	class EyeFrameworkException extends EyeSystemException {}

		class EyeCalendarException extends EyeFrameworkException {}
		
			class EyeCalendarNotFoundException extends EyeCalendarException {}
			
			class EyeCalendarPrefsNotFoundException extends EyeCalendarException {}
			
			class EyeEventNotFoundException extends EyeCalendarException {}

		class EyeEventException extends EyeFrameworkException {}
		
			class EyeNoSuchHandlerException extends EyeEventException {}
		
		class EyePeopleException extends EyeFrameworkException {}
		
			class EyeNoSuchContactException extends EyePeopleException {}
	
			class EyePeopleUpdateException extends EyePeopleException {}
		
		class EyeTagException extends EyeFrameworkException {}
			
			class EyeNoSuchTagException extends EyeTagException {}
			
			class EyeTagAlreadyExistsException extends EyeTagException {}

	//
	//	MISC
	//
	
	class EyeHandlerFailureException extends EyeSystemException {}
	
	class EyeMissingConfigurationException extends EyeSystemException {}
	
	class EyeNotImplementedException extends EyeSystemException {}
	
?>