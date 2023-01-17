 # YieldFarm Quick Audit 
 MORGAN WEAVER: AUDIT FINDINGS AND ANSWERS 


 For this challenge we would like you to:
 
    - Explain how someone could deposit more than 1 eth per block
      
      This can happen on a simple reentrance attack, since the Checks-Effects-Interactions pattern is not observed, and control is handed back to the caller *before* the balance is updated in storage for that block.  It can be achieved by simply creating an attack contract with a `receive() external payable` function that launches an additional deposit when >1 ETH is deposited, and the refund is sent to the attack contract. Midway through the deposit, during the refund, the attacker deposits again before the balance has been updated. 
      
    - Analyze the contract for re-entrancy vulnerabilities. If there are any, write a sample contract to exploit it. If not, explain why the contract is secure.
    
    Yes!  Please see the information above re: reentrancy in the receive() function. Attack contract attached. 


    See included attack contract, and sample double deposit transaction here: https://goerli.etherscan.io/tx/0x88b91663c88fe4728c302c460e4fa720be65c991421e1484a945bd0dde9d8a21

    Escrow farm verification: https://goerli.etherscan.io/address/0xd46DA3234eB913085898fB1610b93382A93E9800#code
 
    - Optimise the `receive` function so that it is at least 20% cheaper and send a sample contract showing how the optimisation is done.
    
    See included DaoEscrowFarmImproved.sol

    Original gas spent:  0.000109815902994
    Improved contract gas spent: 0.000040762389963512

    Modifications:

    - Moved refund to end of function for reentrancy protection
    - Swapped require statements for if/revert statements with errors (saves small amount of gas)
    - Moved refund into a separate function for pull-over-push model; save gas by doing ONE refund vs piecemeal (gas cost: 21000 units!) every time
    - Couldn't figure out how to test gas cost of a built-in override (receive function) with hardhat-gas-reporter, 
      but did some checks with ethers tests and found a reduction in gas cost overall, especially amoritized over multiple deposits with refunds. 
  
    Other findings:
    - Could use merkle tree instead of structs to check membership/blocks of addresses, save small amount of gas
    - Seems like trying to deposit twice in a single block isn't really possible if the amount in the struct is already > 1 ETH? 
  
    We don't expect you to spend more than 30 minutes on the challenge. It's not required to find all the issues, but to demonstrate and explain the ones that you do find.
 


* 1. More than 1 eth may be deposited per block.  The receive function never actually checks the total deposit amount per block against the 
*  1 eth limit after the refund has been sent, so a simple re-entrancy attack could allow a depositor to trigger an additional deposit to the 
*  contract upon receipt of the refunded eth--and the max remaining deposit value wouldn't have changed yet mid-execution, so >1 eth can be deposited
*  per block.  
* 2. 
*/


This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
