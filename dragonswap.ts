import { isAddress } from "ethers";
import { ExactInputSingleParams } from "./types";
import { JsonRpcProvider } from "ethers";
import { Wallet } from "ethers";
import { Contract } from "ethers";
import * as dotenv from "dotenv";
const routerAbi = require("./routerAbi.json")["abi"];
const factoryAbi = require("./factoryAbi.json")["abi"];
const poolAbi = require("./poolAbi.json")["abi"];
dotenv.config();

export class DragonSwap {
  private readonly DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS: string;
  private readonly DRAGONSWAP_V2_FACTORY_ADDRESS: string;
  private readonly RPC_URL: string;
  // private readonly contractAddress: string;
  private readonly signer: Wallet;
  private readonly provider: JsonRpcProvider;
  private readonly routerContract: Contract;
  private readonly factoryContract: Contract;

  constructor(privateKey: string) {
    const {
      DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS,
      DRAGONSWAP_V2_FACTORY_ADDRESS,
      RPC_URL,
    } = process.env;
    if (
      !DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS ||
      !DRAGONSWAP_V2_FACTORY_ADDRESS ||
      !RPC_URL
    ) {
      throw new Error("Missing environment variables");
    }

    if (
      !isAddress(DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS) ||
      !isAddress(DRAGONSWAP_V2_FACTORY_ADDRESS)
    ) {
      throw new Error("Invalid contract address(es)");
    }
    this.DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS = DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS;
    this.DRAGONSWAP_V2_FACTORY_ADDRESS = DRAGONSWAP_V2_FACTORY_ADDRESS;
    this.RPC_URL = RPC_URL;

    this.provider = new JsonRpcProvider(this.RPC_URL);
    this.signer = new Wallet(privateKey, this.provider);

    this.routerContract = new Contract(
      this.DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS,
      routerAbi,
      this.signer
    );
    this.factoryContract = new Contract(
      this.DRAGONSWAP_V2_FACTORY_ADDRESS,
      factoryAbi,
      this.signer
    );
  }

  /**
   * Swap an exact input amount of an input token for as much output as possible.
   * @param params - An object containing swap parameters (tokenIn, tokenOut, etc.)
   **/
  async exactInputSingle(params: ExactInputSingleParams) {
    console.log(params);

    const { tokenIn } = params;
    const tokenInContract = new Contract(
      tokenIn,
      [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function allowance(address owner, address spender) public view returns (uint256)",
      ],
      this.signer
    );
    const approveTx = await tokenInContract.approve(
      this.DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS,
      params.amountIn
    );
    const receiptApprove = await approveTx.wait();
    console.log("Approved tokenIn", receiptApprove);

    const poolAddress = await this.factoryContract.getPool(
      params.tokenIn,
      params.tokenOut,
      params.fee
    );
    const allowance = await tokenInContract.allowance(
      params.recipient,
      this.routerContract.target
    );
    console.log("Allowance:", allowance.toString());

    //@ts-ignore
    const staticSwap = await this.routerContract.exactInputSingle.staticCall(
      params
    );
    console.log("Static Swap", staticSwap);
    // const swapTx = await this.routerContract.exactInputSingle(params);
    // const receiptSwap = await swapTx.wait();
    // console.log("Swapped", receiptSwap);
  }
}
