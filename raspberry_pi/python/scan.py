#import RPI.GPIO as GPIO
import obd
import time
from pymongo import MongoClient
import pprint
import datetime

client = MongoClient('mongodb://gareth:1utmHy2HBYCKZWLO@testing-shard-00-00-ic2uk.mongodb.net:27017,testing-shard-00-01-ic2uk.mongodb.net:27017,testing-shard-00-02-ic2uk.mongodb.net:27017/test?ssl=true&replicaSet=testing-shard-0&authSource=admin')
db=client.testdb

#GPIO.setmode(GPIO.BOARD)

#GPIO.setup(40, GPIO.OUT, initial=GPIO.HIGH) #Setup to initial value as HIGH as the vehicle will be stationary at setup.

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

def new_elod(l):
	print l.value

connection.watch(obd.commands.SPEED, callback=new_spd)
connection.watch(obd.commands.RPM, callback=new_rpm)
connection.watch(obd.commands.THROTTLE_POS, callback=new_tps)
connection.watch(obd.commands.MAF, callback=new_maf)
connection.watch(obd.commands.ENGINE_LOAD, callback=new_elod)
connection.start()

was_running = connection.running
connection.stop()

result = db.smartcarasync.insert_one(
        {
            "Vehicle": {
                "Model": "Smart",
                "Year": "2005",
                "Type": "Roadster",
                "RPM": "sausage"
            }
        }
    )


if was_running:
    connection.start()



# Note: if s.value.magnitude != 0: GPIO.output(1, LOW) <- If the vehicle isnt moving the GPIO is set to HIGH. this needs testing

# the callback will now be fired upon receipt of new values

time.sleep(60)
connection.stop()
