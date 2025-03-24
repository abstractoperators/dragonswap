import { isAddress } from "ethers";
import { JsonRpcProvider } from "ethers";
import { Wallet } from "ethers";
import { Contract } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

export class DragonSwap {
  private readonly DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS: string;
  private readonly DRAGONSWAP_V2_FACTORY_ADDRESS: string;
  private readonly RPC_URL: string;
  private readonly contractAddress: string;
  private readonly signer: Wallet;
  private readonly provider: JsonRpcProvider;
  private readonly routerContract: Contract;

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

    const TODO_ABI = [];
    const TODO_ABI_FACTORY = [];
    const routerContract = new Contract(
      this.DRAGONSWAP_V2_SWAP_ROUTER_ADDRESS,
      TODO_ABI,
      this.signer
    );
    const factoryContract = new Contract(
      this.DRAGONSWAP_V2_FACTORY_ADDRESS,
      TODO_ABI_FACTORY,
      this.signer
    );
  }
}
