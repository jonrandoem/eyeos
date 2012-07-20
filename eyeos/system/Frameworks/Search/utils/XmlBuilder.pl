#!/usr/bin/perl -w
use strict;

################################################
# Taking the output of the recoll system call. #
################################################
my $logfile = "logfile.txt";
open STDERR, ">> /dev/null";

my @output;
@output = `recoll -c $ARGV[0] -t $ARGV[1]`;

################################################
# Parsing the @output, line by line and        #
# generating Xml code.                         #
################################################
# removing the first entry, it's not needed 
shift(@output);

# initializating xml file
my $xml = "<results>\n";

# parsing the number of matched files
if ( $output[0] =~ m/([0-9]*)/ ){
	$xml .= "\t<files>".$1."</files>\n";
	shift(@output);
}

# parsing all the entries which match the query
foreach (@output){
	if ( $_ =~ m/(\w+\/?\w*)\s\[(.*?)\]\s\[(.*?)\]\s([0-9]+)/ ){
		$xml .= "\t<file>\n";
		$xml .= "\t\t<type>".$1."</type>\n";
		$xml .= "\t\t<path>".$2."</path>\n";
		$xml .= "\t\t<name>".$3."</name>\n";
		$xml .= "\t\t<size>".$4."</size>\n";
		$xml .= "\t</file>\n";
	}
}

# finally, we insert the last tag in the xml file.
$xml .= "</results>\n";

print($xml);
close STDERR;
