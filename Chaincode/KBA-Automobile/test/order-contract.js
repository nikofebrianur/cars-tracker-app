/* eslint-disable no-undef */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { OrderContract } = require('..');
const winston = require('winston');

const crypto = require('crypto');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {
    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon
                .stub()
                .returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }
}

describe('OrderContract', () => {
    let contract;
    let ctx;
    const mspid = 'dealer-auto-com';
    const collectionName = 'CollectionOrder';

    beforeEach(() => {
        contract = new OrderContract();
        ctx = new TestContext();
        ctx.clientIdentity.getMSPID.returns(mspid);
        ctx.stub.getPrivateData
            .withArgs(collectionName, '001')
            .resolves(
                Buffer.from(
                    '{"make":"Sedan","model":"X1","color":"Red","dealerName":"Dealer-1","assetType":"order"}'
                )
            );
        const hashToVerify = crypto
            .createHash('sha256')
            .update(
                '{"make":"Sedan","model":"X1","color":"Red","dealerName":"Dealer-1","assetType":"order"}'
            )
            .digest('hex');
        ctx.stub.getPrivateDataHash
            .withArgs(collectionName, '001')
            .resolves(Buffer.from(hashToVerify, 'hex'));
    });

    describe('#orderExists', () => {
        it('should return true for a private asset that exists', async () => {
            await contract.orderExists(ctx, '001').should.eventually.be.true;
        });

        it('should return false for a private asset that does not exist', async () => {
            await contract.orderExists(ctx, '002').should.eventually.be.false;
        });
    });

    describe('#createOrder', () => {
        it('should throw an error for a private asset that already exists', async () => {
            await contract
                .createOrder(ctx, '001')
                .should.be.rejectedWith('The asset order 001 already exists');
        });

        it('should throw an error if transient data is not provided when creating private asset', async () => {
            let transientMap = new Map();
            ctx.stub.getTransient.returns(transientMap);
            await contract
                .createOrder(ctx, '002')
                .should.be.rejectedWith(
                    'The privateValue key was not specified in transient data. Please try again.'
                );
        });

        it('should throw an error if transient data key is not privateValue', async () => {
            let transientMap = new Map();
            transientMap.set('prVal', Buffer.from('125'));
            ctx.stub.getTransient.returns(transientMap);
            await contract
                .createOrder(ctx, '002')
                .should.be.rejectedWith(
                    'The privateValue key was not specified in transient data. Please try again.'
                );
        });

        it('should create a private asset if transient data key is privateValue', async () => {
            let transientMap = new Map();
            transientMap.set('make', Buffer.from('Sedan'));
            transientMap.set('model', Buffer.from('X1'));
            transientMap.set('color', Buffer.from('Red'));
            transientMap.set('dealerName', Buffer.from('Dealer-1'));
            ctx.stub.getTransient.returns(transientMap);
            await contract.createOrder(ctx, '002');
            ctx.stub.putPrivateData.should.have.been.calledOnceWithExactly(
                collectionName,
                '002',
                Buffer.from(
                    '{"make":"Sedan","model":"X1","color":"Red","dealerName":"Dealer-1","assetType":"order"}'
                )
            );
        });
    });

    describe('#readOrder', () => {
        it('should throw an error for my private asset that does not exist', async () => {
            await contract
                .readOrder(ctx, '003')
                .should.be.rejectedWith('The asset order 003 does not exist');
        });

        it('should return my private asset', async () => {
            await contract
                .readOrder(ctx, '001')
                .should.eventually.deep.equal({
                    make: 'Sedan',
                    model: 'X1',
                    color: 'Red',
                    dealerName: 'Dealer-1',
                    assetType: 'order',
                });
            ctx.stub.getPrivateData.should.have.been.calledWithExactly(
                collectionName,
                '001'
            );
        });
    });

    describe('#deleteOrder', () => {
        it('should throw an error for my private asset that does not exist', async () => {
            await contract
                .deleteOrder(ctx, '003')
                .should.be.rejectedWith('The asset order 003 does not exist');
        });

        it('should delete my private asset', async () => {
            await contract.deleteOrder(ctx, '001');
            ctx.stub.deletePrivateData.should.have.been.calledOnceWithExactly(
                collectionName,
                '001'
            );
        });
    });
});
