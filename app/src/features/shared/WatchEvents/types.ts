import { Address, Log } from "viem";

type BasicEvent = Log & {
  eventName: "PixelChanged";
  blockTimestamp: number;
  transactionHash: string;
  logIndex: number;
};
export type PixelChangedEvent = BasicEvent & {
  eventName: "PixelChanged";
  args: {
    staker: Address;
    pixelId: number;
    color: number;
    amount: bigint;
    effectiveAmount: bigint;
    token_address: Address;
  };
};

export type PixelEvent = PixelChangedEvent;

type ProjectCreatedEvent = BasicEvent & {
  args: {
    creator: string;
    projectAddress: string;
    base64Image: string;
  };
};
