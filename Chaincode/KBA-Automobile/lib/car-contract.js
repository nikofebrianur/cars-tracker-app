/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const OrderContract = require('./order-contract');

class CarContract extends Contract {
    async carExists(ctx, carId) {
        const buffer = await ctx.stub.getState(carId);
        return !!buffer && buffer.length > 0;
    }

    async createCar(
        ctx,
        carId,
        make,
        model,
        color,
        dateOfManufacture,
        manufactureName
    ) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'manufacturer-auto-com') {
            const exists = await this.carExists(ctx, carId);
            if (exists) {
                throw new Error(`The car ${carId} already exists`);
            }
            const carAsset = {
                make,
                model,
                color,
                dateOfManufacture,
                status: 'In Factory',
                ownedBy: manufactureName,
                assetType: 'car',
            };
            const buffer = Buffer.from(JSON.stringify(carAsset));
            await ctx.stub.putState(carId, buffer);

            let addCarEventData = { Type: 'Car creation', Model: model };
            await ctx.stub.setEvent('addCarEvent', Buffer.from(JSON.stringify(addCarEventData)));

        } else {
            return `User under following MSP:${mspID} cannot able to perform this action`;
        }
    }

    async readCar(ctx, carId) {
        const exists = await this.carExists(ctx, carId);
        if (!exists) {
            throw new Error(`The car ${carId} does not exist`);
        }
        const buffer = await ctx.stub.getState(carId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async deleteCar(ctx, carId) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'manufacturer-auto-com') {
            const exists = await this.carExists(ctx, carId);
            if (!exists) {
                throw new Error(`The car ${carId} does not exist`);
            }
            await ctx.stub.deleteState(carId);
        } else {
            return `User under following MSP:${mspID} cannot able to perform this action`;
        }
    }

    async checkMatchingOrders(ctx, carId) {
        const exists = await this.carExists(ctx, carId);
        if (!exists) {
            throw new Error(`The car ${carId} does not exist`);
        }

        const carBuffer = await ctx.stub.getState(carId);
        const carDetails = JSON.parse(carBuffer.toString());

        const queryString = {
            selector: {
                assetType: 'order',
                make: carDetails.make,
                model: carDetails.model,
                color: carDetails.color,
            },
        };

        const orderContract = new OrderContract();
        const orders = await orderContract.queryAllOrders(
            ctx,
            JSON.stringify(queryString)
        );

        return orders;
    }

    async matchOrder(ctx, carId, orderId) {
        const orderContract = new OrderContract();

        const carDetails = await this.readCar(ctx, carId);
        const orderDetails = await orderContract.readOrder(ctx, orderId);

        if (
            orderDetails.make === carDetails.make &&
      orderDetails.model === carDetails.model &&
      orderDetails.color === carDetails.color
        ) {
            carDetails.ownedBy = orderDetails.dealerName;
            carDetails.status = 'Assigned to a Dealer';

            const newCarBuffer = Buffer.from(JSON.stringify(carDetails));
            await ctx.stub.putState(carId, newCarBuffer);

            await orderContract.deleteOrder(ctx, orderId);
            return `Car ${carId} is assigned to ${orderDetails.dealerName}`;
        } else {
            return 'Order is not matching';
        }
    }

    async registerCar(ctx, carId, ownerName, registrationNumber) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'mvd-auto-com') {
            const exists = await this.carExists(ctx, carId);
            if (!exists) {
                throw new Error(`The car ${carId} does not exist`);
            }

            const carBuffer = await ctx.stub.getState(carId);
            const carDetails = JSON.parse(carBuffer.toString());

            carDetails.status = `Registered to ${ownerName} wih plate number ${registrationNumber}`;
            carDetails.ownedBy = ownerName;

            const newCarBuffer = Buffer.from(JSON.stringify(carDetails));
            await ctx.stub.putState(carId, newCarBuffer);

            return `Car ${carId} is successfully registered to ${ownerName}`;
        } else {
            return `User under following MSP:${mspID} cannot able to perform this action`;
        }
    }

    async queryAllCars(ctx) {
        const queryString = {
            selector: {
                assetType: 'car',
            },
            sort: [{ dateOfManufacture: 'asc' }],
        };
        let resultIterator = await ctx.stub.getQueryResult(
            JSON.stringify(queryString)
        );
        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }

    async getCarsByRange(ctx, startKey, endKey) {
        let resultIterator = await ctx.stub.getStateByRange(startKey, endKey);
        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }

    async getCarsWithPagination(ctx, _pageSize, _bookmark) {
        const queryString = {
            selector: {
                assetType: 'car',
            },
        };

        const pageSize = parseInt(_pageSize, 10);
        const bookmark = _bookmark;

        const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(
            JSON.stringify(queryString),
            pageSize,
            bookmark
        );

        const result = await this.getAllResults(iterator, false);

        const results = {};
        results.Result = result;
        results.ResponseMetaData = {
            RecordCount: metadata.fetched_records_count,
            Bookmark: metadata.bookmark,
        };
        return JSON.stringify(results);
    }

    async getCarsHistory(ctx, carId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(carId);
        let results = await this.getAllResults(resultsIterator, true);
        return JSON.stringify(results);
    }

    async getAllResults(iterator, isHistory) {
        let allResult = [];

        for (
            let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.timestamp = res.value.timestamp;
                    jsonRes.Value = JSON.parse(res.value.value.toString());
                } else {
                    jsonRes.Key = res.value.key;
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                }
                allResult.push(jsonRes);
            }
        }
        await iterator.close();
        return allResult;
    }
}

module.exports = CarContract;
