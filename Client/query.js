const {clientApplication} = require('./client')

let ManufacturerClient = new clientApplication()

ManufacturerClient.generateAndEvaluateTxn(
    "manufacturer",
    "Admin",
    "autochannel",
    "KBA-Automobile",
    "CarContract",
    "readCar",
    "CAR01"
).then(message => {
    console.log(message.toString())
})