import { BigNumberish } from "ethers";

interface ExactInputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  deadline: number;
  amountIn: BigNumberish;
  amountOutMinimum: BigNumberish;
  sqrtPriceLimitX96: BigNumberish;
}

export { ExactInputSingleParams };
