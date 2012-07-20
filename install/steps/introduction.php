<?php

function toptext() {
    return 'Welcome to eyeOS installation';
}

function getContent() {
    echo '<center><h2 class="bigtitle">eyeOS 2 Installation</h2></center>';
    echo '<div class="explaintext">
        <p>During this installation, you will be asked to answer some configuration questions about your web server and prefered settings.</p>
        <p>You will need some knowledge about your server, and root access if possible. If you are in a shared hosting, you may be able
        to finish this installation, but your eyeOS won\'t have all the features. Please, press install when ready.</p>
        <p style="margin-top:40px;"><center><a href="index.php?step=requirements"><div><img border="0" src="install.png" /></div><div style="margin-top:20px;">Install eyeOS 2 on my server</div></a></center></p>
    </div>';
}

?>
