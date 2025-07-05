export type IPixelUpdate = {
    id: number;
    color?: number | undefined;
    stakeAmount?: number | undefined;
    owner?: string | undefined;
    hash: string;
  };
  export type IPixel = IPixelUpdate & {
    x: number;
    y: number;
  };
  