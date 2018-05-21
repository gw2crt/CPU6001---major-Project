# imported modules -

import RPi.GPIO as GPIO
import obd
from obd import OBDStatus
import datetime
from pprint import pprint


GPIO.setmode(GPIO.BCM) # Set GPIO pinout structure
GPIO.setwarnings(False)
GPIO.setup(18,GPIO.OUT) # Raspberry PI zero Pin out number 18 used for Automated Passenger Counting

#now = datetime.datetime.now()
#timeStamp = 0

# OBD array
collectedData = [ ]
resultOut = { 'timestamp':0, 'Speed':0, 'RPM':0, 'TPS':0, 'MAF':0, 'EngLoad':0 }


while (OBDStatus.CAR_CONNECTED):
    # successful communication with the ELM327 and the vehicle
    now = datetime.datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
    connection = obd.OBD() # auto-connects to USB or RF port

# select an OBD command (The sensors you require)
    spd = obd.commands.SPEED
    rpm = obd.commands.RPM
    tps = obd.commands.THROTTLE_POS
    maf = obd.commands.MAF
    engload = obd.commands.ENGINE_LOAD

# variable storage from the sensor
    speed = connection.query(spd)
    revolution = connection.query(rpm) # send the command, parse the response
    throttle_pos = connection.query(tps)
    massflow = connection.query(maf)
    engine_load = connection.query(engload)

# print out testing to see values within console
    #print(speed.value)
    #print(revolution.value.magnitude) # returns unit-bearing values using Pint
    #print(throttle_pos.value)
    #print(massflow.value)
    #print (engine_load.value)

# Storing OBD quiered data to array
    resultOut['timestamp'] = timestamp
    resultOut['Speed'] = speed.value.magnitude
    resultOut['RPM'] = revolution.value.magnitude
    resultOut['TPS'] = throttle_pos.value.magnitude
    resultOut['MAF'] = massflow.value.magnitude
    resultOut['EngLoad'] = engine_load.value.magnitude

# print resultOut # Test array print output

# -- -- -- -- -- -- #
#APC code to turn on/off port 18

    if speed.value.magnitude <= 1:
        GPIO.output(18,GPIO.HIGH)
    elif speed.value.magnitude >= 2:
        GPIO.output(18,GPIO.LOW)
    else:
        GPIO.output(18,GPIO.LOW)
