import { BigNumberish } from "ethers";

interface ExactInputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  amountIn: BigInt;
  amountOutMinimum: BigInt;
  sqrtPriceLimitX96: BigInt;
}

export { ExactInputSingleParams };
