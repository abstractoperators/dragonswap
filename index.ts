import { DragonSwap } from "./dragonswap";
import { ExactInputSingleParams } from "./types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is missing from environment variables");
  }

  const dragonSwap = new DragonSwap(privateKey);

  const params: ExactInputSingleParams = {
    tokenIn: "0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7", // WSEI
    tokenOut: "0x5cf6826140c1c56ff49c808a1a75407cd1df9423", // ISEI
    recipient: "0xe98493c9943097f1127dd1c55257fba8ed2e3211",
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now (late af)
    amountIn: "500000000000000000", // 1 token assuming 18 decimals
    amountOutMinimum: "5000000", // tiny amount of output that should always be receiveed
    fee: 500, // 0.05%
    sqrtPriceLimitX96: 0,
  };

  await dragonSwap.exactInputSingle(params);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
