var noble = require('noble');
// Search only for the Service UUID of the device (remove dashes)
var serviceUuids = ['19b10000e8f2537e4f6cd104768a1214'];

// Search only for the led charateristic
var characteristicUuids = ['21d000512e7f4725b75f1c6deaa037e9', '19ffdafeab0e46f8983978b2b8129a65', '6d949dc6130e4aa7b044135bb9bd6b53', 'd7da537e341b4d4d85f6bc68458acc2c', 'b411fca49b034db091964427bcf16b8e', '9fdee997eaa64f9ebd4d3a477100353c'];

var newDate = new Date();
var timeStamp = newDate.toString();
timeStamp = timeStamp.split(' ').slice(0,5).join(' '); //removes UTC info from time Stamp.

//console.log(timeString); //TimeStamp test.

var resultOut = {Date: timeStamp, type:0, Occurance: 0, Time: 0, gForce: 0};
var collectedData = [ ];
var counter = 0;


// start scanning when bluetooth is powered on
noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(serviceUuids);
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {
    peripheral.connect(function(error) {
        console.log('connected to peripheral: ' + peripheral.uuid);
        peripheral.discoverServices(serviceUuids, function(error, services) {
            var batteryService = services[0];
            console.log('discovered Vehicle Data service');

            batteryService.discoverCharacteristics(characteristicUuids, function(error, characteristics) {
                var batteryLevelCharacteristic = characteristics[0];
                //console.log('discovered accOccurrenceChar characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readUInt8(0) + ' Acc Occurance Number');
                    resultOut["type"] = 'Acc';
                    resultOut["Occurance"] = data.readUInt8(0);
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    console.log('Ready');
                });

                var batteryLevelCharacteristic = characteristics[1];
                //console.log('discovered Acceleration Force characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readInt16LE() + ' MilliSeconds');
                    resultOut["Time"] = data.readInt16LE();
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                var batteryLevelCharacteristic = characteristics[2];
                //console.log('discovered Acceleration Elapsed Time characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readFloatLE().toFixed(2) + ' gForce');
                    resultOut["gForce"] = data.readFloatLE().toFixed(2);

                    console.log(JSON.stringify(resultOut));
                    collectedData.push(resultOut);
                    console.log(collectedData.toString());
                    counter++;
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                // ----- Braking -----

                var batteryLevelCharacteristic = characteristics[3];
                //console.log('discovered Brake Occurrence characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readUInt8(0) + ' Brake Occurrence Number');
                    resultOut["type"] = 'Brake';
                    resultOut["Occurance"] = data.readUInt8(0);
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                var batteryLevelCharacteristic = characteristics[4];
                //console.log('discovered Brake Force characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readInt16LE() + ' Milliseconds');
                    resultOut["Time"] = data.readInt16LE();
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });

                var batteryLevelCharacteristic = characteristics[5];
                //console.log('discovered Brake Elapsed Time characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    //console.log('', data.readFloatLE().toFixed(2) + ' gForce');
                    resultOut["gForce"] = data.readFloatLE().toFixed(2);
                    console.log(JSON.stringify(resultOut));
                    collectedData.push(JSON.stringify(resultOut));
                    //console.log(collectedData.toString());
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    //console.log('battery level notification on');
                });
            });
        });
    });
});

