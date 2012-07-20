#!/usr/bin/python
import diff_match_patch as dmp_module
import sys

dmp = dmp_module.diff_match_patch()

f = open(sys.argv[1], 'r')
original = f.read()

f = open(sys.argv[2], 'r')
diff = f.read()

patch = dmp.patch_fromText(diff)

results = dmp.patch_apply(patch, original);

results = results[0]

f = open(sys.argv[1],'w')
f.write(results)
