const { profile } = require('./profile')
const { Wallets, Gateway } = require('fabric-network')
const path = require('path')
const fs = require('fs')

class EventListener {
    async blockEventListener(role, identityLabel, channelName) {
        let gateway = new Gateway();
        try {
            let userProfile = profile[role.toLowerCase()];
            const cpPath = path.resolve(userProfile["CP"]);
            const cp = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
            let wallet = await Wallets.newFileSystemWallet(userProfile["Wallet"]);

            await gateway.connect(cp, {
                wallet, identity: identityLabel,
                discovery: { enabled: true, asLocalhost: true }
            });

            let network = await gateway.getNetwork(channelName);

            await network.addBlockListener(async (event) => {
                console.log('Block details: ', event);
                console.log('Block number: ', event.blockNumber.toString());
            });

        } catch (error) {
            console.log(`Error: ${error}`);
            console.log(error.stack);
        }
    }
    async contractEventListener(role, identityLabel, channelName,
        chaincodeName, contractName, eventName) {
        let gateway = new Gateway();
        try {
            let userProfile = profile[role.toLowerCase()];
            const cpPath = path.resolve(userProfile["CP"]);
            const cp = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
            let wallet = await Wallets.newFileSystemWallet(userProfile["Wallet"]);

            await gateway.connect(cp, {
                wallet, identity: identityLabel,
                discovery: { enabled: true, asLocalhost: true }
            });

            let network = await gateway.getNetwork(channelName);
            let contract = await network.getContract(chaincodeName, contractName);
            await contract.addContractListener(async (event) => {
                if (event.eventName === eventName) {
                    console.log(`Event: ${event.payload.toString()}`);
                }
            })
        } catch (error) {
            console.log(`Error: ${error}`);
            console.log(error.stack);
        }
    }

    async txnEventListener(role, identityLabel, channelName,
        chaincodeName, contractName, transactionName, ...args) {
        let gateway = new Gateway();
        try {
            let userProfile = profile[role.toLowerCase()];
            const cpPath = path.resolve(userProfile["CP"]);
            const cp = JSON.parse(fs.readFileSync(cpPath, 'utf8'));
            let wallet = await Wallets.newFileSystemWallet(userProfile["Wallet"]);

            await gateway.connect(cp, {
                wallet, identity: identityLabel,
                discovery: { enabled: true, asLocalhost: true }
            });

            let network = await gateway.getNetwork(channelName);
            let contract = await network.getContract(chaincodeName, contractName);
            let transaction = contract.createTransaction(transactionName);
            let peers = network.channel.getEndorsers();
            let transactionId = transaction.getTransactionId();

            await network.addCommitListener((error, event) => {
                if (error) {
                    console.log("Error: ", error);
                } else {
                    console.log("TransactionId: ", event.transactionId);
                    console.log("Transaction Status: ", event.status)
                }
            }, peers, transactionId);

            await transaction.submit(...args);

        } catch (error) {
            console.log(`Error: ${error}`);
            console.log(error.stack);
        } finally {
            console.log('Disconnect from Fabric gateway.');
            gateway.disconnect();
        }

    }


}

module.exports = {
    EventListener
}
