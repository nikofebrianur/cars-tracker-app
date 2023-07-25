/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class CarAuctionContract extends Contract {

    async carOnAuctionExists(ctx, carAuctionId) {
        const buffer = await ctx.stub.getState(carAuctionId);
        return (!!buffer && buffer.length > 0);
    }

    async createCarForAuction(ctx, carAuctionId, make, model, dom, owner, regNo, chasisNo) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (exists) {
            throw new Error(`The car auction ${carAuctionId} already exists`);
        }
        const asset = { 
            make,
            model,
            dom,
            owner, 
            regNo,
            chasisNo
         };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(carAuctionId, buffer);
    }

    async readCarAuction(ctx, carAuctionId) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (!exists) {
            throw new Error(`The car auction ${carAuctionId} does not exist`);
        }
        const buffer = await ctx.stub.getState(carAuctionId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateCarOnAuction(ctx, carAuctionId, newMake, newModel, newDom, newOwner, newRegNo, newChasisNo) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (!exists) {
            throw new Error(`The car auction ${carAuctionId} does not exist`);
        }
        const asset = {  
            make: newMake, 
            model: newModel, 
            dom: newDom, 
            owner: newOwner, 
            regNo: newRegNo, 
            chasisNo: newChasisNo 
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(carAuctionId, buffer);
    }

    async deleteCarAuction(ctx, carAuctionId) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (!exists) {
            throw new Error(`The car auction ${carAuctionId} does not exist`);
        }
        await ctx.stub.deleteState(carAuctionId);
    }

    async openAuction(ctx, carAuctionId, faceValue) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (!exists) {
            throw new Error(`The car auction ${carAuctionId} does not exist`);
        }
        const asset = { 
            faceValue,
            status: 'in auction',
            state: 'open',
            bidCount: '0',
            bidMaxAmount: faceValue,
            maxBidder: ''


         };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(carAuctionId, buffer);
    }

    async makeABid(ctx, carAuctionId, bidAmount, maxBidder) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (!exists) {
            throw new Error(`The car auction ${carAuctionId} does not exist`);
        }
        
        const buffer = await ctx.stub.getState(carAuctionId);
        const asset = JSON.parse(buffer.toString());
        if(bidAmount > asset.bidMaxAmount && bidAmount > asset.faceValue && asset.state === 'open'){
            let bidCount = asset.bidCount + 1;
            asset.bidAmount = bidAmount;
            asset.maxBidder = maxBidder;
            asset.bidCount = bidCount
            const new_buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(carAuctionId, new_buffer);
        }
        
    }

    async closeAuction(ctx, carAuctionId) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (!exists) {
            throw new Error(`The car auction ${carAuctionId} does not exist`);
        }

        const buffer = await ctx.stub.getState(carAuctionId);
        const asset = JSON.parse(buffer.toString());
        if(asset.state === 'open'){
            asset.state = 'closed';
            asset.status = 'in review';
            const new_buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(carAuctionId, new_buffer);
        }
    }

    async announceWinner(ctx, carAuctionId) {
        const exists = await this.carOnAuctionExists(ctx, carAuctionId);
        if (!exists) {
            throw new Error(`The car auction ${carAuctionId} does not exist`);
        }

        const buffer = await ctx.stub.getState(carAuctionId);
        const asset = JSON.parse(buffer.toString());

        if(asset.bidCount > 0 && asset.state === 'closed'){
            asset.status = 'assigned to ' + asset.maxBidder;
            asset.owner = asset.maxBidder;
            const new_buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(carAuctionId, buffer);
    
        }
    }

}

module.exports = CarAuctionContract;
