var noble = require('noble');

// Search only for the Service UUID of the device (remove dashes)
var serviceUuids = ['19b10000e8f2537e4f6cd104768a1214'];

// Search only for the led charateristic
var characteristicUuids = ['19b10001e8f2537e4f6cd104768a1216'];

var newDate = new Date();
var timeString = newDate.toString();

var myArray = [ ];

// start scanning when bluetooth is powered on

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(serviceUuids);
    } else {
        noble.stopScanning();
    }
});

// Search for BLE peripherals

noble.on('discover', function(peripheral) {
    peripheral.connect(function(error) {
        console.log('connected to peripheral: ' + peripheral.uuid);
        // Only discover the services we specified above
        peripheral.discoverServices(serviceUuids, function(error, services) {
            var service = services[0];
            console.log('discovered service');

            service.discoverCharacteristics(characteristicUuids, function(error, characteristics) {
                // Assign Characteristic
                var ledCharacteristic = characteristics[0];
                //var xCharacteristic = characteristics[1];
                //var yCharacteristic = characteristics[2];

                console.log('discovered characteristics');

                console.log(timeString);

                ledCharacteristic.on('data', function(data, isNotification) {
                    //myArray[0] = data.readUInt8(0);
                    console.log(data.readUInt8(0));
                });

                ledCharacteristic.subscribe(function(error) {
                });

                /*xCharacteristic.on('data', function(data, isNotification) {
                    myArray[1] =  data.readFloatLE();
                    console.log(myArray[1].toString());
                });

                xCharacteristic.subscribe(function(error) {
                });

                /*yCharacteristic.on('data', function(data, isNotification) {
                    myArray[2] = data.readInt8(0);
                    console.log(myArray[2].toString());
                });

                yCharacteristic.subscribe(function(error) {
                });*/

            });
        });
    });
});