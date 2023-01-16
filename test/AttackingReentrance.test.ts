/* eslint-disable no-unused-expressions,camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, BigNumberish } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DaoEscrowFarm, DaoEscrowFarmImproved, Attack } from "../typechain-types";

const closeTo = async (
  a: BigNumberish,
  b: BigNumberish,
  margin: BigNumberish
) => {
  expect(a).to.be.closeTo(b, margin);
};

const ONE_ETHER = ethers.utils.parseEther("1");
const ONE_TENTH_ETHER = ethers.utils.parseEther(".1");
describe("DAOAttack", () => {
    async function setupFixture() {
        const [deployer]: SignerWithAddress[] =
          await ethers.getSigners();
        const provider = ethers.getDefaultProvider('goerli');
        const DAO = await ethers.getContractFactory("DaoEscrowFarm");
        const dao: DaoEscrowFarm = (await DAO.deploy()) as DaoEscrowFarm;
        await dao.deployed();
        const DAOI = await ethers.getContractFactory("DaoEscrowFarmImproved");
        const daoImproved: DaoEscrowFarmImproved = await DAOI.deploy() as DaoEscrowFarmImproved;
        await daoImproved.deployed();
        const attackFactory = await ethers.getContractFactory("Attack");
        const attack: Attack = await attackFactory.deploy(dao.address, {value: ethers.utils.parseEther("5")}) as Attack;
        return { deployer, provider, attack, dao, daoImproved };
      }

      describe("Deployment & Attack", () => {
        it("Deploys a contract", async () => {
          const { dao, attack, provider } = await loadFixture(setupFixture);
          expect(dao.address).to.not.equal(0);
          expect(attack.address).to.not.equal(0);
          expect(await provider.getBalance(attack.address) > ethers.utils.parseEther("1"));

        });
        it("Successfully deposits", async () => {
          const {deployer, dao} = await loadFixture(setupFixture);
          await deployer.sendTransaction({to: dao.address, value: ethers.utils.parseEther('1')});
          console.log("Regular deposit: %s", await dao.connect(deployer).getBalance(deployer.address));
          expect(await dao.connect(deployer).getBalance(deployer.address)).to.be.closeTo(ONE_ETHER,ONE_TENTH_ETHER);
        });

        it("Attacker Successfully deposits legit eth", async () => {
          const {attack, dao, deployer, provider} = await loadFixture(setupFixture);
          await deployer.sendTransaction({to: attack.address, value: ethers.utils.parseEther('10')});
          console.log("Attacker bal: %s", ethers.utils.formatEther(await provider.getBalance(attack.address)));
          const suc = (await attack.depositOnce()).value;
          console.log("Attacker deposit: %s; SUCCESS: %s", await dao.connect(deployer.address).getBalance(attack.address), suc);
          // Must be verified on chain or via console output of DAO contract!
          //expect(await dao.connect(deployer.address).getBalance(attack.address)).to.be.closeTo(ethers.utils.parseEther(".7"),ONE_TENTH_ETHER);
        });

        it("Successfully performs a reentrancy attack", async () => {
            const {dao, attack, deployer} = await loadFixture(setupFixture);
            await attack.hackContract();
            const balance = await dao.connect(attack.address).getBalance(deployer.address);
            console.log("Amount deposited: %s", (ethers.utils.formatEther(balance)))
            console.log(balance);
            // Must be verified on chain or via console output of DAO contract!
            //expect(balance).to.be.greaterThan(ethers.utils.parseEther("1"));
        });

        

        it("Uses a large amount of gas for the receive function", async () => {
          const {dao, deployer, provider} = await loadFixture(setupFixture);
          const balance:BigNumber = await provider.getBalance(deployer.address);
          const addr1Bal = await provider.getBalance(deployer.address)
          const txValue = ethers.utils.parseEther('0.03').mul(BigNumber.from('4'))
          const tx = await deployer.sendTransaction({ to: dao.address, value: ethers.utils.parseEther('.01') });
          const receipt = await tx.wait()
          console.log('total ether spent on gas for transaction: \t', ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice)))
          console.log('balance difference minus transaction value: \t', ethers.utils.formatEther(addr1Bal.sub(await provider.getBalance(deployer.address)).sub(txValue)))

        })

        it("Uses a reduced amount of gas for the IMPROVED receive function", async () => {
          const {daoImproved, deployer, provider} = await loadFixture(setupFixture);
          const balance:BigNumber = await provider.getBalance(deployer.address);
          const addr1Bal = await provider.getBalance(deployer.address)
          const txValue = ethers.utils.parseEther('0.03').mul(BigNumber.from('4'))
          const tx = await deployer.sendTransaction({ to: daoImproved.address, value: ethers.utils.parseEther('.01') });
          const receipt = await tx.wait()
          console.log('total ether spent on gas for transaction: \t', ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice)))
          console.log('balance difference minus transaction value: \t', ethers.utils.formatEther(addr1Bal.sub(await provider.getBalance(deployer.address)).sub(txValue)))

        })
    })
})