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

class MediaConverter {
	//Folder for save converted files
	private $outputPath = null;
	//Path of the converted file
	private $pathOutputFile = null;
	//Hash of the file
	private $hash = null;

	/**
	 *	Try the most efficient converter for each case
	 * @param:	string	$fileName	path of the file
	 * @param:	string	$format		output codec wanted
	 * @param:	bool	$forceReConvert	[true/FALSE] true if not wan't to check for previous versions of the conversion
	 * @uses:
	 *	ffmpeg, faac, mencoder, gpac, zenity, VLC, libavcodec-extras-52
	 * @todo:
	 *	->	file_exists check don't work
	 * @return:	string	path of the output file
	 *
	 */
	public function Convert($fileName, $format, $forceReConvert = false) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}
		if (!isset($format) || !is_string($format)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $format');
		}
		Logger::getLogger('MediaConverter')->debug('MediaConverter->Convert Start');
		$format = strtoupper($format);
		//Check if is a eyeOS path or absolute path directly
		$myFile = FSI::getFile($fileName);
		if (method_exists ( $myFile , 'getRealFile' )) {
			$myFile->checkReadPermission();
			$fileName = AdvancedPathLib::getPhpLocalHackPath($myFile->getRealFile()->getAbsolutePath());
		}

//		if(!file_exists($fileName)) {
//			throw new EyeFileNotFoundException('Missing or invalid file: '.$fileName);
//		}

		//Fill the class vars
		self::CreateVars($fileName,$format);

		//No time limit & write session data and end session
		set_time_limit(0);
		session_write_close();

		//Check if the file it's converted before
		if(!$forceReConvert && file_exists($this->pathOutputFile)) {
			Logger::getLogger('MediaConverter')->debug('File exist for previous convert in path: '.$this->pathOutputFile);

		} else {
			//Call the proper converter
			if($format == 'MP4') {
				return self::video2mp4($fileName);
			} else if($format == 'JPG') {
				return self::video2jpg($fileName);
			} else if($format == 'FLV') {
				return self::ConvertFLV($fileName);
			} else if($format == '3GP') {
				return self::ConvertH263($fileName);
			} else {
				return self::ConvertVLC($fileName, $format);
			}
		}
		return $this->pathOutputFile;
	}

	/**
	 *	Use video2mp4-nogui.sh
	 * @param:	string	$fileName	path of the file
	 * @uses:
	 *	->	ffmpeg	->	Extract audio to wav
	 *	->	faac	->	For convert wav to m4a
	 *	->	mencoder->	For convert the video
	 *	->	gpac	->	The mp4's that ffmpeg generates are slightly nonstandard, MP4Box apply a correction to the video
	 *	->	zenity	->	Optional, included in gnome by default
	 * @todo:
	 *	->	change $scriptPath hardcored folder for something more reusable
	 *  ->	rename error: No such file or directory, but the file it's moved correctly
	 * @return:
	 *	string	path of the output file
	 */
	private function video2mp4($fileName) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}

		$scriptPath = FRAMEWORKS_PATH . '/Converter/';
		$cmd = $scriptPath.'video2mp4-nogui.sh '.escapeshellarg($fileName);
		Logger::getLogger('MediaConverter::video2mp4')->debug('$cmd: '.$cmd);
		try {
			shell_exec('LANG=en_US.utf-8;' . $cmd);
		} catch (Exception $e) {
			throw new EyeException('Error from MediaConverter::video2mp4 with command: '.$cmd.' with the error: '.$e);
		}

		$oldName = $fileName . '.mp4';
		Logger::getLogger('MediaConverter::video2jpg')->debug('MediaConverter moving from: '.$oldName.' to '.$this->pathOutputFile);
		//Move the file
		//@todo: rename error: No such file or directory, but the file it's moved correctly
		if(!rename($oldName, $this->pathOutputFile)) throw new EyeAccessControlException('MediaConverter can move the file from: '.$oldName.' to '.$this->pathOutputFile);
		Logger::getLogger('MediaConverter::video2mp4')->debug('conversion done!');
		return $this->pathOutputFile;
	}

	/**
	 * Use ffmpeg for return the first picture of a video
	 * @param:	string	$fileName	path of the file
	 * @uses:
	 *	->	ffmpeg
	 * @todo:
	 *	->	return the image of the center of the video with something like this:
	 *
	 *		$seconds = ffmpeg -i '.$fileName.' 2>&1 | grep "Duration" | cut -d " " -f 4 - | sed s/,//
	 *		OR
	 *		with a PHP script from http://www.longtailvideo.com/support/forums/jw-player/setup-issues-and-embedding/9448/how-to-get-video-duration-with-ffmpeg-and-php
	 * 
	 *		and add in the $cmd
	 *		-itsoffset '.($seconds/2).'
	 * @return:
	 *	string	path of the output file
	 */
	private function video2jpg($fileName) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}

		$cmd = 'ffmpeg -y -i ' . escapeshellarg($fileName) . ' -vcodec mjpeg -vframes 1 -an -f rawvideo -s 320x240 -itsoffset 00:00:05 '.escapeshellarg($this->pathOutputFile);
		Logger::getLogger('MediaConverter::video2jpg')->debug('$cmd: '.$cmd);
		try {
			shell_exec('LANG=en_US.utf-8;' . $cmd);
		} catch (Exception $e) {
			throw new EyeException('Error from MediaConverter::video2jpg with command: '.$cmd.' with the error: '.$e);
		}
		return $this->pathOutputFile;
	}

	/**
	 * Use ffmpeg for convert the video to flv format
	 * @param:	string	$fileName	path of the file
	 * @uses:
	 *	->	ffmpeg
	 *	->	flvtool2	->	Streaming requires that your FLV has embedded keyframe markers (meta-data)
	 * @return:
	 *	string	path of the output file
	 */
	private function ConvertFLV($fileName) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}

		$cmd = 'ffmpeg -y -i ' . escapeshellarg($fileName) . ' -ab 32 -ar 22050 -f flv -acodec libmp3lame '. escapeshellarg($this->pathOutputFile).';flvtool2 -U '.escapeshellarg($this->pathOutputFile);
		Logger::getLogger('MediaConverter::ConvertFLV')->debug('$cmd: '.$cmd);
		try {
			shell_exec('LANG=en_US.utf-8;' . $cmd);
		} catch (Exception $e) {
			throw new EyeException('Error from MediaConverter::ConvertFLV with command: '.$cmd.' with the error: '.$e);
		}
		Logger::getLogger('MediaConverter::ConvertFLV')->debug('conversion done!');
		return $this->pathOutputFile;
	}

	/**
	 * Use ffmpeg to convert a file optimous for Android, actually not working well
	 * @uses
	 *	->	ffmpeg
	 * @param:
	 *	$fileName	string	Path of the name to convert
	 * @return
	 *	string	path of the converted file
	 * @todo
	 *	All, find a proper codec that Android can reproduce, inclusive Android 2.0
	 */
	private function ConvertH263($fileName) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}
		$cmd = 'ffmpeg -y -i ' . escapeshellarg($fileName) . ' -vcodec mpeg4 -r 15 -s 480x320  -acodec aac -ac 1 -ar 16000 -ab 32000 '.escapeshellarg($this->pathOutputFile);
//		$cmd = 'ffmpeg -y -i ' . escapeshellarg($fileName) . ' -vcodec mpeg4 -r 15 -b 700k -acodec aac -ac 2 -ar 32000 -ab 64000 -strict experimental -f 3gp '.escapeshellarg($this->pathOutputFile);
		Logger::getLogger('MediaConverter::ConvertFLV')->debug('$cmd: '.$cmd);
		try {
			shell_exec('LANG=en_US.utf-8;' . $cmd);
		} catch (Exception $e) {
			throw new EyeException('Error from MediaConverter::ConvertFLV with command: '.$cmd.' with the error: '.$e);
		}
		Logger::getLogger('MediaConverter::ConvertFLV')->debug('conversion done!');
		return $this->pathOutputFile;		
	}

	/**
	 * Use VLC for transcode the file, actually not in use
	 * @param:
	 *	$fileName	string	Path of the name to convert
	 * @param:
	 *	$format		string	Extension desired {OGV,MOV,MP3,OGG,M4A,WAV}
	 * @uses:
	 *	-> VLC
	 *	-> format == MOV	->	libavcodec-extras-52
	 *	-> format == MP3 & FLV	->	ffmpeg
	 * @see:
	 *	http://wiki.videolan.org/Transcode
	 *  http://wiki.videolan.org/VLC_command-line_help
	 *	http://wiki.videolan.org/Documentation:Streaming_HowTo_New
	 * @todo:
	 *	-> Broadcast the file until its not converted, something like this:
	 *		cvlc --play-and-exit --sout "#transcode{acodec='. $acodec .',vcodec='.$vcodec.',vb='.$vb.',ab='.$ab.',samplerate='.$samplerate.',fps='.$fps.',scale=1}
	 *		:duplicate{
	 *			dst='std{access=http,mux='.$mux.',dst=127.0.0.1:8080}',
	 *			dst='std{access=file,mux='.$mux.',dst=OUTPUTFILE}'
	 *		}" INPUTFILE
	 * @return:
	 *	string	path of the converted file
	 */
	private function ConvertVLC($fileName, $format) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}
		if (!isset($format) || !is_string($format)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $format');
		}

		$vcodec = $acodec = $mux = NULL;
		$video = false;
		//Predefined vars: ¿useful for all devices or it has to be variable?
		$vb = 256;
		$ab = 96;
		$fps = 25;
		$samplerate = 22050;

		//VIDEO
		if($format == 'OGV') {
			$vcodec = 'theora';
			$acodec = 'vorb';
			$mux = 'ogg';
			$video = true;
		} else if($format == 'MOV') {
			$vcodec = 'h264';
			$acodec = 'mp4a';
			$mux = 'mp4';
			$video = true;
		} else if($format == 'FLV') {
			$vcodec = 'FLV1';
			$acodec = 'mp3';
			$mux = 'ffmpeg';
			$video = true;

		} else if($format == '3GP') {
			$vcodec = 'h263';
			$acodec = 'mp4a';
			$ab = 24;
			$mux = 'mp4';
			$video = true;
			
		//AUDIO
		} else if($format == 'MP3') {
			$acodec = 'mp3';
			$mux = 'dummy';
		} else if($format == 'OGG') {
			$acodec = 'vorb';
			$mux = 'ogg';
		} else if($format == 'M4A') {
			$acodec = 'mp4a';
			$mux = 'mp4';
		} else if($format == 'WAV') {
			//acodec can be: dummy,s16l,fl32
			$acodec = 'dummy';
			$mux = 'wav';
		} else {
			throw new EyeNotImplementedException('Transcode format not implemented');
		}

		if ($video) {
			$cmd = 'cvlc --play-and-exit --sout "#transcode{acodec='. $acodec .',vcodec='.$vcodec.',vb='.$vb.',ab='.$ab.',samplerate='.$samplerate.',fps='.$fps.',scale=1}:std{access=file,mux='.$mux.',dst='.escapeshellarg($this->pathOutputFile).'}" '.escapeshellarg($fileName);
		} else {
			$cmd = 'cvlc --play-and-exit --no-video --sout "#transcode{acodec='. $acodec .',ab='.$ab.',samplerate='.$samplerate.'}:std{access=file,mux='.$mux.',dst='.escapeshellarg($this->pathOutputFile).'}" '.escapeshellarg($fileName);
		}
		Logger::getLogger('MediaConverter::ConvertVLC')->debug('Transcoding with command: '.$cmd);

		try {
			shell_exec('LANG=en_US.utf-8;' . $cmd);
			
//			$cmdOutput = NULL;
//			exec($cmd, $cmdOutput);
//			Logger::getLogger('MediaConverter::ConvertVLC')->debug('Transcoding stoudt: '.$cmdOutput);
		} catch (Exception $e) {
			throw new EyeException('Error from MediaConverter::ConvertVLC with command: '.$cmd.' with the error: '.$e);
		}
		Logger::getLogger('MediaConverter::ConvertVLC')->debug('conversion done!');
		return $this->pathOutputFile;
	}

	private function CreateVars($fileName, $format) {
		self::CreateOutputPath($fileName);
		self::CreateHash($fileName,$format);
		self::CreatePathOutputFile($format);
	}

	/**
	 * Modify the path of the file to the output folder
	 * @param	string	$fileName	original path of the file
	 */
	private function CreateOutputPath($fileName) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}

		//Home of the user
		$to = 'home:///';
		//then, check the destination file
		$myFileDest = FSI::getFile($to);
		$myFileDest->checkWritePermission();
		$myRealFile = $myFileDest->getRealFile();
		$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());

		if(!file_exists($fileNameDestination . '/.office/')) {
		    mkdir($fileNameDestination . '/.office/');
		}

		if(!file_exists($fileNameDestination . '/.office/.media/')) {
		    mkdir($fileNameDestination . '/.office/.media/');
		}

		$this->outputPath = $fileNameDestination . '/.office/.media/';

	}

	private function CreateHash($fileName, $format) {
		if (!isset($fileName) || !is_string($fileName)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $fileName');
		}
		if (!isset($format) || !is_string($format)) {
			throw new EyeInvalidArgumentException('Missing or invalid param $format');
		}
		Logger::getLogger('MediaConverter::CreateHash')->debug('$fileName: '.$fileName.' with format: '.$format);
		$this->hash = md5(md5_file($fileName).'/'.$format);
		Logger::getLogger('MediaConverter::CreateHash')->debug('$this->hash of file '.$fileName.' with format '.$format.' is '.$this->hash);
	}

	private function CreatePathOutputFile($format) {
		if(!isset($format) || !is_string($format)) throw new EyeInvalidArgumentException('Missing or invalid param $format');
		if(!isset ($this->hash) || !isset ($this->outputPath)) throw new EyeLogicException('Hash or outputPath not defined');
		$folder = $this->outputPath . $this->hash . '/';
		if(!file_exists($folder)) {
		    mkdir($folder);
		}
		//Hack for iOS -> don't accept mp4 files
//		if($format == 'MP4') $format = 'MOV';
		$this->pathOutputFile = $folder . $this->hash . '.'. strtolower($format);
	}
}
?>