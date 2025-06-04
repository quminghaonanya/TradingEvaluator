// services/tradeHistoryService.ts

import { TradeHistoryDocument, TradeHistoryModel } from "../../src/schema/TradingHistoryModel";
/** Create a new trade history record */
export async function createTradeHistory(data: Partial<TradeHistoryDocument>) {
    const trade = new TradeHistoryModel(data);
    await trade.save();
}

/** Get all trade histories */
export async function getAllTradeHistories(): Promise<TradeHistoryDocument[]> {
    return await TradeHistoryModel.find().sort({ createdAt: -1 });
}

/** Get a single trade history by ID */
export async function getTradeHistoryById(id: string): Promise<TradeHistoryDocument | null> {
    return await TradeHistoryModel.findById(id);
}

/** Update a trade history record */
export async function updateTradeHistory(id: string, updates: Partial<TradeHistoryDocument>) {
    return await TradeHistoryModel.findByIdAndUpdate(id, updates, { new: true });
}

/** Delete a trade history record */
export async function deleteTradeHistory(id: string) {
    return await TradeHistoryModel.findByIdAndDelete(id);
}
