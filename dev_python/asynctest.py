import obd
import time

connection = obd.Async()

# a callback that prints every new value to the console
def new_rpm(r):
    print r.value
    sausage = r.value.magnitude
    
    from pymongo import MongoClient
    # pprint library is used to make the output look more pretty
    from pprint import pprint
    # connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
    client = MongoClient('mongodb://gareth:1utmHy2HBYCKZWLO@testing-shard-00-00-ic2uk.mongodb.net:27017,testing-shard-00-01-ic2uk.mongodb.net:27017,testing-shard-00-02-ic2uk.mongodb.net:27017/test?ssl=true&replicaSet=testing-shard-0&authSource=admin')

    db=client.testdb

    from datetime import datetime

    result = db.smartcartest.insert_one(
        {
            "Vehicle": {
                "Model": "Smart",
                "Year": "2005",
                "Type": "Roadster",
                "RPM": sausage
            }
        }
    ) 


connection.watch(obd.commands.RPM, callback=new_rpm)
connection.start()


# the callback will now be fired upon receipt of new values

time.sleep(60)
connection.stop()