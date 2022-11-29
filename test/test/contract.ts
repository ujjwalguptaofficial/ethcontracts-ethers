import { ERC20 } from "@ethcontracts/core";
import { expect } from "chai";
import { ethers } from "hardhat";
import { IDeployedPayload } from "./interface";
import toWeb3Provider from "ethers-to-web3";
import { Web3Client } from "@ethcontracts/web3";
import { testERC20 } from "./erc20";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("contracts", () => {

  const payload = {


  } as IDeployedPayload;

  before(async () => {
    const [signer1, signer2, signer3, signer4] = await ethers.getSigners();
    payload.deployer = signer1;
    payload.signer2 = signer2;
    payload.signer3 = signer3;
    payload.signer4 = signer4;
  })

  it('deploy erc20 token', async () => {
    const contract = await ethers.getContractFactory('MyToken');

    const deployedContract = await contract.deploy("MyToken", "MT");
    payload.erc20Token1 = deployedContract;

    await payload.erc20Token1.mint(payload.deployer.address, 900000000000);
    await payload.erc20Token1.mint(payload.signer2.address, 900000000000);
    await payload.erc20Token1.mint(payload.signer4.address, 900000000000);
  });

  describe("read only tx with read only provider", () => {
    let erc20: ERC20;

    before(async () => {
      erc20 = new ERC20(payload.erc20Token1.address);
      const client = new Web3Client(toWeb3Provider(payload.deployer.provider));
      await erc20.init(client);
    })

    it('name', async () => {
      const name = await erc20.getName();
      expect(name).equal('MyToken');
    })
  })

  describe("fail write tx", () => {
    let erc20: ERC20;

    before(async () => {
      erc20 = new ERC20(payload.erc20Token1.address);
      const client = new Web3Client(toWeb3Provider(payload.deployer));
      await erc20.init(client);
    })

    it('transfer', async () => {
      // try {
      const [txHashPromise] = await erc20.transferFrom(payload.signer2.address, payload.signer4.address, "1234566666666666666666666666666");
      try {
        const txHash = await txHashPromise();
        throw "there should be error";
      } catch (error) {
        expect(error.message).contains("ERC20: insufficient allowance");
      }
      // } catch (error) {

      // }
    })
  })

  describe("erc20", () => {
    testERC20(
      payload, (user: SignerWithAddress) => {
        return new Web3Client(toWeb3Provider(user));
      }
    )
  })

})