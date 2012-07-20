#!/usr/bin/env python
# Old: !/optlocal/OpenOffice.org/program/python
# (c) 2003-2006 Thomas Guettler
# This script is in the public domain
# Batch convert office documents with openoffice.org

# Please send improvements to me: guettli (a) thomas-guettler (dot) de

# Start the Office before connecting:
# soffice|OOo|openoffice "-accept=socket,host=localhost,port=2002;urp;"
#
# With OpenOffice2 you can use the default Python interpreter
# (at least on SuSE Linux)
#
# Ubuntu/Debian-Linux needs the package python-uno
#
# OpenOffice1.1 comes with its own python interpreter.
#   This Script needs to be run with the python from OpenOffice1:
#   /opt/OpenOffice.org/program/python
#
#

# Python Imports
import os
import re
import sys
import getopt

default_path="/usr/lib/ooo-2.0/program"
sys.path.insert(0, default_path)

# pyUNO Imports
try:
    import uno
    from com.sun.star.beans import PropertyValue
except:
    print "This Script needs to be run with the python from OpenOffice.org"
    print "Example: /opt/OpenOffice.org/program/python %s" % (
        os.path.basename(sys.argv[0]))
    print "Or you need to insert the right path at the top, where uno.py is."
    print "Default: %s" % default_path

    raise
    sys.exit(1)

extension=None
format=None
destination=None

def usage():
    scriptname=os.path.basename(sys.argv[0])
    print """Usage: %s [--extension pdf --format writer_pdf_Export] files
All files or directories will be converted to HTML.

You must start the office with this line before starting
this script:
  soffice|OOo|openoffice "-accept=socket,host=localhost,port=2002;urp;"

 If you want to export to something else, you need to use give the extension *and*
 the format.

 For a list of possible export formats see
 http://framework.openoffice.org/files/documents/25/897/filter_description.html

 or

 /opt/OpenOffice.org/share/registry/data/org/openoffice/Office/TypeDetection.xcu

 or

 grep -ri MYEXTENSION /usr/lib/ooo-2.0/share/registry/modules/org/openoffice/TypeDetection/
 the format is <node oor:name="FORMAT" ...

 Attention: Calc (.xls) needs an other export format than Writer (.doc)
            Example: calc_pdf_Export instead of writer_pdf_Export

Example (Convert a MS-Word file to PDF):

 1. Start Openoffice in server mode:
    openoffice "-accept=socket,host=localhost,port=2002;urp;" 
 2. Wait until Openoffice has started
 3. Convert the file:
    ooo2any.py --extension pdf --format writer_pdf_Export myfile.doc
    --> Created myfile.doc.pdf
 
  """ % (scriptname)

def do_dir(dir, desktop, destination):
    # Load File
    dir=os.path.abspath(dir)
    if os.path.isfile(dir):
        files=[dir]
    else:
        files=os.listdir(dir)
        files.sort()
    for file in files:
        if file.startswith("."):
            continue
        file=os.path.join(dir, file)
        if os.path.isdir(file):
            do_dir(file, desktop, destination)
        else:
            do_file(file, desktop, destination)

def do_file(file, desktop, destination):
    file_l=file.lower()

    global format
    if extension=="html":
        if file_l.endswith(".xls"):
            format="HTML (StarCalc)"
        elif file_l.endswith(".doc") or file_l.endswith(".wpd"):
            # doc: MS Office Word
            # wpd: Corel WP
            format="HTML (StarWriter)"
        else:
            print "%s: unkown extension" % file
            return

    assert(format)
    assert(extension)
    assert(destination)

    file_save=destination
    file_save = os.path.abspath(file_save)
    
    properties=[]
    p=PropertyValue()
    p.Name="Hidden"
    p.Value=True
    properties.append(p)

    doc=desktop.loadComponentFromURL(
        "file://%s" % file, "_blank", 0, tuple(properties));
    if not doc:
        print "Failed to open '%s'" % file
        return
    # Save File
    properties=[]
    p=PropertyValue()
    p.Name="Overwrite"
    p.Value=True
    properties.append(p)
    p=PropertyValue()
    p.Name="FilterName"
    p.Value=format
    properties.append(p)
    p=PropertyValue()
    p.Name="Hidden"
    p.Value=True
    try:
        doc.storeToURL(
            "file://%s" % file_save, tuple(properties))
        print "Created %s" % file_save
    except ValueError:
        import sys
        import traceback
        import cStringIO
        (exc_type, exc_value, tb) = sys.exc_info()
        error_file = cStringIO.StringIO()
        traceback.print_exception(exc_type, exc_value, tb,
                                  file=error_file)
        stacktrace=error_file.getvalue()
        print "Failed while writing: '%s'" % file_save
        print stacktrace
    doc.dispose()

def init_openoffice():
    # Init: Connect to running soffice process
    context = uno.getComponentContext()
    resolver=context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", context)
    try:
        ctx = resolver.resolve(
            "uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext")
    except:
        print "Could not connect to running openoffice."
        usage()
        sys.exit(1)
    smgr=ctx.ServiceManager
    desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop",ctx)
    return desktop

def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "", [
            "extension=", "format=", "destination="])
    except getopt.GetoptError,e:
        print e
        usage()
        sys.exit(1)

    global extension
    global format
    global destination
    for o, a in opts:
        if o=="--extension":
            extension=a
            assert(not extension.startswith("."))
        elif o=="--format":
            format=a
	elif o=="--destination":
            destination=a
        else:
            raise("Internal Error, undone option: %s %s" % (
                o, a))
    if (not extension) and (not format):
        extension="html"
    elif extension and format:
        pass
    else:
        print "You need to set format and extension."
        usage()
        sys.exit(1)

    if not args:
        usage()
        sys.exit(1)

    desktop=init_openoffice()
    for file in args:
        do_dir(file, desktop, destination)

if __name__=="__main__":
    main()

