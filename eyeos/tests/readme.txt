How to run eyeos Unit Tests suite
------------------------------------
Author: Anael	/	Version 0.2
------------------------------------

1) Install PHPUnit 3.3 with PEAR (http://www.phpunit.de/manual/3.3/en/installation.html).

2) Add your PEAR directory to your PATH.
    For Linux/Bash, add a new line at the end of your ~/.bashrc containing:
    export PATH=$PATH:/path/to/your/PEAR/bin/directory
    
3) Open a command-line/shell in:
		<project-dir>/eyeos
	then type:
		phpunit --bootstrap ./tests/init.php ./tests
	or directly launch:
		./run_unittests.sh			(Linux)
		run_unittests.bat			(Windows)
		
4) The tests is executed and the result printed on the screen. There should be 0 failures and 0 errors.

5) If you just want to execute a single class, use the --filter argument.
    Examples:
    *	run_unittests.sh --filter MyClassTest
    	will only run the class named "MyClassTest"
    *	run_unittests.sh --filter MyClassTest::testMyMethod
    	will only run the method "testMyMethod" in the class named "MyClassTest"