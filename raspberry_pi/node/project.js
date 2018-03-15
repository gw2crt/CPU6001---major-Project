var noble = require('noble');

// Search only for the Service UUID of the device (remove dashes)
var serviceUuids = ['19b10000e8f2537e4f6cd104768a1214'];

// Search only for the led charateristic
var characteristicUuids = ['19b10001e8f2537e4f6cd104768a1216'];

var newDate = new Date();
var timeString = newDate.toString();

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
        peripheral.discoverServices(['19b10000e8f2537e4f6cd104768a1214'], function(error, services) {
            var batteryService = services[0];
            console.log('discovered Battery service');

            batteryService.discoverCharacteristics(['19b10001e8f2537e4f6cd104768a1216', '4227f3b1d6a24fb2a9163bee580a9c84'], function(error, characteristics) {
                var batteryLevelCharacteristic = characteristics[0];
                console.log('discovered Battery Level characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    console.log('Acc Exceed ', data.readUInt8(0) + ' Ouhhh');
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    console.log('battery level notification on');
                });
                var batteryLevelCharacteristic = characteristics[1];
                console.log('discovered Battery Level characteristic');

                batteryLevelCharacteristic.on('data', function(data, isNotification) {
                    console.log('brake Exceed ', data.readUInt8(0) + ' Ouhhh');
                });
                // to enable notify
                batteryLevelCharacteristic.subscribe(function(error) {
                    console.log('battery level notification on');
                });

            });

        });
    });
});
