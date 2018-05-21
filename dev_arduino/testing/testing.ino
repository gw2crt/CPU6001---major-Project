#include "CurieBLE.h"
#include "CurieIMU.h"
#include "CurieTime.h"

BLEPeripheral blePeripheral;  // BLE Peripheral Device (the board you're programming)
BLEService ledService("19b10000-e8f2-537e4f6c-d104768a1214"); // BLE LED Service

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEUnsignedCharCharacteristic switchCharacteristic("19b10001-e8f2-537e4f6c-d104768a1216", BLERead | BLENotify); 

float ax,ay,az;
unsigned long start, finished, elapsed, startTime;
boolean running = true;

int accCount = 0; //Counter to store number of times Acc has exceeded limit
int brakeCount = 0; //Counter to store number of times Braking has exceeded the limit
int totalTimeacc = 0;
int totalTimebrake = 0;
 


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
    while(!Serial);

    blePeripheral.setLocalName("BUS");
    blePeripheral.setAdvertisedServiceUuid(ledService.uuid());

    // add service and characteristic:
    blePeripheral.addAttribute(ledService);
    blePeripheral.addAttribute(switchCharacteristic);
    
  
    // set the initial value for the characeristic:
    switchCharacteristic.setValue(0);
    
    // begin advertising BLE service:
     blePeripheral.begin();
     
     BLECentral central = blePeripheral.central();
   
    CurieIMU.begin(); //Begin the IMU Libary
    CurieIMU.setAccelerometerRange(32); //Sets the range of the accerelormeter

    //IMU Calibration
    int calibrateOffsets = 1;
      if (calibrateOffsets == 1){
      CurieIMU.autoCalibrateAccelerometerOffset(X_AXIS, 0);
      CurieIMU.autoCalibrateAccelerometerOffset(Y_AXIS, 0);
      CurieIMU.autoCalibrateAccelerometerOffset(Z_AXIS, 1); 
      }
     }  
void loop() {
  // put your main code here, to run repeatedly: 
           
              CurieIMU.readAccelerometerScaled(ax, ay, az);
              
              if (ax >=0.30) {
                start=millis();
                Serial.print("Acc Over Limit: ");
                Serial.print(ax);    
                  while(ax >= 0.30){    
                    CurieIMU.readAccelerometerScaled(ax, ay, az);
                      if (ax <=0.29) {
                        finished=millis();
                        elapsed = finished - start;
                        totalTimeacc = totalTimeacc + elapsed;    
                        Serial.print(" For: ");
                        Serial.print(elapsed);
                        Serial.print(" ms");
                        Serial.println("");
                        }
                        delay(200);
                  }
               accCount++;
               Serial.print("Occurance: ");
               Serial.print(accCount);
               Serial.print(" ");
               Serial.print("Total Time over: ");
               Serial.print(totalTimeacc);
               Serial.println();
               Serial.println(" -- -- -- ");
               Serial.println();   
              }
            
              if (ax <= -0.30) {
                start=millis();
                Serial.print("Braking Over Limit: ");
                Serial.print(ax);    
                  while(ax <= -0.30){    
                    CurieIMU.readAccelerometerScaled(ax, ay, az);
                      if (ax >= -0.29) {
                        finished=millis();
                        elapsed = finished - start;
                        totalTimebrake = totalTimebrake + elapsed;  
                        Serial.print(" For: ");
                        Serial.print(elapsed);
                        Serial.print(" ms");
                        Serial.println("");
                        }
                        delay(200);
                  }
               brakeCount++;
               Serial.print("Occurance: ");
               Serial.print(brakeCount);
               Serial.print(" ");
               Serial.print("Total Time over: ");
               Serial.print(totalTimebrake);
               Serial.println();
               Serial.println(" -- -- -- ");
               Serial.println();   
              }
              
              updateSensor();
             
}
   
void updateSensor(){
  serial.print("update")   
  int sensorLevel = accCount;
  switchCharacteristic.setValue(sensorLevel);
  }
  



