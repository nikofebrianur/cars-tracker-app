const { EventListener } = require('./events')

let ManufacturerEvent = new EventListener();
ManufacturerEvent.txnEventListener("manufacturer", "Admin", "autochannel",
    "KBA-Automobile", "CarContract", "createCar",
    "Car073", "Sedan", "Honda City", "White", "11/05/2021", "Honda");