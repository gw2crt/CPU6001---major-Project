#include <CurieBLE.h>
#include <CurieIMU.h>
#include <CurieTime.h>

BLEPeripheral blePeripheral;  // BLE Peripheral Device
BLEService vehicleData("19b10000-e8f2-537e4f6c-d104768a1214"); // BLE Vehicle Data serviceUuids

// BLE Acceleration Characteristic - custom 128-bit UUID, read and Nofify Raspberry Pi
BLEIntCharacteristic accOccurrenceChar("21d00051-2e7f-4725-b75f-1c6deaa037e9", BLERead | BLENotify);
BLEIntCharacteristic accelerationForceChar("19ffdafe-ab0e-46f8-9839-78b2b8129a65", BLERead | BLENotify);
BLEFloatCharacteristic accElapsedChar("6d949dc6-130e-4aa7-b044-135bb9bd6b53", BLERead | BLENotify);

// BLE Brake Characteristic - Custom 128bit UUID Read and Nofity Raspberry Pi
BLEIntCharacteristic brakeOccurrenceChar("d7da537e-341b-4d4d-85f6-bc68458acc2c", BLERead | BLENotify);
BLEIntCharacteristic brakeForceChar("b411fca4-9b03-4db0-9196-4427bcf16b8e", BLERead | BLENotify);
BLEFloatCharacteristic brakeElapsedChar("9fdee997-eaa6-4f9e-bd4d-3a477100353c", BLERead | BLENotify);

// Variable setup

float ax,ay,az;
float accelerationForce;
float brakeForce;
unsigned long finished, elapsed, startTime;

//counter setup
int accOccurrenceCounter = 0; //Counter to store number of times Acc has exceeded limit
int brakeOccurrenceCounter = 0; //Counter to store number of times Braking has exceeded the limit
int totalTimeacc = 0;
int totalTimebrake = 0;

void setup() {
  //Setup Code - will only start once BLE connection is made

  Serial.begin(9600);
    blePeripheral.setLocalName("Vehicle_Data"); // advertised name
    blePeripheral.setAdvertisedServiceUuid(vehicleData.uuid());

    // add service and characteristic:
    blePeripheral.addAttribute(vehicleData);

    blePeripheral.addAttribute(accOccurrenceChar);
    blePeripheral.addAttribute(accelerationForceChar);
    blePeripheral.addAttribute(accElapsedChar);

    blePeripheral.addAttribute(brakeOccurrenceChar);
    blePeripheral.addAttribute(brakeForceChar);
    blePeripheral.addAttribute(brakeElapsedChar);


    // set the initial value for the characeristic:
    accOccurrenceChar.setValue(0);
    accelerationForceChar.setValue(0);
    accElapsedChar.setValue(0);

    brakeOccurrenceChar.setValue(0);
    brakeForceChar.setValue(0);
    brakeElapsedChar.setValue(0);

    // begin advertising BLE service:
   blePeripheral.begin();


    CurieIMU.begin(); //Begin the IMU Libary
    CurieIMU.setAccelerometerRange(8); //Sets the range of the accerelormeter

    //IMU Calibration
    int calibrateOffsets = 1;
      if (calibrateOffsets == 1){
      CurieIMU.autoCalibrateAccelerometerOffset(X_AXIS, 0);
      CurieIMU.autoCalibrateAccelerometerOffset(Y_AXIS, 0);
      CurieIMU.autoCalibrateAccelerometerOffset(Z_AXIS, 1);
      }
}

void loop() {
  // connection to RPI via blue
  BLECentral central = blePeripheral.central();

  if (central) {
    //Serial.print("Connected to central: ");
    // print the central's MAC address: // console log testing
    //Serial.println(central.address());

      while (central.connected()) {

              // occurance counter
              int prevAccCount=accOccurrenceCounter;
              int prevBrakeCount=brakeOccurrenceCounter;
              // accelerometer read - only ax is used ay & az left in to be added at a later date.
              CurieIMU.readAccelerometerScaled(ax, ay, az);
              // compariable G force limit

              // if over limit start timer
              if (ax >= 0.45){
                startTime=millis();
                //Serial.print("Acc Over Limit: ");
                //Serial.print(ax);
                accelerationForce = ax;
                  //while still over the limit, read the accelerometer and compare
                  while(ax >= 0.44 ){
                    CurieIMU.readAccelerometerScaled(ax, ay, az);
                    //Serial.print(ax);
                    // if lower than the comparable rate, end loop and stop timer
                      if (ax <= 0.45) {
                        finished=millis();
                        elapsed=finished-startTime;
                        //totalTimeacc=totalTimeacc + elapsed;
                        //Serial.print(ax);
                        //Serial.println("");
                        //Serial.print(" For: ");
                        //Serial.print(elapsed);
                        //Serial.print(" ms");
                        //Serial.println("");
                        }
                        //!!! Small delay to stop Memory leak when testing with the Smart Roadster !!!
                        delay(50);
                  }
                  // accourance counter
               accOccurrenceCounter++;
               // - Console log testing
               //Serial.print(ax);
               //Serial.print("Occurrence: ");
               //Serial.print(accOccurrenceCounter);
               //Serial.print(" ");
               //Serial.print("Total Time over: ");
               //Serial.print(totalTimeacc);
               //Serial.println();
               //Serial.println(" -40 -- -- ");
               //Serial.println();
              }
              if (prevAccCount < accOccurrenceCounter) {
                  updateAcc();
              }

              // Opposite for the Braking scanario

              // compariable G force limit
              if (ax <= -0.55) {
                startTime=millis();

                //Serial.print("Braking Over Limit: ");
                //Serial.print(ax);
                brakeForce = ax;
                  while(ax <= -0.54){
                    CurieIMU.readAccelerometerScaled(ax, ay, az);
                      if (ax >= -0.55) {
                        finished=millis();
                        elapsed=finished-startTime;
                        totalTimebrake=totalTimebrake + elapsed;
                        //Serial.print(" For: ");
                        //Serial.print(elapsed);
                        //Serial.print(" ms");
                        //Serial.println("");
                        }
                        delay(50);
                  }
               brakeOccurrenceCounter++;
               //Serial.print("Occurrence: ");
               //Serial.print(brakeOccurrenceCounter);
               //Serial.print(" ");
               //Serial.print("Total Time over: ");
               //Serial.print(totalTimebrake);
               //Serial.println();
               //Serial.println(" -- -- -- ");
               //Serial.println();
              }

              if (prevBrakeCount < brakeOccurrenceCounter){
                   updateBrake();
              }

    } //end of BLE While loop
 } //end of BLE connect
}

// functions to send the data via BLE to the RPI, Fired when a value is changed BLE NOTIFY.

void updateAcc(){
  int OccurrenceCounter = accOccurrenceCounter;
  accOccurrenceChar.setValue(OccurrenceCounter);
  accelerationForceChar.setValue(elapsed);
  accElapsedChar.setValue(accelerationForce);
 }

 void updateBrake() {
  int OccurrenceCounter = brakeOccurrenceCounter;
  brakeOccurrenceChar.setValue(OccurrenceCounter);
  brakeForceChar.setValue(elapsed);
  brakeElapsedChar.setValue(brakeForce);
 }
