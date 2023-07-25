/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { CarAuctionContract } = require('..');
const winston = require('winston');

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
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('CarAuctionContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new CarAuctionContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"car auction 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"car auction 1002 value"}'));
    });

    describe('#carAuctionExists', () => {

        it('should return true for a car auction', async () => {
            await contract.carAuctionExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a car auction that does not exist', async () => {
            await contract.carAuctionExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createCarAuction', () => {

        it('should create a car auction', async () => {
            await contract.createCarAuction(ctx, '1003', 'car auction 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"car auction 1003 value"}'));
        });

        it('should throw an error for a car auction that already exists', async () => {
            await contract.createCarAuction(ctx, '1001', 'myvalue').should.be.rejectedWith(/The car auction 1001 already exists/);
        });

    });

    describe('#readCarAuction', () => {

        it('should return a car auction', async () => {
            await contract.readCarAuction(ctx, '1001').should.eventually.deep.equal({ value: 'car auction 1001 value' });
        });

        it('should throw an error for a car auction that does not exist', async () => {
            await contract.readCarAuction(ctx, '1003').should.be.rejectedWith(/The car auction 1003 does not exist/);
        });

    });

    describe('#updateCarAuction', () => {

        it('should update a car auction', async () => {
            await contract.updateCarAuction(ctx, '1001', 'car auction 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"car auction 1001 new value"}'));
        });

        it('should throw an error for a car auction that does not exist', async () => {
            await contract.updateCarAuction(ctx, '1003', 'car auction 1003 new value').should.be.rejectedWith(/The car auction 1003 does not exist/);
        });

    });

    describe('#deleteCarAuction', () => {

        it('should delete a car auction', async () => {
            await contract.deleteCarAuction(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a car auction that does not exist', async () => {
            await contract.deleteCarAuction(ctx, '1003').should.be.rejectedWith(/The car auction 1003 does not exist/);
        });

    });

});