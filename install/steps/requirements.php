<?php
function toptext() {
    return 'Checking for eyeOS requirements';
}

function getContent() {
    ?>
<div class="explaintext">
    <p class="bigtitle">System requirements</p>
</div>
<table style="width:600px;">
        <?php
            echo '<tr><td style="padding-right:10px;" align="right">PHP Version:</td>';
            if (strnatcmp(phpversion(),'5.2.0') >= 0) {
                echo '<td class="textok" style="padding-left:10px;">'.phpversion().' <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">'.phpversion().' <img style="margin-left:10px;" img src="no.png" /> <span style="margin-left:10px;color:black">>= 5.2.0 required</span></td></tr>';
            }

            if(function_exists('apache_get_modules')) {
                echo '<tr><td style="padding-right:10px;" align="right">Apache mod_rewrite:</td>';
                $apache_modules = apache_get_modules();
                if(array_search('mod_rewrite', $apache_modules) !== false) {
                    echo '<td class="textok" style="padding-left:10px;">Enabled <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
                } else {
                    echo '<td class="textno" style="padding-left:10px;">Not enabled <img style="margin-left:10px;" img src="no.png" /></td></tr>';
                }
            }
            echo '<tr><td style="padding-right:10px;" align="right">Curl extension:</td>';
            if(in_array ('curl', get_loaded_extensions())) {
                
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">GD extension:</td>';
            if(function_exists('gd_info')) {
                
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">Mbstring extension:</td>';

            if(function_exists('mb_get_info')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">Mcrypt extension:</td>';

            if(function_exists('mcrypt_decrypt')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">Mysql extension:</td>';
            if(function_exists('mysql_connect')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">Mysqli extension:</td>';
            if(class_exists('MySQLi')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">SQLite extension:</td>';
            if(function_exists('sqlite_open')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">PDO extension:</td>';
            if(class_exists('PDO')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">PDO MySQL Driver:</td>';
            if(in_array('mysql', PDO::getAvailableDrivers())) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">PDO SQLite Driver:</td>';
            if(in_array('sqlite', PDO::getAvailableDrivers())) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Not Installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">JSON support:</td>';
            if(function_exists('json_encode')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textoptional" style="padding-left:10px;">Not Installed (Optional)</td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">shm memory support:</td>';
            if(function_exists('shm_get_var')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textoptional" style="padding-left:10px;">Not Installed (Optional)</td></tr>';
            }

            $pyversion = shell_exec('python -V 2>&1');

            echo '<tr><td style="padding-right:10px;" align="right">Python:</td>';
            if(!$pyversion) {
                echo '<td class="textno" style="padding-left:10px;">Not installed <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            $pyversion = explode(' ', $pyversion);
            $pyversion = $pyversion[1];

            if (strnatcmp($pyversion,'2.5.0') >= 0) {
                echo '<td class="textok" style="padding-left:10px;">'.$pyversion.' <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">'.$pyversion.' <img style="margin-left:10px;" img src="no.png" /> <span style="margin-left:10px;color:black">>= 2.5.0 required</span></td></tr>';
            }

            /*
            $simplejson = shell_exec('python -m simplejson 2>&1');
            if (!strstr($simplejson,'No module named')) {
                echo '<tr><td style="padding-right:10px;" align="right">Python simplejson:</td>';
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                 echo '<tr><td style="padding-right:10px;" align="right">Python simplejson:</td>';
                    echo '<td class="textoptional" style="padding-left:10px;">Not installed (Needed in collaborative features)</td></tr>';
            }
            */

            echo '<tr><td style="padding-right:10px;" align="right">Python uno:</td>';
            $simplejson = shell_exec('python -m uno 2>&1');
            if (!strstr($simplejson,'No module named')) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                 echo '<td class="textoptional" style="padding-left:10px;">Not installed (Needed to convert office documents)</td></tr>';
            }

            /*
            $simplejson = shell_exec('python -m stomp 2>&1');
            if (!strstr($simplejson,'No module named')) {
                echo '<tr><td style="padding-right:10px;" align="right">Python stomp.py:</td>';
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                 echo '<tr><td style="padding-right:10px;" align="right">Python stomp.py:</td>';
                 echo '<td class="textoptional" style="padding-left:10px;">Not installed (Needed in collaborative features)</td></tr>';
            }
            */

            echo '<tr><td style="padding-right:10px;" align="right">php.ini display_errors:</td>';
            if(ini_get('display_errors')) {
                echo '<td class="textok" style="padding-left:10px;">disabled <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textoptional" style="padding-left:10px;">Enabled (Recommended to be disabled)</td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">php.ini memory_limit:</td>';
            if(return_bytes(ini_get('memory_limit')) >= 268435456) {
                echo '<td class="textok" style="padding-left:10px;">'.ini_get('memory_limit').' <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textoptional" style="padding-left:10px;">'.ini_get('memory_limit').' (Recommended at least 128Mb)</td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">php.ini allow_url_fopen:</td>';
            if(ini_get('allow_url_fopen')) {
                echo '<td class="textok" style="padding-left:10px;">Enabled <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Disabled <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">php.ini safe_mode:</td>';
            if(!ini_get('safe_mode')) {
                echo '<td class="textok" style="padding-left:10px;">Disabled <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Enabled <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">php.ini short_open_tag:</td>';
            if(ini_get('short_open_tag')) {
                echo '<td class="textok" style="padding-left:10px;">Enabled <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Disabled <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

            echo '<tr><td style="padding-right:10px;" align="right">php.ini file_uploads:</td>';
            if(ini_get('file_uploads')) {
                echo '<td class="textok" style="padding-left:10px;">Enabled <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textno" style="padding-left:10px;">Disabled <img style="margin-left:10px;" img src="no.png" /></td></tr>';
            }

//            echo '<tr><td style="padding-right:10px;" align="right">recoll:</td>';
//            $recoll = shell_exec('recoll -t 2>&1');
//            if(strstr($recoll, 'usage')) {
//                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
//            } else {
//                echo '<td class="textoptional" style="padding-left:10px;">Not Instaled (Needed for document indexation)</td></tr>';
//            }

            echo '<tr><td style="padding-right:10px;" align="right">exiftool:</td>';
            $exiftool = shell_exec('exiftool -ver');
            if($exiftool) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textoptional" style="padding-left:10px;">Not Instaled (Needed to extract MP3 metadata)</td></tr>';
            }

            $zip = shell_exec('zip -v');

            echo '<tr><td style="padding-right:10px;" align="right">zip:</td>';
            if($zip) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textoptional" style="padding-left:10px;">Not Instaled (Needed for office support)</td></tr>';
            }

            $unzip = shell_exec('unzip -v');

            echo '<tr><td style="padding-right:10px;" align="right">unzip:</td>';
            if($unzip) {
                echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<td class="textoptional" style="padding-left:10px;">Not Instaled (Needed for office support)</td></tr>';
            }

            $soffice = shell_exec('soffice -h');
            if(@fsockopen('127.0.0.1', '2002', $errno, $errstr, 3)) {
                            echo '<tr><td style="padding-right:10px;" align="right">OpenOffice Daemon:</td>';
                            echo '<td class="textok" style="padding-left:10px;">Running <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<tr><td style="padding-right:10px;" align="right">soffice:</td>';
                if($soffice) {
                    echo '<td class="textok" style="padding-left:10px;">Installed <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
                } else {
                    echo '<td class="textoptional" style="padding-left:10px;">Not Instaled (Needed for office support)</td></tr>';
                }
            }


            /*
            if(@fsockopen('127.0.0.1', '2002', $errno, $errstr, 3)) {
                echo '<tr><td style="padding-right:10px;" align="right">OpenOffice Daemon:</td>';
                echo '<td class="textok" style="padding-left:10px;">Running <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<tr><td style="padding-right:10px;" align="right">OpenOffice Daemon:</td>';
                echo '<td class="textoptional" style="padding-left:10px;">Not running (Needed to convert office documents)</td></tr>';
            }
            */
    
            /*
            if(@fsockopen('127.0.0.1', '8000', $errno, $errstr, 3)) {
                echo '<tr><td style="padding-right:10px;" align="right">Kaazing gateway:</td>';
                echo '<td class="textok" style="padding-left:10px;">Running <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<tr><td style="padding-right:10px;" align="right">Kaazing gateway:</td>';
                echo '<td class="textoptional" style="padding-left:10px;">Not running (Needed for real time notifications)</td></tr>';
            }
            
            if(@fsockopen('127.0.0.1', '61616', $errno, $errstr, 3)) {
                echo '<tr><td style="padding-right:10px;" align="right">ActiveMQ Daemon:</td>';
                echo '<td class="textok" style="padding-left:10px;">Running <img style="margin-left:10px;" img src="ok.png" /></td></tr>';
            } else {
                echo '<tr><td style="padding-right:10px;" align="right">ActiveMQ Daemon:</td>';
                echo '<td class="textoptional" style="padding-left:10px;">Not running (Needed for real time notifications)</td></tr>';
            }*/
        ?>
</table>

<p>You are free to continue with the installation even if there are some missing requirements in your server. However,
if you want a full experience in your eyeOS, it is strongly recommended to have all the requirements installed
before proceeding.</p>
<p>If you proceed with any element in red or orange, you can expect random failures in your eyeOS and data loss.</p>
<p><center><a href="index.php?step=configuration"><div><img src="next.png" border="0" /></div><div style="margin-top:20px;">Continue with the installation</div></a></center></p>
<?php
}

function return_bytes($val) {
    $val = trim($val);
    $last = strtolower($val[strlen($val)-1]);
    switch($last) {
        // The 'G' modifier is available since PHP 5.1.0
        case 'g':
            $val *= 1024;
        case 'm':
            $val *= 1024;
        case 'k':
            $val *= 1024;
    }

    return $val;
}

?>