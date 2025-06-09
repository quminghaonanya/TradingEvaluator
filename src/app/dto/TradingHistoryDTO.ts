
export interface TradeHistoryModel {
    id?: string | undefined;
    symbol: string;
    totalAssets: number;
    plan?: Plan | undefined;
    execution: Execution;
    review: string;
    tradeId: number
}


export interface Plan {
    currentPrice: number;
    direction: string;
    slPrice: number;
    tpPrice: number;
    winRatio: number;
    maxLoss: number;
    startTimeStamp: number
    positionSize: number
}

export interface Execution {
    positionSize: number | undefined;
    direction: string;
    enterPrice: number;
    exitPrice: number;
    pnl: number;
    status: string;
    startTimeStamp: number | undefined
    endTimeStamp: number | undefined
}

export interface TradeHistoryDocument extends Document {
    plan: Plan;
    totalAssets: number;
    symbol: string;
    execution: Execution;
    tradeId: number;
    review: string;
    createdAt: Date;
}
