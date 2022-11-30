import { ERC20 } from "@ethcontracts/core";
import { expect } from "chai";
import { ethers } from "hardhat";
import { IDeployedPayload } from "./interface";
import { EthersClient } from "@ethcontracts/ethers";
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
      const client = new EthersClient(payload.deployer.provider as any);
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
      const client = new EthersClient(payload.deployer as any);
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

  describe('wallet address', () => {
    it('read only provider', async () => {
      const client = new EthersClient(payload.deployer.provider as any);
      await client.init();
      expect(client.walletAddress).equal(undefined);
    })

    it('write provider', async () => {
      const client = new EthersClient(payload.deployer as any);
      await client.init();
      expect(client.walletAddress).equal(payload.deployer.address);
    })
  })

  describe('check for balance on chain', async () => {
    var client: EthersClient;

    before(async () => {
      client = new EthersClient(payload.deployer as any);
      await client.init();
    })

    it('when address provided', async () => {
      const balance: any = await client.getBalance(payload.signer2.address);
      expect(balance.toString()).equal('10000000000000000000000');
    })

    it('when address not provided', async () => {
      const balance: any = await client.getBalance();
      expect(balance.toString()).equal('9999997402096589066680');
    })
  })

  describe("erc20", () => {
    testERC20(
      payload, (user: SignerWithAddress) => {
        return new EthersClient(user as any);
      }
    )
  })

})