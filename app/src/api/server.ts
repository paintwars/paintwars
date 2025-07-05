import Axios from "axios";
import { type Address, formatEther } from "viem";
import type {
	IPixelEvent,
	IPixelEventInDB,
	IPixelInDB,
	IPixelUpdate,
} from "../types";
import { generateId } from "../utils";

// const API_SERVER = "https://paintwars.fun/api";
const API_SERVER = "http://localhost:1234/api";
const STAKE_ENDPOINT = "paintwars";
const axios = Axios.create({
	baseURL: `${API_SERVER}`,
	headers: { "Content-Type": "application/json" },
});

export const server = {
	// Pixels
	getPixels: async (): Promise<Array<IPixelUpdate>> => {
		const res = await axios.get<Array<IPixelInDB>>(`${STAKE_ENDPOINT}/pixels`);
		return res.data.map((p) => ({
			id: p.id,
			color: p.color,
			owner: p.owner as Address,
			stakeAmount: Number(formatEther(BigInt(p.stake_amount))),
			hash: p.hash,
		}));
	},

	getPixelEventsForPixel: async (
		pixelId: number,
	): Promise<Array<IPixelEvent>> => {
		const res = await axios.get<Array<IPixelEventInDB>>(
			`${STAKE_ENDPOINT}/pixelEvents/${pixelId}`,
		);
		return res.data.map((e) => ({
			id: generateId(e.timestamp, e.log_index),
			pixelId: e.pixel_id,
			logIndex: e.log_index,
			color: e.color,
			owner: e.owner as Address,
			hash: e.hash,
			stakeAmount: Number(formatEther(BigInt(e.stake_amount))),
			timestamp: e.timestamp,
		}));
	},
};
