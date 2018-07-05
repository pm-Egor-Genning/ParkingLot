const ParkingLot = artifacts.require('ParkingLot')

module.exports = function(deployer) {
    deployer.deploy(ParkingLot, 10, 1);
};
