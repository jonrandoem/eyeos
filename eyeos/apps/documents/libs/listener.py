#!/usr/bin/python
import time
import sys
import stomp
import simplejson as json
import os
import diff_match_patch as dmp_module
import random
import logging

LOG_FILENAME = '/tmp/logging_example.out'
logging.basicConfig(filename=LOG_FILENAME,level=logging.DEBUG)

haspong = 1;
dmp = dmp_module.diff_match_patch()
class MyListener(object):
	def __init__(self):
		self.haspong = 1
	def deleteFile(self):
		os.remove(self.fileTemp)
	def setFile(self, file, duid):
		self.originalFile = file
		self.duid = duid;
		f = open(file, 'r')
		self.content = f.read()
		f.close()
		self.fileTemp = '/tmp/doc_'+duid
		if os.path.exists('/tmp/doc_'+duid):
			os.remove('/tmp/doc_'+duid)
		f = os.open(self.fileTemp, os.O_EXCL|os.O_WRONLY|os.O_CREAT, 0600)
		os.write(f, self.content);
		os.close(f) 
	def decreaseHasPong(self):
		self.haspong = 0
	def getHasPong(self):
		return self.haspong
	def on_message(self, headers, message):
		message = json.loads(message)
		data = json.loads(message['data'])
		if data == "refresh":
		    self.setFile(self.originalFile, self.duid);
		elif data != "ping":
			patch = dmp.patch_fromText(data)
			results = dmp.patch_apply(patch, self.content);
			results = results[0]
			self.content = results
			if os.path.exists(self.fileTemp):
				os.remove(self.fileTemp)
			f = os.open(self.fileTemp, os.O_EXCL|os.O_WRONLY|os.O_CREAT, 0600)
			os.write(f, self.content);
			os.close(f)
		self.haspong = 1

channel = sys.argv[1]
file = sys.argv[2]
duid = sys.argv[3]

listener = MyListener()
listener.setFile(file, duid)
if os.fork() != 0:
	sys.exit()
conn = stomp.Connection([('localhost', 61613)])
conn.set_listener('', listener)
conn.start()
conn.connect()

conn.subscribe(destination=channel, ack='auto')

while(1):
	if listener.getHasPong() == 0:
		listener.deleteFile()
                conn.disconnect()
		sys.exit()
	listener.decreaseHasPong()
	time.sleep(80)
conn.disconnect()
