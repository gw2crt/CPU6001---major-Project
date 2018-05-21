#include <CurieBLE.h>
#include <CurieIMU.h>
#include <CurieTime.h>

BLEPeripheral blePeripheral;  // BLE Peripheral Device (the board you're programming)
BLEService vehicleData("19b10000-e8f2-537e4f6c-d104768a1214"); // BLE Vehicle Service

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEUnsignedCharCharacteristic switchCharacteristic("19b10001-e8f2-537e4f6c-d104768a1216",  // standard 16-bit characteristic UUID
    BLERead | BLENotify);
BLEUnsignedCharCharacteristic CharacteristicX("4227f3b1-d6a2-4fb2-a916-3bee580a9c84", BLERead | BLENotify); 

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

    blePeripheral.setLocalName("Vehicle_Data");
    blePeripheral.setAdvertisedServiceUuid(vehicleData.uuid());

    // add service and characteristic:
    blePeripheral.addAttribute(vehicleData);
    blePeripheral.addAttribute(switchCharacteristic);
    blePeripheral.addAttribute(CharacteristicX);
  
    // set the initial value for the characeristic:
    switchCharacteristic.setValue(0);
    CharacteristicX.setValue(0);
    // begin advertising BLE service:
   blePeripheral.begin();
    
    
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
  BLECentral central = blePeripheral.central();
  
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());

      while (central.connected()) {    
              int prevCount = accCount;    
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
               Serial.print("Prev");
               Serial.println(prevCount);
               Serial.print("acc");
                Serial.println(accCount);
                           
              if (prevCount < accCount) {
                Serial.println("if Func");
                   updateSensor();
              }
              
               
    } //end of BLE While loop 
 } //end of BLE connect
}
   
void updateSensor(){
  int sensorLevel = accCount;
  Serial.println(accCount);
  switchCharacteristic.setValue(sensorLevel);
  }
  
void updateSensor2(){  
  float x = CurieIMU.readAccelerometerScaled(ax) * 1000 ;
  CharacteristicX.setValue(x);
  }
  



