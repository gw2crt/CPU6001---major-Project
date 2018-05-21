import RPi.GPIO as GPIO  
a = GPIO.VERSION  
print a

GPIO.setmode(GPIO.BOARD)
mode = GPIO.getmode()

GPIO.setup (40, GPIO.OUT, initial=GPIO.HIGH)




