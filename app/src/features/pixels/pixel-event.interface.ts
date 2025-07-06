export type IPixelEvent = {
  id: string;
  logIndex: number;
  hash: string;
  pixelId: number;
  stakeAmount: number;
  effectiveStakeAmount: number;
  color: number;
  owner: string;
  timestamp: string;
};

export type IPixelEventInDB = {
  log_index: number;
  chain_id: number;
  hash: string;
  pixel_id: number;
  stake_amount: number | string;
  effective_stake_amount: number | string;
  token_address: string;
  color: number;
  owner: string;
  timestamp: string;
};

export function generateId(timestamp: string, logIndex: number): string {
  return `${timestamp}-${logIndex}`;
}
