
const BluetoothDevice = require('web-bluetooth');

var exampleDevice = new BluetoothDevice({
  name: 'General'
});

console.log(exampleDevice.connected);
