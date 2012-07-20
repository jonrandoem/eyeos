<?php
class AdvancedPathLibTest extends PHPUnit_Framework_TestCase {
	public function setUp() {
		if (!is_dir(EYEOS_TESTS_TMP_PATH)) {
			mkdir(EYEOS_TESTS_TMP_PATH, 0777, true);
		}
	}
	
	public function tearDown() {
		AdvancedPathLib::rmdirs(EYEOS_TESTS_TMP_PATH);
	}
	
	public function testBuildURL() {
		$urlParts = array(
			'path' => '/path/to/myFile.ext'
		);
		$this->assertEquals('file:///path/to/myFile.ext', AdvancedPathLib::buildURL($urlParts));
		$urlParts['scheme'] = 'file';
		$this->assertEquals('file:///path/to/myFile.ext', AdvancedPathLib::buildURL($urlParts));
		$urlParts['user'] = 'myuser';
		$urlParts['pass'] = 'mypass';
		$this->assertEquals('file://myuser:mypass@localhost/path/to/myFile.ext', AdvancedPathLib::buildURL($urlParts));
		
		$urlParts = array(
			'scheme' => 'file',
			'host' => 'localhost',
			'path' => '/path/to/myFile.ext'
		);
		$this->assertEquals('file://localhost/path/to/myFile.ext', AdvancedPathLib::buildURL($urlParts));
		$urlParts['user'] = 'myuser';
		$urlParts['pass'] = 'mypass';
		$this->assertEquals('file://myuser:mypass@localhost/path/to/myFile.ext', AdvancedPathLib::buildURL($urlParts));
		
		//special behaviour on Windows (adding a leading slash to the path)
		$urlParts = array(
			'scheme' => 'file',
			'host' => 'localhost',
			'path' => 'D:/path/to/myFile.ext'
		);
		$this->assertEquals('file://localhost/D:/path/to/myFile.ext', AdvancedPathLib::buildURL($urlParts, AdvancedPathLib::OS_WINDOWS));
		
		$urlParts = array(
			'scheme' => 'ftp',
			'host' => 'dummyhost',
			'path' => '/path/to/myFile #1.ext',
			'port' => '210'
		);
		$this->assertEquals('ftp://dummyhost:210/path/to/myFile #1.ext', AdvancedPathLib::buildURL($urlParts));
		$urlParts['user'] = 'myuser';
		$urlParts['pass'] = 'mypass';
		$this->assertEquals('ftp://myuser:mypass@dummyhost:210/path/to/myFile #1.ext', AdvancedPathLib::buildURL($urlParts));
		
		$urlParts = array(
			'scheme' => 'http',
			'host' => 'dummyhost',
			'path' => '/path/to/myPage.html',
			'query' => 'this=1&that=2'
		);
		$this->assertEquals('http://dummyhost/path/to/myPage.html?this=1&that=2', AdvancedPathLib::buildURL($urlParts));
		$urlParts['user'] = 'myuser';
		$urlParts['pass'] = 'mypass';
		$urlParts['fragment'] = 'myfragment';
		$this->assertEquals('http://myuser:mypass@dummyhost/path/to/myPage.html?this=1&that=2#myfragment', AdvancedPathLib::buildURL($urlParts));
	}
	
	public function testCpdirs() {
		//TODO
		$this->fail();
	}
	
	public function testFnmatch() {
		$pattern = 'test.jpg';
		$this->assertTrue(AdvancedPathLib::fnmatch($pattern, 'test.jpg'));
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'test1.jpg'));
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'test.gif'));
		
		$pattern = 'test*.jpg';
		$this->assertTrue(AdvancedPathLib::fnmatch($pattern, 'test.jpg'));
		$this->assertTrue(AdvancedPathLib::fnmatch($pattern, 'test10.jpg'));
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'test.gif'));
		
		$pattern = 'test?.jpg';
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'test.jpg'));
		$this->assertTrue(AdvancedPathLib::fnmatch($pattern, 'test1.jpg'));
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'test10.jpg'));
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'test.gif'));
		
		$pattern = 't*e*s*t.j?g';
		$this->assertTrue(AdvancedPathLib::fnmatch($pattern, 'test.jpg'));
		$this->assertTrue(AdvancedPathLib::fnmatch($pattern, 'taaassdefdfgfgskjkljllt.jpg'));
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'test1.jpg'));
		$this->assertTrue(AdvancedPathLib::fnmatch($pattern, 'test.jmg'));
		$this->assertFalse(AdvancedPathLib::fnmatch($pattern, 'tset.jpg'));
	}
	
	public function testGetCanonicalURL() {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			$currentDriveLetter = utf8_strtoupper(utf8_substr(realpath('.'), 0, 2));
			$this->assertEquals('file://' . $currentDriveLetter . '/mypath/to/a/file', AdvancedPathLib::getCanonicalURL('/mypath/to/a/file'));
			$this->assertEquals('file://' . $currentDriveLetter . '/to/a/dir', AdvancedPathLib::getCanonicalURL('/mypath/../to/a/dir/'));
		} else {
			$this->assertEquals('file:///mypath/to/a/file', AdvancedPathLib::getCanonicalURL('/mypath/to/a/file'));
			$this->assertEquals('file:///to/a/dir', AdvancedPathLib::getCanonicalURL('/mypath/../to/a/dir/', AdvancedPathLib::OS_UNIX));
		}
		
		$this->assertEquals('ftp://user:pass@eyeos.org/a/file', AdvancedPathLib::getCanonicalURL('ftp://user:pass@eyeos.org/mypath/..//to//../a/file'));
		$this->assertEquals('file://' . strtr(realpath(EYEOS_TESTS_TMP_PATH), '\\', '/') . '/my/path', AdvancedPathLib::getCanonicalURL('./tests/tmp/my/path'));
	}
	
	public function testGetPhpLocalHackPath() {
		if (AdvancedPathLib::getCurrentOS() == AdvancedPathLib::OS_WINDOWS) {
			$this->assertEquals('C:/path/to/myFile.ext', AdvancedPathLib::getPhpLocalHackPath('file://C:/path/to/myFile.ext'));
			$this->assertEquals('C:/path/to/myDir/', AdvancedPathLib::getPhpLocalHackPath('file://C:/path/to/myDir/'));
			$this->assertEquals('C:/path/to/myFile.ext', AdvancedPathLib::getPhpLocalHackPath('file://localhost/C:/path/to/myFile.ext'));
		} else {
			$this->assertEquals('/path/to/myFile.ext', AdvancedPathLib::getPhpLocalHackPath('file:///path/to/myFile.ext'));
			$this->assertEquals('/path/to/myFile.ext', AdvancedPathLib::getPhpLocalHackPath('file://path/to/myFile.ext'));
			$this->assertEquals('/path/to/myFile.ext', AdvancedPathLib::getPhpLocalHackPath('file://localhost/path/to/myFile.ext'));
			$this->assertEquals('/path/to/myDir', AdvancedPathLib::getPhpLocalHackPath('file://localhost/path/to/myDir/'));
		}
	}
	
	public function testGlob() {
		// Unable to test this function easily, may be to do later...
	}
	
	public function testParse_url() {
		AdvancedPathLib::parse_url_registerFragment2PathProtocol(array('file', 'ftp', 'ftps'));
		
		$url = '/unix/like/path';
		$this->assertEquals(array(
				'scheme' => 'file',
				'path' => '/unix/like/path'
			),
			AdvancedPathLib::parse_url($url, AdvancedPathLib::OS_UNIX)
		);
		
		$url = 'C:/windows/like/path';
		$this->assertEquals(array(
				'scheme' => 'file',
				'path' => 'C:/windows/like/path'
			),
			AdvancedPathLib::parse_url($url, AdvancedPathLib::OS_WINDOWS)
		);
		
		$url = 'D:\another\windows\like\path';
		$this->assertEquals(array(
				'scheme' => 'file',
				'path' => 'D:/another/windows/like/path'
			),
			AdvancedPathLib::parse_url($url, AdvancedPathLib::OS_WINDOWS)
		);
		
		$url = 'D:\another\windows\like\path\myFile #2.ext';
		$this->assertEquals(array(
				'scheme' => 'file',
				'path' => 'D:/another/windows/like/path/myFile #2.ext'
			),
			AdvancedPathLib::parse_url($url, AdvancedPathLib::OS_WINDOWS)
		);
		
		$url = 'ftp://eyeos.org/path/to/myFile.ext';
		$this->assertEquals(array(
				'scheme' => 'ftp',
				'host' => 'eyeos.org',
				'path' => '/path/to/myFile.ext'
			),
			AdvancedPathLib::parse_url($url)
		);
		
		$url = 'ftp://eyeos.org/path/to/myFile #1.ext';
		$this->assertEquals(array(
				'scheme' => 'ftp',
				'host' => 'eyeos.org',
				'path' => '/path/to/myFile #1.ext'
			),
			AdvancedPathLib::parse_url($url)
		);
		
		$url = 'home://eyeos.org/unknown/scheme/url';
		$this->assertEquals(array(
				'scheme' => 'home',
				'host' => 'eyeos.org',
				'path' => '/unknown/scheme/url'
			),
			AdvancedPathLib::parse_url($url)
		);
		
		$url = 'p34f://eyeos.org:34/another/unknown/../scheme/url/../';
		$this->assertEquals(array(
				'scheme' => 'p34f',
				'host' => 'eyeos.org',
				'port' => 34,
				'path' => '/another/scheme'
			),
			AdvancedPathLib::parse_url($url)
		);
		
		$url = '/unix/like/path?with=query';
		$this->assertEquals(array(
				'scheme' => 'file',
				'path' => '/unix/like/path',
				'query' => 'with=query'
			),
			AdvancedPathLib::parse_url($url, AdvancedPathLib::OS_UNIX)
		);
		
		$url = 'http://eyeos.org/http/like/path?with=query#and-fragment';
		$this->assertEquals(array(
				'scheme' => 'http',
				'host' => 'eyeos.org',
				'path' => '/http/like/path',
				'query' => 'with=query',
				'fragment' => 'and-fragment'
			),
			AdvancedPathLib::parse_url($url)
		);
		
		$url = 'file://C:\path';
		$this->assertEquals(array(
				'scheme' => 'file',
				'path' => 'C:/path'
			),
			AdvancedPathLib::parse_url($url, AdvancedPathLib::OS_WINDOWS)
		);
	}
	
	public function testPathinfo() {
		$path = '/unix/like/path/file.ext';
		$this->assertEquals(array(
				'dirname' => '/unix/like/path',
				'basename' => 'file.ext',
				'extension' => 'ext',
				'filename' => 'file'
			),
			AdvancedPathLib::pathinfo($path)
		);
		
		$path = '/unix/like/path/file.ext';
		$this->assertEquals('file.ext', AdvancedPathLib::pathinfo($path, PATHINFO_BASENAME));
		
		$path = '/unix/like/path/file.ext';
		$this->assertEquals('file', AdvancedPathLib::pathinfo($path, PATHINFO_FILENAME));
		
		$path = '/unix/like/path/file';
		$this->assertEquals('file', AdvancedPathLib::pathinfo($path, PATHINFO_FILENAME));
	}
	
	public function testPermsToOctal() {
		$this->assertEquals('777', decoct(AdvancedPathLib::permsToOctal('-rwxrwxrwx')));
		$this->assertEquals('777', decoct(AdvancedPathLib::permsToOctal('drwxrwxrwx')));
		$this->assertEquals('777', decoct(AdvancedPathLib::permsToOctal('lrwxrwxrwx')));
		$this->assertEquals('0',   decoct(AdvancedPathLib::permsToOctal('----------')));
		$this->assertEquals('755', decoct(AdvancedPathLib::permsToOctal('-rwxr-xr-x')));
		$this->assertEquals('544', decoct(AdvancedPathLib::permsToOctal('-r-xr--r--')));
		$this->assertEquals('411', decoct(AdvancedPathLib::permsToOctal('-r----x--x')));
	}
	
	public function testPermsToUnix() {
		$this->assertEquals('-rwxrwxrwx', AdvancedPathLib::permsToUnix(0777));
		$this->assertEquals('----------', AdvancedPathLib::permsToUnix(0));
		$this->assertEquals('-rwxr-xr-x', AdvancedPathLib::permsToUnix(0755));
		$this->assertEquals('-r-xr--r--', AdvancedPathLib::permsToUnix(0544));
		$this->assertEquals('-r----x--x', AdvancedPathLib::permsToUnix(0411));
	}

	public function testRealpath() {
		//localhost
		$this->assertEquals(str_replace('\\', '/', realpath(EYEOS_TESTS_TMP_PATH)), AdvancedPathLib::realpath(EYEOS_TESTS_TMP_PATH, true));
		$this->assertEquals(str_replace('\\', '/', realpath(EYEOS_TESTS_TMP_PATH . '/../../')), AdvancedPathLib::realpath(EYEOS_TESTS_TMP_PATH . '/../../', true));
		
		//not localhost
		$this->assertEquals('/path/to/myFile.ext', AdvancedPathLib::realpath('/path//to///myFile.ext', false));
		$this->assertEquals('/path/myFile.ext', AdvancedPathLib::realpath('/path/to/../another/../myFile.ext', false));
		$this->assertEquals('/', AdvancedPathLib::realpath('/path/to/../another/../../../', false));
	}
	
	public function testResolvePath() {
		$refDir = EYEOS_TESTS_TMP_PATH;
		$this->assertEquals(EYEOS_TESTS_TMP_PATH . '/path/myDir', AdvancedPathLib::resolvePath('/path/to/../myDir', $refDir));
		$this->assertEquals('/path/myDir', AdvancedPathLib::resolvePath('/path/to/../myDir', $refDir, AdvancedPathLib::RESOLVEPATH_RETURN_REFDIR_RELATIVE));
		$this->assertEquals('/path/myDir', AdvancedPathLib::resolvePath(EYEOS_TESTS_TMP_PATH . '/path/to/../myDir', $refDir, AdvancedPathLib::RESOLVEPATH_RETURN_REFDIR_RELATIVE));
		$this->assertEquals('/path/myDir', AdvancedPathLib::resolvePath(realpath(EYEOS_TESTS_TMP_PATH) . '/path/to/../myDir', $refDir, AdvancedPathLib::RESOLVEPATH_RETURN_REFDIR_RELATIVE));
		
		try {
			AdvancedPathLib::resolvePath(EYEOS_TESTS_TMP_PATH . '/path/to/../../my/../incorrectDir/../..', $refDir, AdvancedPathLib::RESOLVEPATH_RETURN_REFDIR_RELATIVE);
			$this->fail();
		} catch (InvalidArgumentException $e) {
			// normal situation
		}
	}
	
	public function testRmdirs() {
		mkdir(EYEOS_TESTS_TMP_PATH . '/myDir1/myDir2/myDir3', 0777, true);
		$files = array(
			EYEOS_TESTS_TMP_PATH . '/myDir1/myFile1-1.ext',
			EYEOS_TESTS_TMP_PATH . '/myDir1/myFile1-2.ext',
			EYEOS_TESTS_TMP_PATH . '/myDir1/myDir2/myFile2.ext',
			EYEOS_TESTS_TMP_PATH . '/myDir1/myDir2/myDir3/myFile3.ext'
		);
		foreach($files as $file) {
			file_put_contents($file, 'some content');
		}
		
		foreach($files as $file) {
			$this->assertTrue(is_file($file));
		}
		$this->assertTrue(AdvancedPathLib::rmdirs(EYEOS_TESTS_TMP_PATH . '/myDir1'));
		foreach($files as $file) {
			$this->assertFalse(is_file($file));
		}
		$this->assertFalse(is_dir(EYEOS_TESTS_TMP_PATH . '/myDir1'));
	}
	
	public function testUnifyPath() {
		$this->assertEquals('/path/to/myFile.ext', AdvancedPathLib::unifyPath('/path//to///myFile.ext'));
		$this->assertEquals('/path/to/myDir/', AdvancedPathLib::unifyPath('/path//to///myDir////'));
		$this->assertEquals('C:/path/to/myFile.ext', AdvancedPathLib::unifyPath('C:\path\\to\myFile.ext'));
		$this->assertEquals('file://C:/path/to/myFile.ext', AdvancedPathLib::unifyPath('file://C:\path\to\myFile.ext', true));
	}
}
?>
