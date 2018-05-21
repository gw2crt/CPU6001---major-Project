import RPi.GPIO as GPIO
import obd
from obd import OBDStatus
import datetime
from pymongo import MongoClient
from pprint import pprint


GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(18,GPIO.OUT)

now = datetime.datetime.now()
timeStamp = 0

collectedData = [ ]
resultOut = { 'timestamp':0, 'Speed':0, 'RPM':0, 'TPS':0, 'MAF':0, 'EngLoad':0 }


while (OBDStatus.CAR_CONNECTED):
    # successful communication with the ELM327 and the vehicle
    timestamp = now.strftime("%Y-%m-%d %H:%M")
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
    print(revolution.value.magnitude) # returns unit-bearing values thanks to Pint
    print(throttle_pos.value)
    print(massflow.value)
    print (engine_load.value)

    resultOut['timestamp'] = timestamp
    resultOut['Speed'] = speed.value.magnitude
    resultOut['RPM'] = revolution.value.magnitude
    resultOut['TPS'] = throttle_pos.value.magnitude
    resultOut['MAF'] = massflow.value.magnitude
    resultOut['EngLoad'] = engine_load.value.magnitude

    print resultOut

    if speed.value.magnitude <= 1:
        GPIO.output(18,GPIO.HIGH)
    elif speed.value.magnitude >= 2:
        GPIO.output(18,GPIO.LOW)
    else:
        GPIO.output(18,GPIO.LOW)
