const {profile} = require('./profile')
const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');
// sets the location of the wallet
// loads the connectionProfile.a yaml file

// creates an object of the gateway class

 
class clientApplication{

   // To submit a transaction
    async generatedAndSubmitTxn(role,IdentityLabel,channelName,chaincodeName,contractName,txnName,...args){
        let gateway = new Gateway()
        try {
        
        this.Profile = profile[role.toLowerCase()]
        const ccpPath = path.resolve(this.Profile["CP"]);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        let wallet = await Wallets.newFileSystemWallet(this.Profile["Wallet"])
        await gateway.connect(ccp, { wallet, identity: IdentityLabel, discovery: { enabled: true, asLocalhost: true } });
       
         //set channel name
         this.channel = channelName
         //set chaincode name
         this.chaincodeName = chaincodeName
         //set contract name
         this.contractName = contractName
        //connects to the network
        let channel = await gateway.getNetwork(this.channel);
        //gets the contract based on the name 
        let contract = await channel.getContract(this.chaincodeName,this.contractName)
        //submits the transactions and returns the result
        let result = await contract.submitTransaction(txnName,...args);
        
        return Promise.resolve(result)
        } catch (error) {
            console.log("Got inside catch", error);
            return Promise.reject(error);
        } finally {
            // Disconnect from the gateway
            console.log('Disconnect from Fabric gateway.');
            gateway.disconnect();
    
        }
    }
// To read data from network

    async generatedAndEvaluateTxn(role,IdentityLabel,channelName,chaincodeName,contractName,txnName,...args){
        let gateway = new Gateway()
        try {
        
        this.Profile = profile[role.toLowerCase()]
        const ccpPath = path.resolve(this.Profile["CP"]);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        let wallet = await Wallets.newFileSystemWallet(this.Profile["Wallet"])
        await gateway.connect(ccp, { wallet, identity: IdentityLabel, discovery: { enabled: true, asLocalhost: true } });
    
        //set channel name
        this.channel = channelName
        //set chaincode name
        this.chaincodeName = chaincodeName
        //set contract name
        this.contractName = contractName
        //connects to the network
        let channel = await gateway.getNetwork(this.channel);
        //gets the contract based on the name 
        let contract = await channel.getContract(this.chaincodeName,this.contractName)
        //submits the transactions and returns the result
        let result = await contract.evaluateTransaction(txnName,...args);
        
        return Promise.resolve(result)
        } catch (error) {
            console.log("Got inside catch", error);
            return Promise.reject(error);
        } finally {
            // Disconnect from the gateway
            console.log('Disconnect from Fabric gateway.');
            gateway.disconnect();

        }
    }

//To submit private data

    async generatedAndSubmitPDC(role,IdentityLabel,channelName,chaincodeName,contractName,txnName,orderNumber,transientData){
        let gateway = new Gateway()
        try{
        
        this.Profile = profile[role.toLowerCase()]
        const ccpPath = path.resolve(this.Profile["CP"]);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        let wallet = await Wallets.newFileSystemWallet(this.Profile["Wallet"])
        await gateway.connect(ccp, { wallet, identity: IdentityLabel, discovery: { enabled: true, asLocalhost: true } });
        //set channel name
        this.channel = channelName
        //set chaincode name
        this.chaincodeName = chaincodeName
        //set contract name
        this.contractName = contractName
       //connects to the network
        let channel = await gateway.getNetwork(this.channel);
        //gets the contract based on the name 
        let contract = await channel.getContract(this.chaincodeName,this.contractName)
        //submits the transactions and returns the result
        let result = await contract.createTransaction(txnName)
                     .setTransient(transientData)
                     .submit(orderNumber);
      

        return Promise.resolve(result)
        } catch (error) {
            console.log(`Error processing transaction. ${error}`);
            console.log(error.stack);
            return Promise.reject(error);
        } finally {
    
            // Disconnect from the gateway
            console.log('Disconnect from Fabric gateway.');
            gateway.disconnect();
    
        }
    }

}

module.exports = {
    clientApplication
}