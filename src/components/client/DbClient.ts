import { TradeHistoryModel } from "@/app/dto/TradingHistoryDTO";

export async function fetchTradeHistory(tradeId: number | undefined) {
    var path = "/api/trade-history?"
    if (tradeId) {
        path += "tradeId=" + tradeId;
    }
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error('Failed to fetch trade history');
    }
    return await res.json();
}


export async function createTradeHistory(data: TradeHistoryModel) {
    const res = await fetch('/api/trade-history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to create trade history');
    }

    return await res.json();
}


export async function updateTradeHistory(data: TradeHistoryModel) {
    const res = await fetch('/api/trade-history', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error('Failed to update trade history');
    }

    return await res.json();
}

export async function countTradeHistory(): Promise<number> {
    const response = await fetch('/api/trade-history?action=count');
    if (!response.ok) {
        throw new Error('Failed to count trade history');
    }
    const data = await response.json();
    return data.count;
}

export async function getNextId(): Promise<number> {
    const response = await fetch('/api/trade-history?action=getNextId');
    if (!response.ok) {
        throw new Error('Failed to get next id');
    }
    const data = await response.json();
    return data.nextId;
}