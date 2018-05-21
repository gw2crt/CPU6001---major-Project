var noble = require('noble');

// start scanning when bluetooth is powered on

// Search only for the Service UUID of the device (remove dashes)
var serviceUuids = ['19b10000-e8f2-537e4f6c-d104768a1214'];

// Search only for the led charateristic
var characteristicUuids = ['19b10001-e8f2-537e4f6c-d104768a1216'];

var myArray = [ ];

var newDate = new Date();
var timeString = newDate.toString();



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

                console.log('discovered characteristics');

                console.log(timeString);

                ledCharacteristic.on('data', function(data, isNotification) {
                    myArray[0] =  data.readUInt8().toFixed(1);
                    console.log(myArray[0].toString());
                });

                ledCharacteristic.subscribe(function(error) {
                });
            });
        });
    });
});