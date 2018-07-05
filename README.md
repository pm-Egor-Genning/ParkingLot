# Parking Lot
## Smart contract for ‘n’ parking spaces, hourly payment option and cost ‘y’ by hour:
# Methods: 
```
enter - place vehicle into parkingPlace
leave - allows vehicle to leave parking space transfer money depending on value (currentTimestamp-parkedSince)
getEmptyParkingSpaces - returns list of empty parking spaces ids
whereAmI - return parkingSpace for msg.sender
getParkingCost - determines cost of parking space by msg.sender depending on value (currentTimestamp-parkedSince)
```
## Tests:
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

## to run network localy:
  `geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="your-account-id"`

## Put your account in main.js and run `npm start`:

```
parkingSpaces: [ '0', '1', '2', '4', '5', '6', '7', '8', '9' ] 
whereAmI: -1
getParkingCost: 0
```

## to test `npm test`
