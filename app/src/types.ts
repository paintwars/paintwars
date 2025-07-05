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

export type IPixelInDB = {
	id: number;
	color: number;
	stake_amount: number | string;
	owner: string;
	hash: string;
};

export type IPixelEventUpdate = {
	id: string;
	logIndex: number;
	hash: string;
	pixelId: number;
	stakeAmount?: number | undefined;
	color?: number | undefined;
	owner?: string | undefined;
	timestamp: string;
};
export type IPixelEvent = {
	id: string;
	logIndex: number;
	hash: string;
	pixelId: number;
	stakeAmount: number;
	color: number;
	owner: string;
	timestamp: string;
};

export type IPixelEventInDB = {
	log_index: number;
	hash: string;
	pixel_id: number;
	stake_amount: number | string;
	color: number;
	owner: string;
	timestamp: string;
};
