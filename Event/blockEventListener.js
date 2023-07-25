const { EventListener } = require('./events')

let ManufacturerEvent = new EventListener();
ManufacturerEvent.blockEventListener("manufacturer", "Admin", "autochannel");
