<?php

define('TESTS_FSI_LOCALFILE_TMP_PATH', EYEOS_TESTS_TMP_PATH);

class LocalFileTest extends PHPUnit_Framework_TestCase {
	private $fixture_file;
	private $fixture_dir;

	public function setUp() {
		$this->fixture_dir = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir');
		if (!is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir')) {
			mkdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir', 0777, true);
		}
		$this->fixture_file = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext');
		file_put_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext', 'some content');
	}

	public function tearDown() {
		unset($this->fixture_file);
		unset($this->fixture_dir);
		AdvancedPathLib::rmdirs(TESTS_FSI_LOCALFILE_TMP_PATH);
	}
	
	public function testChgrp() {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			$this->markTestSkipped('chgrp() is not available on Windows.');
		}
		chmod(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext', 0777);
		$this->assertNotEquals(1001, filegroup(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));		
		$this->assertTrue($this->fixture_file->chgrp(1001));
		clearstatcache();
		$this->assertEquals(1001, filegroup(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
	}
	
	public function testChmod() {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			$this->markTestSkipped('chmod() is not available on Windows.');
		}
		$this->assertNotEquals('-rwxr-xr--', AdvancedPathLib::permsToUnix(fileperms(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext')));		
		$this->assertTrue($this->fixture_file->chmod(0754));
		clearstatcache();
		$this->assertEquals('-rwxr-xr--', AdvancedPathLib::permsToUnix(fileperms(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext')));
	}
	
	public function testChown() {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			$this->markTestSkipped('chown() is not available on Windows.');
		}
		
		//
		// Unable to check that without running phpunit as 'root'
		//
		
		/*chmod(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext', 0777);
		$this->assertNotEquals(1001, fileowner(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));		
		$this->assertTrue($this->fixture_file->chown(1001));
		clearstatcache();
		$this->assertEquals(1001, fileowner(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));*/
	}
	
	public function testCopyTo() {
		//copy to file
		if (is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext.copy')) {
			unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext.copy');
		}
		$target = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext.copy');
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext.copy'));
		$this->assertTrue($this->fixture_file->copyTo($target));
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext.copy'));
		$this->assertEquals(file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'), file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext.copy'));
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext.copy');
		
		//copy to dir
		if (is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext')) {
			unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext');
		}
		$target = $this->fixture_dir->getChildFile($this->fixture_file->getName());
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertTrue($this->fixture_file->copyTo($this->fixture_dir));
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertEquals(file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'), file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		
		//file to already existing file (overwrite = false)
		$target = $this->fixture_dir->getChildFile($this->fixture_file->getName());
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		try {
			$this->assertTrue($this->fixture_file->copyTo($target, false));
			$this->fail();
		} catch (EyeIOException $e) {
			//normal situation
		}
		
		//file to already existing file (overwrite = true)
		$content = '## My Content ##';
		file_put_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext', $content);
		$target = $this->fixture_dir->getChildFile($this->fixture_file->getName());
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertNotEquals(file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'), file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertTrue($this->fixture_file->copyTo($target));
		$this->assertEquals(file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'), file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext');
	}
	
	public function testCreateNewFile() {
		//non-existing file
		$myFile2 = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext');
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext'));
		$this->assertTrue($myFile2->createNewFile());
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext'));
		
		//already existing file (overwrite = false)
		try {
			$myFile2->createNewFile();
			$this->fail();
		} catch (EyeIOException $e) {
			//normal situation
		}
		
		//already existing file (overwrite = true)
		$content = '## My Content ##';
		file_put_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext', $content);
		$this->assertEquals($content, file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext'));
		try {
			$myFile2->createNewFile(true);
		} catch (EyeIOException $e) {
			$this->fail();
		}
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext'));
		$this->assertEquals('', file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext'));
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext');
	}
	
	public function testCreateNewLink() {
		try {
			$myLink = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myLink');
			$this->assertTrue($myLink->createNewLink($this->fixture_dir));
			$this->assertTrue(is_link(TESTS_FSI_LOCALFILE_TMP_PATH . '/myLink'));
			unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myLink');
		} catch (EyeUnsupportedOperationException $e) {
			if (function_exists('symlink')) {
				throw $e;
			}
		}
	}
	
	public function testDelete() {
		//delete a file
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		$this->assertTrue($this->fixture_file->delete());
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		
		//delete an empty directory
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		$this->assertTrue($this->fixture_dir->delete());
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));

		//delete a non-empty directory
		$this->setUp();
		$fp = fopen(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext', 'w+');
		fclose($fp);
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		try {
			$this->fixture_dir->delete();
			$this->fail();
		} catch (EyeIOException $e) {
			//normal situation
		}
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		
		//delete the content *only* of a directory
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertTrue($this->fixture_dir->delete(false, true));
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		
		//delete a directory and its content recursively
		$fp = fopen(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext', 'w+');
		fclose($fp);
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertTrue($this->fixture_dir->delete(true, false));
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
	}
	
	public function testExists() {
		$this->assertTrue($this->fixture_file->exists());
		$this->assertTrue($this->fixture_dir->exists());
		
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext');
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir');
		
		$this->assertFalse($this->fixture_file->exists());
		$this->assertFalse($this->fixture_dir->exists());
	}
	
	public function testGetContents() {
		//file
		$content = 'myContent1';
		$this->assertNotEquals($content, $this->fixture_file->getContents());
		file_put_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext', $content);
		$this->assertEquals($content, $this->fixture_file->getContents());
		
		//directory
		try {
			$this->fixture_dir->getContents();
			$this->fail();
		} catch (EyeBadMethodCallException $e) {
			// normal situation
		}
	}
	
	public function testGetExtension() {
		$this->assertEquals('ext', $this->fixture_file->getExtension());
		$otherFile = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/my.File.2.EXT');
		$this->assertEquals('EXT', $otherFile->getExtension());
	}
	
	public function testGetGroup() {
		$this->assertEquals(filegroup(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'), $this->fixture_file->getGroup());
		$otherFile = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext');
		try {
			$otherFile->getGroup();
			$this->fail();
		} catch (EyeStatFailedException $e) {
			// normal situation
		}
	}
	
	public function testGetName() {
		$this->assertEquals('myFile.ext', $this->fixture_file->getName());
		$otherFile = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/my.File.2.EXT');
		$this->assertEquals('my.File.2.EXT', $otherFile->getName());
		$this->assertEquals('myDir', $this->fixture_dir->getName());
	}
	
	public function testGetOwner() {
		$this->assertEquals(fileowner(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'), $this->fixture_file->getOwner());
		$otherFile = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile2.ext');
		try {
			$otherFile->getOwner();
			$this->fail();
		} catch (EyeStatFailedException $e) {
			// normal situation
		}
	}
	
	public function testGetParentFile() {
		$myFile2 = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile2.ext');
		$this->assertTrue($this->fixture_dir->equals($myFile2->getParentFile()));
		
		$myRoot = new LocalFile('/');
		$this->assertTrue($myRoot->equals($myRoot->getParentFile()));
	}
	
	public function testGetPathInfo() {
		$pathinfo = $this->fixture_file->getPathInfo();
		$this->assertEquals(TESTS_FSI_LOCALFILE_TMP_PATH, $pathinfo['dirname']);
		$this->assertEquals('myFile.ext', $pathinfo['basename']);
		$this->assertEquals('ext', $pathinfo['extension']);
		$this->assertEquals('myFile', $pathinfo['filename']);
		
		$pathinfo = $this->fixture_dir->getPathInfo();
		$this->assertEquals(TESTS_FSI_LOCALFILE_TMP_PATH, $pathinfo['dirname']);
		$this->assertEquals('myDir', $pathinfo['basename']);
		$this->assertFalse(isset($pathinfo['extension']));
		$this->assertEquals('myDir', $pathinfo['filename']);
	}
	
	public function testGetPermissions() {
		//TODO
	}
	
	public function testGetSize() {
		$this->assertNotEquals(0, $this->fixture_file->getSize());
		$this->assertEquals(filesize(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'), $this->fixture_file->getSize());
		
		$myNonExistingFile = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile2.ext');
		$this->assertEquals(0, $myNonExistingFile->getSize());
	}
	
	public function testListFiles() {
		//TODO?
	}
	
	public function testMkdir() {
		//already existing dir
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		try {
			$this->fixture_dir->mkdir();
			$this->fail();
		} catch (EyeIOException $e) {
			//normal situation
		}
		
		//non-existing dir
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir');
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		$this->fixture_dir->mkdir();
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		
		//non-existing parent dir
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir');
		$dir2 = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myDir2');
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myDir2'));
		try {
			$dir2->mkdir();
			$this->fail();
		} catch (EyeIOException $e) {
			//normal situation
		}
	}
	
	public function testMkdirs() {
		//already existing dir
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		try {
			$this->fixture_dir->mkdirs();
			$this->fail();
		} catch (EyeIOException $e) {
			//normal situation
		}
		
		//non-existing dir
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir');
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		$this->fixture_dir->mkdirs();
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		
		//non-existing parent dir
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir');
		$dir = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myDir2');
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myDir2'));
		$this->assertTrue($dir->mkdirs());
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myDir2'));
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myDir2');
	}
	
	public function testMoveTo() {
		//existing file
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$originalContent = file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext');
		$this->assertTrue($this->fixture_file->moveTo($this->fixture_dir));
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertEquals($originalContent, file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext');
		
		//non-existing file
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		try {
			$this->fixture_file->moveTo($this->fixture_dir);
			$fail->fail();
		} catch (EyeFileNotFoundException $e) {
			// normal situation
		}
		
		//existing directory containing files
		mkdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/dir1');
		$dir = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/dir1');
		$originalContent = '## test - content ##';
		file_put_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/dir1/mySubFile.ext', $originalContent);
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/dir1'));
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/dir1/mySubFile.ext'));
		$this->assertTrue($dir->moveTo($this->fixture_dir));
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/dir1'));
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/dir1'));
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/dir1/mySubFile.ext'));
		$this->assertEquals($originalContent, file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/dir1/mySubFile.ext'));
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/dir1/mySubFile.ext');
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/dir1');
	}
	
	public function testPutContents() {
		//file
		$content = 'myContent1';
		$this->assertNotEquals($content, file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		$this->assertEquals(strlen($content), $this->fixture_file->putContents($content));
		$this->assertEquals($content, file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		
		//file (appending)
		$this->assertNotEquals($content . ' ##APPENDED PART##', file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		$this->assertEquals(strlen(' ##APPENDED PART##'), $this->fixture_file->putContents(' ##APPENDED PART##', FILE_APPEND));
		$this->assertEquals($content . ' ##APPENDED PART##', file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		
		//directory
		try {
			$this->fixture_dir->putContents($content);
			$this->fail();
		} catch (EyeBadMethodCallException $e) {
			// normal situation
		}
	}
	
	public function testsRenameTo() {
		//file
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		$this->assertTrue($this->fixture_file->renameTo('newName.ext2'));
		$this->assertFalse(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext'));
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/newName.ext2'));
		$this->assertEquals('newName.ext2', $this->fixture_file->getName());
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/newName.ext2');
		
		//directory
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		file_put_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext', 'something');
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir/myFile.ext'));
		$this->assertTrue($this->fixture_dir->renameTo('newDir'));
		$this->assertFalse(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir'));
		$this->assertTrue(is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/newDir'));
		$this->assertTrue(is_file(TESTS_FSI_LOCALFILE_TMP_PATH . '/newDir/myFile.ext'));
		$this->assertEquals('newDir', $this->fixture_dir->getName());
		$this->assertEquals('something', file_get_contents(TESTS_FSI_LOCALFILE_TMP_PATH . '/newDir/myFile.ext'));
		unlink(TESTS_FSI_LOCALFILE_TMP_PATH . '/newDir/myFile.ext');
		rmdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/newDir');
	}
}
?>
