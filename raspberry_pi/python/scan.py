import obd
import time

connection = obd.Async()

# a callback that prints every new value to the console
def new_spd(s):
	print s.value

def new_rpm(r):
    print r.value

def new_tps(t):
	print t.value

def new_maf(m):
	print m.value

def new_ful(f):
	print f.value

connection.watch(obd.commands.SPEED, callback=new_spd)
connection.watch(obd.commands.RPM, callback=new_rpm)
connection.watch(obd.commands.THROTTLE_POS, callback=new_tps)
connection.watch(obd.commands.MAF, callback=new_maf)
connection.watch(obd.commands.ENGINE_LOAD, callback=new_ful)
connection.start()

# the callback will now be fired upon receipt of new values

time.sleep(60)
connection.stop()