const socket = require('zmq').createSocket('rep');
const Web3 = require('web3');
const EosJs = require('eosjs');
const fs = require('fs');

const WormHole = require('./wormhole/WormHoleEosAccount.js');

const wait = () => {
    socket.on('message', function (buf) {
        // echo request back
        socket.send(buf);
    });

    process.on('SIGINT', function () {
        socket.close();
        console.log("... exiting.");
        process.exit();
    });

    console.log("(II) press ctrl+c to exit");
    socket.bindSync('tcp://*:5555');
};

const check = (condition, msg) => {
    if (condition)
        console.log("(II) " + msg);
    else {
        console.error("(EE) " + msg);
        process.exit();
    }
}

console.log("ERC20 teleporting starts ...");


const argv = require('minimist')(process.argv.slice(2), {
    string: ['blackhole', 'whitehole_key']
});

const blackHoleAddress = Web3.utils.toChecksumAddress(argv.blackhole);
check(blackHoleAddress, "blackhole address: " + blackHoleAddress);
const whiteHoleAddress = argv.whitehole;
check(whiteHoleAddress, "whitehole address: " + whiteHoleAddress);
const web3Provider = argv.provider;
check(web3Provider, "Ethereum provider: " + web3Provider);
const whitehole_key = argv.whitehole_key; 
check(whitehole_key, 'whitehole key: ' + whitehole_key);
const blackHoleFile = './blackhole/build/contracts/BlackHoleEosAccount.json';
check(fs.existsSync(blackHoleFile), "blackhole file: " + blackHoleFile);

// Ethereum
const web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(web3Provider)); 
const input = fs.readFileSync(blackHoleFile);
const contract = JSON.parse(input.toString());
const abi = contract.abi;

check(web3.utils.isAddress(blackHoleAddress), "validating blackhole address");
const blackHole = new web3.eth.Contract(abi, blackHoleAddress);
check(blackHole, "create instance to blackhole contract");
check(blackHole.options.address === blackHoleAddress, "instance has correct address");

// EOS 
const eosJs = new EosJs();

config = {
    chainId: null, // 32 byte (64 char) hex string
    keyProvider: [whitehole_key], // WIF string or array of keys..
    httpEndpoint: 'http://127.0.0.1:8888',
    expireInSeconds: 60,
    broadcast: true,
    verbose: false, // API activity
    sign: true
};

// WormHole
const wormHole = new WormHole(blackHole);
check(wormHole, "instantiate wormhole");

wait();





