const ParkingLot = artifacts.require('ParkingLot');
const BigNumber = require('bignumber.js');

const gasPrice = 1;
const id = 0;
const jsonrpc = '2.0';
const send = (method, params = []) =>
    web3.currentProvider.send({id, jsonrpc, method, params});
const timeTravel = async seconds => {
    await send('evm_increaseTime', [seconds]);
    await send('evm_mine')
};

const COST_PER_HOUR = 1;

contract('ParkingLot', function (accounts) {
    let contract;
    beforeEach(async function() {
        contract = await ParkingLot.new(3, COST_PER_HOUR, {from: accounts[0]});
    });
    it ('WhereAmI if I am not on parking space', async function () {
        const whereAmI = await contract.whereAmI();
        assert.equal(whereAmI, -1, 'whereAmI differs');
    });
    it ('WhereAmI the same as entered', async function () {
        await contract.enter(2, {from: accounts[1]});
        const whereAmI = await contract.whereAmI({from: accounts[1]});
        assert.equal(whereAmI, 2, 'whereAmI differs');
    });
    it('Can get list of empty parking spaces', async function () {
        const spaces = await contract.getEmptyParkingSpaces();
        const actualResult = spaces.map(v => v.toNumber());
        assert.deepEqual(actualResult, [0, 1, 2], 'list of empty parking spaces differs');
    });
    it('No empty parking spaces available', async function () {
        await contract.enter(0, {from: accounts[1]});
        await contract.enter(1, {from: accounts[2]});
        await contract.enter(2, {from: accounts[3]});
        const spaces = await contract.getEmptyParkingSpaces();
        const actualResult = spaces.map(v => v.toNumber());
        assert.deepEqual(actualResult, [], 'list of empty parking spaces differs');
    });
    it('Verify parking space is locked after entering', async function () {
        await contract.enter(1, {from: accounts[1]});
        const spaces = await contract.getEmptyParkingSpaces();
        const actualResult = spaces.map(v => v.toNumber());
        assert.deepEqual(actualResult, [0, 2], 'list of empty parking spaces differs');
    });
    it('Receives exception on enter parking space out of bounds', async function () {
        try {
            await contract.enter(4, {from: accounts[1]});
            assert.isOk(false, 'this should fail with error');
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert');
        }
    });
    it('Receives exception on enter same parking space twice', async function () {
        await contract.enter(1, {from: accounts[1]});
        try {
            await contract.enter(1, {from: accounts[1]});
            assert.isOk(false, 'this should fail with error');
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert');
        }
    });
    it('Receives exception on enter same account twice', async function () {
        await contract.enter(1, {from: accounts[1]});
        try {
            await contract.enter(0, {from: accounts[1]});
            assert.isOk(false, 'this should fail with error');
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert');
        }
    });
    it('Verify parking space is unlocked after left', async function () {
        await contract.enter(0, {from: accounts[2]});
        await timeTravel(10 * 60);
        const tx = await contract.leave({value: 2 * COST_PER_HOUR, from: accounts[2]});
        const spaces = await contract.getEmptyParkingSpaces();
        const actualResult = spaces.map(v => v.toNumber());
        const whereAmI = await contract.whereAmI();
        assert.equal(whereAmI, -1, 'whereAmI differs');
        assert.deepEqual(actualResult, [0, 1, 2], 'list of empty parking spaces differs');
    });
    it('Verify contract balance is increased after leaving', async function () {
        const oldBalance = web3.eth.getBalance(contract.contract.address);
        await contract.enter(0, {from: accounts[2]});
        await timeTravel(60 * 60);
        const tx = await contract.leave({value: 2 * COST_PER_HOUR, from: accounts[2]});
        const newBalance = web3.eth.getBalance(contract.contract.address);
        assert.equal(
            newBalance.minus(oldBalance).toNumber(),
            2 * COST_PER_HOUR,
            'balance of accounts[0] must increase to 2'
        );

    });
    it('Verify account balance is decreased after leaving', async function () {
        await contract.enter(0, {from: accounts[2]});
        let oldBalance = web3.eth.getBalance(accounts[2]);
        await timeTravel(60 * 60);
        const tx = await contract.leave({value: 5 * COST_PER_HOUR, from: accounts[2]});
        const usedGasCost = new BigNumber(tx.receipt.cumulativeGasUsed * gasPrice);
        let newBalance = web3.eth.getBalance(accounts[2]);
        assert.equal(
            oldBalance.minus(newBalance).minus(usedGasCost).toNumber(),
            2 * COST_PER_HOUR,
            'balance of accounts[0] must decrease to 2'
        );
    });
    it('Receives exception on leaving same account twice', async function () {
        await contract.enter(1, {from: accounts[1]});
        await timeTravel(10 * 60);
        await contract.leave({value: 5, from: accounts[1]});
        try {
            await contract.leave({value: 5, from: accounts[1]});
            assert.isOk(false, 'this should fail with error');
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert');
        }
    });
    it('Receives exception on leaving for not enough amount', async function () {
        await contract.enter(1, {from: accounts[1]});
        await timeTravel(60 * 60);
        try {
            await contract.leave({value: 1, from: accounts[1]});
            assert.isOk(false, 'this should fail with error');
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert');
        }
    });
    it('Receives exception on leaving not entering', async function () {
        try {
            await contract.leave({value: 5, from: accounts[1]});
            assert.isOk(false, 'this should fail with error');
        } catch (e) {
            assert.equal(e.message, 'VM Exception while processing transaction: revert');
        }
    });
    it('Should return 0 cost when not entered', async function () {
        const cost = await contract.getParkingCost({from: accounts[1]});
        assert.equal(cost.toNumber(), 0, 'cost is incorrect');
    });
    it('Should return 2 hours cost when entered more hour', async function () {
        await contract.enter(0, {from: accounts[1]});
        await timeTravel(60 * 60);
        const cost = await contract.getParkingCost({from: accounts[1]});
        assert.equal(cost.toNumber(), 2 * COST_PER_HOUR, 'cost is incorrect');
    });
});

