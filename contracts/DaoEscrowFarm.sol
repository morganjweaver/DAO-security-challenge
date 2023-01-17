//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

/*
 *   Offchain Labs Solidity technical challenge:
 *
 *   Examine the DaoEscrowFarm contract provided. 
 *   This is a simple system that allows users to deposit 1 eth per block, and withdraw their deposits in a future date. 
 *   The implementation contains many flaws, including lack of optimisations and bugs that can be exploited to steal funds.
 *
 *   For this challenge we would like you to:
 *
 *   - Explain how someone could deposit more than 1 eth per block
 *
 *   - Analyze the contract for re-entrancy vulnerabilities. If there are any, write a sample contract to exploit it. If not, explain why the contract is secure.
 *
 *   - Optimise the `receive` function so that it is at least 20% cheaper and send a sample contract showing how the optimisation is done.
 *
 *   We don't expect you to spend more than 30 minutes on the challenge. It's not required to find all the issues, but to demonstrate and explain the ones that you do find.
 */

/// @title This is a demo interview contract. Do not use in production!!


contract DaoEscrowFarm {
    uint256 immutable DEPOSIT_LIMIT_PER_BLOCK = 1 ether;

    struct UserDeposit {
        uint256 balance;
        uint256 blockDeposited;
    }
    mapping(address => UserDeposit) public deposits;

    constructor() public {}

    function getBalance(address _addr) public view returns(uint256){
        return deposits[_addr].balance;
    }

    receive() external payable {
        require(msg.value <= DEPOSIT_LIMIT_PER_BLOCK, "TOO_MUCH_ETH");

        UserDeposit storage prev = deposits[tx.origin]; 
        uint256 maxDeposit = prev.blockDeposited == block.number
            ? DEPOSIT_LIMIT_PER_BLOCK - prev.balance
            : DEPOSIT_LIMIT_PER_BLOCK;
        if(msg.value > maxDeposit) {
            // refund user if they are above the max deposit allowed
            uint256 refundValue = maxDeposit - msg.value;
            (bool success,) = msg.sender.call{value: refundValue}("");
            require(success, "ETH_TRANSFER_FAIL");
            
            prev.balance -= refundValue;
        }

        prev.balance += msg.value;
        prev.blockDeposited = block.number;
    }

    function withdraw(uint256 amount) external {
        UserDeposit storage prev = deposits[tx.origin];
        require(prev.balance >= amount, "NOT_ENOUGH_ETH");

        prev.balance -= amount;
        
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "ETH_TRANSFER_FAIL");
    }
}
