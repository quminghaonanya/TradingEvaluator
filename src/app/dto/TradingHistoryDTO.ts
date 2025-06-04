
export interface TradeHistoryModel {
    id: string | undefined;
    plan: Plan;
    execution: Execution;
    review: string;
}


export interface Plan {
    symbol: string;
    totalAssets: number;
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
    symbol: string;
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
    execution: Execution;
    createdAt: Date;
}
