const { EventListener } = require('./events')

let ManufacturerEvent = new EventListener();
ManufacturerEvent.contractEventListener("manufacturer", "Admin", "autochannel",
    "KBA-Automobile", "CarContract", "addCarEvent");