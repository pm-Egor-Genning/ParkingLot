const Web3 = require('web3');

const accounts = {
    id: `0x1a7e8e6e59899cfbcb7f09c408e5cbf9886bac0c`,
};

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const parkingLotAbi = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "parkingSpaces",
        "outputs": [
            {
                "name": "vehicle",
                "type": "address"
            },
            {
                "name": "state",
                "type": "uint8"
            },
            {
                "name": "parkedSince",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "parkingSpaceIdByVehicle",
        "outputs": [
            {
                "name": "exists",
                "type": "bool"
            },
            {
                "name": "parkedSpaceId",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_numOfParkingSpaces",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "vehicle",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "time",
                "type": "uint256"
            }
        ],
        "name": "VehicleEnteredParkingSpace",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "vehicle",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "time",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "VehicleLeavedParkingSpace",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "ChangeTransfered",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "parkingSpaceId",
                "type": "uint256"
            }
        ],
        "name": "enter",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "leave",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getEmptyParkingSpaces",
        "outputs": [
            {
                "name": "_result",
                "type": "uint256[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "whereAmI",
        "outputs": [
            {
                "name": "",
                "type": "int256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getParkingCost",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
const parkingLotContractAddress = '0x5500e6e2d3d659d3d11f3d43083a9c858173fed2';
const parkingLotContract = new web3.eth.Contract(parkingLotAbi, parkingLotContractAddress, {gas: 999999});

async function main() {
    try {
        const parkingSpaces = await callContractMethod(parkingLotContract, 'getEmptyParkingSpaces', {from: accounts.id});
        console.log("parkingSpaces:", parkingSpaces);
    } catch (e) {
        console.log("ERROR while getEmptyParkingSpaces", e);
    }

    try {
        const whereAmI = await callContractMethod(parkingLotContract, 'whereAmI', {from: accounts.id});
        console.log("whereAmI:", whereAmI);
    } catch (e) {
        console.log("ERROR while getting whereAmI", e);
    }

    try {
        const getParkingCost = await callContractMethod(parkingLotContract, 'getParkingCost', {from: accounts.id});
        console.log("getParkingCost:", getParkingCost);
    } catch (e) {
        console.log("ERROR while getting getParkingCost", e);
    }

    try {
        const enter = await parkingLotContract.methods.enter(3).send({from: accounts.id});
        console.log(enter);
        console.log('account 2 enters parking slot #1');
    } catch (e) {
        console.log("ERROR while getting enter", e);
    }

    try {
        const parkingSpaces = await callContractMethod(parkingLotContract, 'getEmptyParkingSpaces', {from: accounts.id});
        console.log("parkingSpaces:", parkingSpaces);
    } catch (e) {
        console.log("ERROR while getEmptyParkingSpaces", e);
    }

    try {
        await parkingLotContract.methods.leave().send({from: accounts.id});
        console.log('account 1 leaves parking');
    } catch (e) {
        console.log("ERROR", e);
    }
}

main()
    .then(() => {
        console.log("DONE");
    })
    .catch((err) => {
        console.log("ERROR", err);
    });

function callContractMethod(contract, method, params, args) {
    return new Promise((resolve, reject) => {
        if (args) {
            contract.methods[method](args).call(params, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        } else {
            contract.methods[method]().call(params, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        }
    })
}
