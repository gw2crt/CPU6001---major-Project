import obd
import time

connection = obd.Async()

# a callback that prints every new value to the console
def new_rpm(r):
    print r.value

def new_tps(t):
    print t.value

def new_speed(s):
    print s.value

def new_maf(m):
    print m.value

def new_erun(e):
    print r.value

def new_fuel(f):
    print f.value



connection.watch(obd.commands.RPM, callback=new_rpm)
connection.watch(obd.commands.THROTTLE_POS, callback=new_tps)
connection.watch(obd.commands.SPEED, callback=new_speed)
connection.watch(odb.commands.MAF, callback=new_maf)
connection.watch(obd.commands.RUN_TIME, callback=new_erun)
connection.watch(obd.commands.FUEL_RATE, connection=new_fuel)

connection.start()

# the callback will now be fired upon receipt of new values

#time.sleep(0)
#connection.stop()
