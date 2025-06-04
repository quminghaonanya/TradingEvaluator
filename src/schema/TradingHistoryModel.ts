// models/TradeHistory.ts
import { Execution, Plan, TradeHistoryDocument } from '@/app/dto/TradingHistoryDTO';
import mongoose, { Schema, Document } from 'mongoose';


const PlanSchema = new Schema<Plan>({
    symbol: { type: String, required: true },
    totalAssets: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    direction: { type: String, required: true },
    slPrice: { type: Number, required: true },
    tpPrice: { type: Number, required: true },
    winRatio: { type: Number, required: true },
    maxLoss: { type: Number, required: true },
    positionSize: { type: Number, required: true },
    startTimeStamp: { type: Number, required: true },
});

const ExecutionSchema = new Schema<Execution>({
    symbol: { type: String, required: true },
    positionSize: { type: Number, required: false },
    direction: { type: String, required: true },
    enterPrice: { type: Number, required: false },
    exitPrice: { type: Number, required: false },
    pnl: { type: Number, required: false },
    startTimeStamp: { type: Number, required: false },
    endTimeStamp: { type: Number, required: false },
});

export const TradeHistorySchema = new Schema<TradeHistoryDocument>(
    {
        plan: { type: PlanSchema, required: true },
        execution: { type: ExecutionSchema, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { collection: 'trade_histories' }
);

// Define the model using the schema
export const TradeHistoryModel =
    mongoose.models.TradeHistoryModel as mongoose.Model<TradeHistoryDocument> ||
    mongoose.model<TradeHistoryDocument>('TradeHistoryModel', TradeHistorySchema);

