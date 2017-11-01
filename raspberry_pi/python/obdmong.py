import obd
from obd import OBDStatus

while (OBDStatus.CAR_CONNECTED):
    # successful communication with the ELM327 and the vehicle

    connection = obd.OBD() # auto-connects to USB or RF port

    spd = obd.commands.SPEED
    rpm = obd.commands.RPM # select an OBD command (sensor)
    tps = obd.commands.THROTTLE_POS
    maf = obd.commands.MAF
    engload = obd.commands.ENGINE_LOAD

    speed = connection.query(spd)
    revolution = connection.query(rpm) # send the command, and parse the response
    throttle_pos = connection.query(tps)
    massflow = connection.query(maf)
    engine_load = connection.query(engload)

    print(speed.value)
    print(revolution.value) # returns unit-bearing values thanks to Pint
    print(throttle_pos.value)
    print(massflow.value)
    print (engine_load.value)

    from pymongo import MongoClient
    # pprint library is used to make the output look more pretty
    from pprint import pprint
    # connect to MongoDB, change the << MONGODB URL >> to reflect your own connection string
    client = MongoClient('mongodb://gareth:1utmHy2HBYCKZWLO@testing-shard-00-00-ic2uk.mongodb.net:27017,testing-shard-00-01-ic2uk.mongodb.net:27017,testing-shard-00-02-ic2uk.mongodb.net:27017/test?ssl=true&replicaSet=testing-shard-0&authSource=admin')

    db=client.testdb

    from datetime import datetime

    result = db.smartcar.insert_one(
        {
            "Vehicle": {
                "Model": "Smart",
                "Year": "2005",
                "Type": "Roadster",
                "Speed": speed.value.magnitude,
                "RPM": revolution.value.magnitude,
                "TPS": throttle_pos.value.magnitude,
                "MAF": massflow.value.magnitude,
                "EngineLoad": engine_load.value.magnitude
            }
        }
    )
