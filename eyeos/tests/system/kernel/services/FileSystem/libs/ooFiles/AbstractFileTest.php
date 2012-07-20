<?php
class AbstractFileTest extends PHPUnit_Framework_TestCase {
	private $fixture_file;
	private $fixture_dir;

	public function setUp() {
		$this->fixture_dir = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir');
		if (!is_dir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir')) {
			mkdir(TESTS_FSI_LOCALFILE_TMP_PATH . '/myDir', 0777, true);
		}
		$this->fixture_file = new LocalFile(TESTS_FSI_LOCALFILE_TMP_PATH . '/myFile.ext');
		$fp = fopen(EYEOS_TESTS_TMP_PATH . '/myFile.ext', 'w+');
		fclose($fp);
	}

	public function tearDown() {
		unset($this->fixture_file);
		unset($this->fixture_dir);
		AdvancedPathLib::rmdirs(TESTS_FSI_LOCALFILE_TMP_PATH);
	}
	
	public function testCompareTo() {
		$dir = new GenericFile(EYEOS_TESTS_TMP_PATH . '/zzz');
		mkdir(EYEOS_TESTS_TMP_PATH . '/zzz');

		//"myFile.ext" < "zzz"
		$this->assertEquals(-1, $this->fixture_file->compareTo($dir));
		
		//"myFile.ext" > "zzz" (folders first)
		$this->assertEquals(1, $this->fixture_file->compareTo($dir, true));
		
		//"myFile.ext" == "myFile.ext"
		$this->assertEquals(0, $this->fixture_file->compareTo($this->fixture_file));
		
		//"myFile.ext" == "myFile.ext"
		$this->assertEquals(0, $dir->compareTo($dir));
		
		rmdir(EYEOS_TESTS_TMP_PATH . '/zzz');
	}
	
	public function testEquals() {
		$file = clone $this->fixture_file;
		$dir = clone $this->fixture_dir;
		
		$this->assertTrue($this->fixture_file->equals($file));
		$this->assertTrue($this->fixture_file->equals($this->fixture_file));
		$this->assertFalse($this->fixture_file->equals($dir));
		$this->assertTrue($this->fixture_dir->equals($dir));
		$this->assertTrue($this->fixture_dir->equals($this->fixture_dir));
		$this->assertFalse($this->fixture_dir->equals($file));
	}
	
	public function getChildFile() {
		$fileChild = new GenericFile(EYEOS_TESTS_TMP_PATH . '/child.ext');
		$dirChild = new GenericFile(EYEOS_TESTS_TMP_PATH . '/myDir/child.ext');
		
		$this->assertEquals($fileChild, $this->fixture_file->getChildFile('child.ext'));
		$this->assertEquals($dirChild, $this->fixture_dir->getChildFile('child.ext'));
	}
}
?>
