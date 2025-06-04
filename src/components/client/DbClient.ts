import { TradeHistoryModel } from "@/app/dto/TradingHistoryDTO";

export async function fetchTradeHistory() {
    const res = await fetch('/api/trade-history');

    if (!res.ok) {
        throw new Error('Failed to fetch trade history');
    }
    // console.log(await res.json());
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