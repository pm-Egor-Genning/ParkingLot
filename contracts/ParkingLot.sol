pragma solidity ^0.4.2;

contract ParkingLot {
    // Events that will be fired on changes.
    event VehicleEnteredParkingSpace(address vehicle, uint time);
    event VehicleLeavedParkingSpace(address vehicle, uint time, uint amount);
    event ChangeTransferred(uint amount);

    mapping(address => ParkingSpacePair) public parkingSpaceIdByVehicle;
    ParkingSpace[] public parkingSpaces;

    enum State {Unlocked, Locked} // Enum

    struct ParkingSpacePair {
        bool exists;
        uint parkedSpaceId;
    }

    struct ParkingSpace {
        address vehicle;
        State state;
        uint parkedSince;
    }

    uint public costPerHour;

    constructor(uint _numOfParkingSpaces, uint _costPerHour) public {
        costPerHour = _costPerHour;
        parkingSpaces.length = _numOfParkingSpaces;
        for (uint8 parkingSpaceId = 0; parkingSpaceId < parkingSpaces.length; parkingSpaceId++) {
            parkingSpaces[parkingSpaceId] = ParkingSpace({vehicle : address(0), parkedSince : now, state : State.Unlocked});
        }
    }

    /* modifier that checks only currently parked vehicles*/
    modifier onlyParkedVehicles {
        uint parkingSpaceId = uint(whereAmI());
        // @TODO very questionable to duplicate conditions from validParkingSpaceId modifier
        require(parkingSpaceId >= 0 && parkingSpaceId < parkingSpaces.length, 'Parking space out of bounds');
        _;
    }

    modifier validParkingSpaceId(uint parkingSpaceId) {
        require(parkingSpaceId >= 0 && parkingSpaceId < parkingSpaces.length, 'Parking space out of bounds');
        _;
    }

    modifier vehicleIsNotParked() {
        require(parkingSpaceIdByVehicle[msg.sender].exists == false, 'You have already parked');
        _;
    }

    // place vehicle into parkingPlace
    function enter(uint parkingSpaceId) public vehicleIsNotParked validParkingSpaceId(parkingSpaceId) {
        require(parkingSpaces[parkingSpaceId].state == State.Unlocked, "Parking Space is Locked");
        parkingSpaceIdByVehicle[msg.sender].exists = true;
        parkingSpaceIdByVehicle[msg.sender].parkedSpaceId = parkingSpaceId;
        parkingSpaces[parkingSpaceId] = ParkingSpace({vehicle : msg.sender, parkedSince : now, state : State.Locked});
        emit VehicleEnteredParkingSpace(msg.sender, now);
    }

    // allows vehicle to leave parking space transfer money depending on value (currentTimestamp-parkedSince)
    function leave() public payable onlyParkedVehicles {
        uint amount = getParkingCost();
        int diff = int(msg.value - amount);
        require(diff>=0,'You do not have enough money');
        if (diff >= 0) {
            parkingSpaces[uint(whereAmI())] = ParkingSpace({vehicle : address(0), parkedSince : now, state : State.Unlocked});
            delete parkingSpaceIdByVehicle[msg.sender];
            emit VehicleLeavedParkingSpace(msg.sender, now, amount);
        }
        if (diff > 0) {
            msg.sender.transfer(uint(diff));
            emit ChangeTransferred(uint(diff));
        }
    }

    // returns list of empty parking spaces ids
    function getEmptyParkingSpaces() public view returns (uint[] memory _result) {
        uint[] memory _parkingSpaces = new uint[](parkingSpaces.length);
        uint id = uint(-1);
        uint parkingSpaceId = 0;
        for (parkingSpaceId = 0; parkingSpaceId < parkingSpaces.length; parkingSpaceId++) {
            if (parkingSpaces[parkingSpaceId].state == State.Unlocked) {
                id++;
                _parkingSpaces[id] = parkingSpaceId;
            }
        }
        _result = new uint[](id + 1);
        for (parkingSpaceId = 0; parkingSpaceId < id + 1; parkingSpaceId++) {
            _result[parkingSpaceId] = _parkingSpaces[parkingSpaceId];
        }
    }

    // return parkingSpace for msg.sender
    function whereAmI() public view returns (int) {
        if (parkingSpaceIdByVehicle[msg.sender].exists) {
            return int(parkingSpaceIdByVehicle[msg.sender].parkedSpaceId);
        }
        return int(-1);
    }

    // determines amount of seconds of parking space by msg.sender
    function getParkingCost() public view returns (uint256) {
        uint parkingSpaceId = uint(whereAmI());
        if (parkingSpaceId != uint(-1)) {
            return ((now - parkingSpaces[uint(parkingSpaceId)].parkedSince) / (60 * 60) + 1) * costPerHour;
        }
        return uint256(0);
    }
}
