/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
// var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    networks: {
        development: {
            host: "localhost",
            port: 8544,
            network_id: "*", // Match any network id
            gasPrice: 1,
        },
        rinkeby: {
            /*provider: function() {
                return new HDWalletProvider("my own mnemonic", "https://rinkeby.infura.io/0xdc75a57bcb72ee8cb88eee0c9b73f853dc85b798")
            },
            network_id: 3,*/
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            from: "0x1a7e8e6e59899cfbcb7f09c408e5cbf9886bac0c", // default address to use for any transaction Truffle makes during migrations
            network_id: 4,
            gas: 4612388 // Gas limit used for deploys
        }
    }
};
