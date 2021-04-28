# crypto-trade-system

An auto-system to trade cryptocurrency profitably

## Structure and Workflow

The system comprises of two services: `aggregator-service` and `decider-service`  

aggregator-service gets ticker data from an exchange every X minutes and saves it to a database.   

decider-service analyses the ticker data saved in the database and executes the buy or sell transactions accordingly.

### Buy Algo
  Ticker data added every 10 mintutes into the database.

  Steps

1. sort last inserted ticker data according to traded volume
2. take top 40
3. remove assets that are already bought
4. calculate percentage change in WMA in 2hrs vs 16hrs (weights are calculated with formila 1/(n+x) )
5. filter assets which have WMA % change > 2
6. get top 5 assets with highest WMA change

### Sell Algo
WMA change < -3