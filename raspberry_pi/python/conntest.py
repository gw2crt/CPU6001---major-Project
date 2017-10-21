import obd
from obd import OBDStatus

# successful communication with the ELM327 and the vehicle
OBDStatus.CAR_CONNECTED # "Car Connected"

connection = obd.OBD() # auto-connects to USB or RF port

cmd = obd.commands.RPM # select an OBD command (sensor)

response = connection.query(cmd) # send the command, and parse the response

print(response.value) # returns unit-bearing values thanks to Pint


from pymongo import MongoClient
# pprint library is used to make the output look more pretty
from pprint import pprint
# connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
client = MongoClient('mongodb://gareth:1utmHy2HBYCKZWLO@testing-shard-00-00-ic2uk.mongodb.net:27017,testing-shard-00-01-ic2uk.mongodb.net:27017,testing-shard-00-02-ic2uk.mongodb.net:27017/test?ssl=true&replicaSet=testing-shard-0&authSource=admin')

db=client.testdb

from datetime import datetime

result = db.restaurants.insert_one(
    {
        "Vehicle": {
            "Model": "Smart",
            "Year": "2005",
            "Type": "Roadster",
            "RPM": response.value.magnitude
        }
    }
)
