#!/usr/bin/python
import diff_match_patch as dmp_module
import sys

version = sys.argv[1]

dmp = dmp_module.diff_match_patch()

f = open(version, 'r')
original = f.read()

f = open(sys.argv[2], 'r')
modified = f.read()

diff = dmp.diff_main(original, modified, True);
dmp.diff_cleanupSemantic(diff);

patch_list = dmp.patch_make(original, modified, diff);
patch_text = dmp.patch_toText(patch_list)

print patch_text