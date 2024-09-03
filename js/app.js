var myCharacteristic;
var myLatitude;
var mylongitude;

const noDevice = 'no device selected';
var deviceName = noDevice;

const setDeviceName = (name) => {
  deviceName = name;
  document.getElementById("device").textContent = deviceName;
}


var rowData = [];

// Grid Options: Contains all of the Data Grid configurations
const gridOptions = {
  rowData: rowData,
  columnDefs: [
    {field: "datetime", flex: 2, headerName: 'Date & time', valueFormatter: (date) => date.value.toUTCString()},
    {field: "measurementValue", flex: 1, headerName: 'Measurement value'},
    {field: "measurementType", flex: 1, headerName: 'Measurement type'},
    {field: "latitude", flex: 1},
    {field: "longitude", flex: 1}
  ]
};

// Your Javascript code to create the Data Grid
const myGridElement = document.querySelector('#myGrid');

var loaded = false;
var gridApi;

if (!loaded) {
  loaded = true;
  gridApi = agGrid.createGrid(myGridElement, gridOptions);

  const interval = setInterval(function () {
    navigator.geolocation.getCurrentPosition(function (location) {
      myLatitude = location.coords.latitude;
      mylongitude = location.coords.longitude;
    });
  }, 1000);
}

setDeviceName(noDevice);

document.getElementById("start").onclick = (e) => {
  console.log('Requesting Bluetooth Device...');

  navigator.bluetooth.requestDevice({filters: [{services: ['0000fff0-0000-1000-8000-00805f9b34fb']}]})
    .then(device => {
      setDeviceName(device.name);
      console.log('Connecting to GATT Server...');
      return device.gatt.connect();
    })
    .then(server => {
      console.log('Getting Service...');
      return server.getPrimaryService(0xfff0);
    })
    .then(service => {
      console.log('Getting Characteristic...');
      return service.getCharacteristic(0xfff2);
    })
    .then(characteristic => {
      myCharacteristic = characteristic;
      return myCharacteristic.startNotifications().then(_ => {
        console.log('> Notifications started');
        myCharacteristic.addEventListener('characteristicvaluechanged',
          handleNotifications);
      });
    })

    .catch(error => {
      console.error(error);
    });
};
document.getElementById("stop").onclick = (e) => {
  if (myCharacteristic) {
    myCharacteristic.stopNotifications()
      .then(_ => {
        console.log('> Notifications stopped');
        myCharacteristic.removeEventListener('characteristicvaluechanged',
          handleNotifications);
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });
    setDeviceName(noDevice);
  }
};
document.getElementById("export").onclick = (e) => {
  gridApi.exportDataAsCsv({
    fileName: 'measurements-' + deviceName + '-' + (new Date()).toISOString() + '.csv',
    columnSeparator: ';',
  })
};

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    // value.getUint8(1).toExponential()
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  // if (a.length >10 && a.length < 15) {
  //   a = [...Array(15-a.length), ...a]
  // }
  if (a.length == 15) {
    const typeCode = a[13]
    let type = ""
    switch (typeCode) {
      case '0x01':
        type = 'µSv'
        break
      case '0x04':
        type = 'µSV/h'
        break
      case '0x05':
        type = 'mR/h'
        break
      case '0x06':
        type = 'CPS'
        break
      case '0x07':
        type = 'CPM'
        break
      case '0x08':
        type = 'impulse'
        break
      case '0x09':
        type = 'impulse (timer on)'
        break
    }

    let divider = 1
    const dividerCode = a[12]
    switch (dividerCode) {
      case '0x01':
        divider = 10
        break
      case '0x02':
        divider = 100
        break
      case '0x03':
        divider = 1000
        break
    }

    const value = parseInt(a[10].slice(2) + a[9].slice(2), 10) / divider


    rowData.unshift({
      datetime: new Date(),
      measurementValue: value,
      measurementType: type,
      latitude: myLatitude,
      longitude: mylongitude,
    })
    gridApi.setGridOption("rowData", rowData);

    console.log('Current measurement: ' + value + ' - ' + a.join(", "));
  } else {
    console.log(a.length + ' - ' + a.join(", "))
  }
}
