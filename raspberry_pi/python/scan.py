import obd

connection = obd.Async() # auto-connects to USB or RF port

#obd.logger.setLevel(obd.logging.DEBUG) Debug Tool

connection.watch(obd.commands.RPM)
connection.watch(obd.commands.THROTTLE_POS)
connection.watch(obd.commands.SPEED)

connection.start()

print connection.query(obd.commands.RPM)
print connection.query(obd.commands.THROTTLE_POS)
print connection.query(obd.commands.SPEED)
