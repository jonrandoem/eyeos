#!/usr/bin/perl -w
use strict;

my $logfile = "logfile.txt";
open STDERR, ">> /dev/null";

exit if fork;
my @output = `recollindex -c $ARGV[0]`;

close STDERR;
