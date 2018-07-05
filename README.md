# Parking Lot
Here introduced simple contact that represents parking space with specified amount of slots and price per hour.

In the constructor, contract accepts two numeric parameters: a number of slots and price per hour.
# Methods
Contract `ParkingLot.sol` has following methods:
* `getEmptyParkingSpaces` - returns list of IDs of vacant parking slots;
* `whereAmI` - returns ID of parking slot occupied by the sender
or -1 if the sender didn't occupy any slot on this parking;
* `enter` - accepts ID of parking slot and marks this slot as occupied by the sender;
* `getParkingCost` - returns value that needs to be sent to `leave` method in order to successfully free
occupied parking slot. This value represents parking cost and calculated by amount of hours lasts from
last successful `enter` multiplied by the cost per hour;
* `leave` - frees parking slot occupied by the sender. This method requires
sufficient amount of money to be transferred within this transaction.
If transferred amount of money exceeds the required amount, the difference will be transferred back to the sender.

File `main.js` contains some interactions with contract deployed to network. It uses `web3.js` library.

## Tests:
File `test/parking-lot.js` contains some unit tests for `ParkingLot` contract.
```
WhereAmI if I am not on parking space
WhereAmI the same as entered
Can get list of empty parking spaces
No empty parking spaces available
Verify parking space is locked after entering
Receives exception on enter parking space out of bounds
Receives exception on enter same parking space twice
Receives exception on enter same account twice
Verify parking space is unlocked after left
Verify contract balance is increased after leaving by hours cost value
Verify account balance is decreased after leaving by hours cost value
Receives exception on leaving same account twice
Receives exception on leaving for not enough amount value
Receives exception on leaving not entering
Should return 0 cost when not entered
Should return hours cost when entered more hour
```
# How to:

## to run rinkeby network locally:
  `geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="your-account-id"`

## Put your account in main.js and run `npm start`:

```
parkingSpaces: [ '0', '1', '2', '4', '5', '6', '7', '8', '9' ] 
whereAmI: -1
getParkingCost: 0
```

## to run network for tests
   `testrpc -p8544`

## to test `npm test`
