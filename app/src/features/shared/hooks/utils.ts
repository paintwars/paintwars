import { Address } from "viem";
import PixelStakingJSON from "$abis/PixelStaking.json";
import TokenJSON from "$abis/MintableToken.json";
// import ProjectFactoryJSON from "$abis/ProjectFactory.json";

const PIXEL_STAKING_ADDRESS = import.meta.env.VITE_PIXEL_STAKING_ADDRESS;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const PROJECT_FACTORY_ADDRESS = import.meta.env.VITE_PROJECT_FACTORY_ADDRESS;

export const CONTRACTS = {
  PixelStaking: {
    address: PIXEL_STAKING_ADDRESS satisfies Address as Address,
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
