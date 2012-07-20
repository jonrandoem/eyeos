<?php

function toptext() {
    return 'eyeOS 2 installed in your server';
}

function getContent() {
    echo '<center><h2 class="bigtitle">eyeOS 2 has been installed</h2></center>';
    echo '<div class="explaintext">
	<p>You have completed all the steps and your eyeOS is installed and ready to use.<p>
	<p>However, you may experience some problems if your server is not fully compatible with eyeOS. If you experience any problem,
	do not hesitate to ask for help in the <a href="http://forums.eyeos.org">community forums.</a></p>
	<p>It is recommended to completly remove the install/ directory in your eyeOS</p>
	<p><center><a href="../index.php">Go to my new eyeOS!</a></center></p>
    </div>';
}

?>
