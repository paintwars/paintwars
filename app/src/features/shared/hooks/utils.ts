import { Address } from "viem";
import PixelStakingJSON from "$abis/PixelStakingOApp.json";
import TokenJSON from "$abis/MintableToken.json";
// import ProjectFactoryJSON from "$abis/ProjectFactory.json";

const PIXEL_STAKING_ADDRESS =
  import.meta.env.VITE_PIXEL_STAKING_ADDRESS ||
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PIXEL_STAKING_OAPP_ADDRESS =
  import.meta.env.VITE_PIXEL_STAKING_OAPP_ADDRESS ||
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const TOKEN_ADDRESS =
  import.meta.env.VITE_TOKEN_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PROJECT_FACTORY_ADDRESS = import.meta.env.VITE_PROJECT_FACTORY_ADDRESS;

export const CONTRACTS = {
  PixelStaking: {
    address: PIXEL_STAKING_OAPP_ADDRESS satisfies Address as Address,
    abi: PixelStakingJSON.abi,
  },
  Token: {
    address: TOKEN_ADDRESS satisfies Address as Address,
    abi: TokenJSON.abi,
  },
  ProjectFactory: {
    address: PROJECT_FACTORY_ADDRESS satisfies Address as Address,
    // abi: ProjectFactoryJSON.abi,
  },
};
