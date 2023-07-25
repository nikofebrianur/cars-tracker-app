const {profile} = require('./profile')
const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class Events {

    //Block events
    async blockEventListner(role, IdentityLabel, channelName, contractName) {
        let gateway = new Gateway()
        try {

            this.Profile = profile[role.toLowerCase()]
            const cpPath = path.resolve(this.Profile["CP"]);
            console.log("cp===", cpPath)
            const cp = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
            let wallet = await Wallets.newFileSystemWallet(this.Profile["Wallet"]);
            await gateway.connect(cp, { wallet, identity: IdentityLabel, discovery: { enabled: true, asLocalhost: true } });

            let network = await gateway.getNetwork(this.channel);

            await network.addBlockListener(async (event) => {
                // Handle block event
                console.log("block is ==== ", event);
                console.log("Block number====", event.blockNumber.toString());
            }
            );

        } catch (error) {

            console.log(`Error processing transaction. ${error}`);
            console.log(error.stack);

        }

    }
    

    // Contract events
    async contractEventListner(role, IdentityLabel,channelName, contractName, eventName) {
        console.log("Entered contractEventListner")
        let gateway = new Gateway()
            this.events = [];
            this.Profile = profile[role.toLowerCase()]
            const cpPath = path.resolve(this.Profile["CP"]);
            const cp = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
            let wallet = await Wallets.newFileSystemWallet(this.Profile["Wallet"]);
            await gateway.connect(cp, { wallet, identity: IdentityLabel, discovery: { enabled: true, asLocalhost: true } });
            //set channel name
            this.channel = channelName
            //set contract name
            this.contractName = contractName            
            let network = await gateway.getNetwork(this.channel);
            let contract = await network.getContract(this.contractName);
            await contract.addContractListener(async (event) => {
                this.events.push(event.payload)
                console.log(`Array #######: ${this.events}`);
                // console.log(`Event #######: ${event.payload.toString()}`);
                // let promise = new Promise(function(resolve, reject) {
                //     resolve(this.events)
                //   });
                // return promise
                // if (event.eventName === eventName) {
                //     console.log(`Event #######: ${event.payload.toString()}`);
                //     return event;
                // }

            })
    }  
    
    getEvents() {
        return this.events
    }

    //Transaction events
    async txnListner(role, IdentityLabel, channelName, contractName, transactionName, ...args) {
        let gateway = new Gateway()
        try {
            this.events = [];
            this.Profile = profile[role.toLowerCase()]
            const cpPath = path.resolve(this.Profile["CP"]);
            const cp = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
            let wallet = await Wallets.newFileSystemWallet(this.Profile["Wallet"]);
            await gateway.connect(cp, { wallet, identity: IdentityLabel, discovery: { enabled: true, asLocalhost: true } });
            //set channel name
            this.channel = channelName
            //set contract name
            this.contractName = contractName
            //connects to the network
            let network = await gateway.getNetwork(this.channel);
            let contract = await network.getContract(this.contractName);
            let transaction = contract.createTransaction(transactionName);

            let CommitListener = (error, event) => {
                if (error) {
                    console.log("commitEventError----", error);
                } else {
                    // Handle transaction commit event
                    console.log("commitEventTxnId----", event.transactionId);
                    // console.log("commitEvent----", event)
                }
            }
            const peers = network.channel.getEndorsers();
            await network.addCommitListener(CommitListener, peers, transaction.getTransactionId())

            const result = await transaction.submit(...args)
            return Promise.resolve(result);
        } catch (error) {
            console.log(`Error processing transaction. ${error}`);
            console.log(error.stack);
            return Promise.reject(error)

        } finally {
            // Disconnect from the gateway
            console.log('Disconnect from Fabric gateway.');

            gateway.disconnect();
        }

    }    
}

module.exports ={
    Events
}
