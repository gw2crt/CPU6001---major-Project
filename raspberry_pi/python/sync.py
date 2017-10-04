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

connection.watch(obd.commands.RPM, callback=new_rpm, obd.commands.THROTTLE_POS, callback=new_tps, obd.commands.SPEED, callback=new_speed)
connection.start()

# the callback will now be fired upon receipt of new values

time.sleep(60)
connection.stop()
