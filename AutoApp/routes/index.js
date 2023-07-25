var express = require('express');
var router = express.Router();
const {clientApplication} = require('./client');
const {Events} = require('./events')
let eventClient = new Events()
eventClient.contractEventListner("manufacturer", "Admin", "autochannel",
"KBA-Automobile", "CarContract", "addCarEvent")



/* GET home page. */
router.get('/', function(req, res, next) {
  let mvdClient = new clientApplication();
 
  mvdClient.generatedAndEvaluateTxn(
      "mvd",
      "Admin",
      "autochannel", 
      "KBA-Automobile",
      "CarContract",
      "queryAllCars"
  )
  .then(cars => {
    const dataBuffer = cars.toString();
    console.log("cars are ", cars.toString())
    const value = JSON.parse(dataBuffer)
    console.log("History DataBuffer is",value)
    res.render('index', { title: 'Automobile Consortium', itemList: value});
  }).catch(err => {
    res.render("error", {
      message: `Some error occured`,
      callingScreen: "error",
    })
  })
});
 
router.get('/manufacturer', function(req, res, next) {
  let manufacturerClient = new clientApplication();
  manufacturerClient.generatedAndEvaluateTxn(
    "manufacturer",
    "Admin",
    "autochannel",
    "KBA-Automobile",
    "CarContract",
    "queryAllCars"
  ).then(cars =>{
    const data =cars.toString();
    const value = JSON.parse(data)
    res.render('manufacturer', { title: 'Manufacturer Dashboard', itemList: value });
  }).catch(err => {
    res.render("error", {
      message: `Some error occured`,
      callingScreen: "error",
    })
  })

});
router.get('/dealer', function(req, res, next) {
  res.render('dealer', { title: 'Dealer Dashboard' });
});

router.get('/event', function(req, res, next) {
  console.log("Event Response %%%$$^^$%%$",eventClient.getEvents().toString())
  var event = eventClient.getEvents().toString()
  res.send({carEvent: event})
  // .then(array => {
  //   console.log("Value is #####", array)
  //   res.send(array);
  // }).catch(err => {
  //   console.log("errors are ", err)
  //   res.send(err)
  // })
  // res.render('index', { title: 'Dealer Dashboard' });
});


router.get('/mvd', function(req, res, next) {
  let mvdClient = new clientApplication();
  mvdClient.generatedAndEvaluateTxn(
    "mvd",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "CarContract",
    "queryAllCars"
  )
  .then(cars => {
    const dataBuffer = cars.toString();
    console.log("cars are ", cars.toString())
    const value = JSON.parse(dataBuffer)
    console.log("History DataBuffer is",value)
    res.render('mvd', { title: 'MVD Dashboard', itemList: value});
  }).catch(err => {
    res.render("error", {
      message: `Some error occured`,
      callingScreen: "error",
    })
})});



router.get('/addCarEvent', async function(req, res, next) {
  let mvdClient = new clientApplication();
  const result = await mvdClient.contractEventListner("manufacturer", "Admin", "autochannel", 
  "KBA-Automobile", "addCarEvent")
  console.log("The result is ####$$$$",result)
  res.render('manufacturer', {view: "carEvents", results: result })
})

router.post('/manuwrite',function(req,res){

  const vin = req.body.VinNumb;
  const make = req.body.CarMake;
  const model = req.body.CarModel;
  const color = req.body.CarColor;
  const DOM = req.body.DOM;
  const flag = req.body.CarFlag;

  // console.log("Request Object",req)
  let ManufacturerClient = new clientApplication();
  
  ManufacturerClient.generatedAndSubmitTxn(
      "manufacturer",
      "Admin",
      "autochannel", 
      "KBA-Automobile",
      "CarContract",
      "createCar",
      vin,make,model,color,DOM,flag
    ).then(message => {
        console.log("Message is $$$$",message)
        res.status(200).send({message: "Added Car"})
      }
    )
    .catch(error =>{
      console.log("Some error Occured $$$$###", error)
      res.status(500).send({error:`Failed to Add`,message:`${error}`})
    });
});

router.post('/manuread',async function(req,res){
  const Qvin = req.body.QVinNumb;
  let ManufacturerClient = new clientApplication();
  
  ManufacturerClient.generatedAndEvaluateTxn( 
    "manufacturer",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "CarContract",
    "readCar", Qvin)
    .then(message => {
      
      res.status(200).send({ Cardata : message.toString() });
    }).catch(error =>{
     
      res.status(500).send({error:`Failed to Add`,message:`${error}`})
    });

 })

 //  Get History of a car
 router.get('/itemhistory',async function(req,res){
  const carId = req.query.carId;
 
  let mvdClient = new clientApplication();
  
  mvdClient.generatedAndEvaluateTxn( 
    "manufacturer",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "CarContract",
    "getCarsHistory", carId).then(message => {
    const dataBuffer = message.toString();
    
    const value = JSON.parse(dataBuffer)
    res.render('history', { itemList: value , title: "Car History"})

  });

 })

 //Register a car

 router.post('/registerCar',async function(req,res){
  const Qvin = req.body.QVinNumb;
  const CarOwner = req.body.carOwner;
  const RegistrationNumber = req.body.regNumber
  let MVDClient = new clientApplication();
  
  MVDClient.generatedAndSubmitTxn( 
    "mvd",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "CarContract",
    "registerCar", Qvin,CarOwner,RegistrationNumber)
    .then(message => {
    
      res.status(200).send("Successfully created")
    }).catch(error =>{
     
      res.status(500).send({error:`Failed to create`,message:`${error}`})
    });

 })
// Create order
router.post('/createOrder',async function(req,res){
  const orderNumber = req.body.orderNumber;
  const carMake = req.body.carMake;
  const carModel = req.body.carModel;
  const carColour = req.body.carColour;
  const dealerName = req.body.dealerName
  let DealerClient = new clientApplication();

  const transientData = {
    make: Buffer.from(carMake),
    model: Buffer.from(carModel),
    color: Buffer.from(carColour),
    dealerName: Buffer.from(dealerName)
  }
  
  DealerClient.generatedAndSubmitPDC( 
    "dealer",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "OrderContract",
    "createOrder", orderNumber,transientData)
    .then(message => {
      
      res.status(200).send("Successfully created")
    }).catch(error =>{
     
      res.status(500).send({error:`Failed to create`,message:`${error}`})
    });

 })

 router.post('/readOrder',async function(req,res){
  const orderNumber = req.body.orderNumber;
  let DealerClient = new clientApplication();
  DealerClient.generatedAndEvaluateTxn( 
    "dealer",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "OrderContract",
    "readOrder", orderNumber).then(message => {
   
    res.send({orderData : message.toString()});
  }).catch(error => {
    alert('Error occured')
  })

 })

 //Get all orders
 router.get('/allOrders',async function(req,res){
  let DealerClient = new clientApplication();
  DealerClient.generatedAndEvaluateTxn( 
    "dealer",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "OrderContract",
    "queryAllOrders","").then(message => {
    const dataBuffer = message.toString();
    const value = JSON.parse(dataBuffer);
    res.render('orders', { itemList: value , title: "All Orders"})
    }).catch(error => {
    //alert('Error occured')
    console.log(error)
  })

 })
 //Find matching orders
 router.get('/matchOrder',async function(req,res){
  const carId = req.query.carId;
 
  let mvdClient = new clientApplication();
  
  mvdClient.generatedAndEvaluateTxn( 
    "manufacturer",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "CarContract",
    "checkMatchingOrders", carId).then(message => {
    console.log("Message response",message)
    var dataBuffer = message.toString();
    var data =[];
    data.push(dataBuffer,carId)
    console.log("checkMatchingOrders",data)
    const value = JSON.parse(dataBuffer)
    let array = [];
    if(value.length) {
        for (i = 0; i < value.length; i++) {
            array.push({
               "orderId": `${value[i].Key}`,"carId":`${carId}`,
                "Make": `${value[i].Record.make}`, "Model":`${value[i].Record.model}`, 
                "Color":`${value[i].Record.color}`, 
                "dealerName": `${value[i].Record.dealerName}`,"assetType": `${value[i].Record.assetType}`
            })
        }
    }
    console.log("Array value is ", array)
    console.log("Car id sent",carId)
    res.render('matchOrder', { itemList: array , title: "Matching Orders"})

  });

 })

 router.post('/match',async function(req,res){
  const orderId = req.body.orderId;
  const carId = req.body.carId
  let DealerClient = new clientApplication();
  DealerClient.generatedAndSubmitTxn( 
    "dealer",
    "Admin",
    "autochannel", 
    "KBA-Automobile",
    "CarContract",
    "matchOrder", carId,orderId).then(message => {
   
      res.status(200).send("Successfully Matched order")
    }).catch(error =>{
     
      res.status(500).send({error:`Failed to Match Order`,message:`${error}`})
    });

 })



module.exports = router;


