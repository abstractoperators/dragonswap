import { isAddress } from "ethers";
import { ExactInputSingleParams, ExactOutputSingleParams } from "./types";
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
   * @param tokenIn - The address of the token to swap from.
   * @param tokenOut - The address of the token to swap to.
   * @returns The minimum fee for swapping the given tokens in milli-basis points (i.e. 100 = 0.01%). If a pool does not exist for the given tokens, returns undefined.
   * Note: No guarantees that the pool exists, or that the pool has sufficient liquidity. A pool with minimum fee may also not have the best effective rate.
   */
  async findMinFee(tokenIn: string, tokenOut: string) {
    const fees = [100, 500, 3000, 10000]; // 0.01%, 0.05%, 0.3%, 1%
    for (const fee of fees) {
      try {
        const poolAddress = await this.factoryContract.getPool(
          tokenIn,
          tokenOut,
          fee
        );
        console.log("Pool address", poolAddress);

        return fee;
      } catch (e) {
        console.log(e);
      }
    }
  }
  /**
   * @param tokenIn - The address of the token to swap from.
   * @param tokenOut - The address of the token to swap to.
   * @param fee - The fee in milli-basis points (i.e. 100 = 0.01%).
   * @returns The address of the pool that can be used to swap the given tokens with the given fee. If no pool exists, then it returns 0x00000000....
   */
  async findPool(tokenIn: string, tokenOut: string, fee: number) {
    const poolAddress = await this.factoryContract.getPool(
      tokenIn,
      tokenOut,
      fee
    );
    return poolAddress;
  }

  /**
   * Swap an exact input amount of an input token for as much output as possible.
   * Single hop, meaning only one pool is used for the swap.
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

    const swapTx = await this.routerContract.exactInputSingle(params);
    const receiptSwap = await swapTx.wait();
    console.log("Swapped", receiptSwap);
  }

  /**
   * Swaps as little  as possible of one token for amountOut of another token that may remain in the router after the swap.
   * @params params
   */
  async exactOutputSingle(params: ExactOutputSingleParams) {
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
      params.amountInMaximum
    );

    const receiptApprove = await approveTx.wait();
    console.log("Approved tokenIn", receiptApprove);

    const swapTx = await this.routerContract.exactOutputSingle(params);
    const receiptSwap = await swapTx.wait();
    console.log("Swapped", receiptSwap);
  }

  /**
   *
   */
  async createPool(tokenA: string, tokenB: string, fee: number) {
    const createPoolTx = await this.factoryContract.createPool(
      tokenA,
      tokenB,
      fee
    );
    const receipt = await createPoolTx.wait();
    console.log("Created pool", receipt);
  }
}
