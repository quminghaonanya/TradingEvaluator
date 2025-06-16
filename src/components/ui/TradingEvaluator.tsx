"use client"
import React, { useState, useEffect } from "react";
import { TradingHistory } from "./TradingHistory";
import { getNextId, createTradeHistory, fetchTradeHistory } from "../client/DbClient";
import { TradeHistoryModel } from "@/app/dto/TradingHistoryDTO";
import { TradeEvaluatorForm } from "./TradeEvaluatorForm";
import { TradingViewCustomised } from "./TradingViewCustomised";

export default function TradeEvaluator() {
    const [tradeId, setTradeId] = useState<number | undefined>(undefined);

    async function loadHistory(tradeId?: number) {
        try {
            const data = await fetchTradeHistory(tradeId);
            setHistory(data);
        } catch (error) {
            console.error("Error loading trade history:", error);
        }
    }
    useEffect(() => {
        loadHistory(tradeId);
    }, [tradeId]);
    const [history, setHistory] = useState<TradeHistoryModel[]>([]);

    const handleTradeIdChange = (id: number | undefined) => {
        setTradeId(id);
    };

    const reloadHistory = () => {
        loadHistory(tradeId);
    };

    const [symbol, setSymbol] = useState("BINANCE:BTCUSDT");

    const handleSymbolChange = (symbol: string) => {
        setSymbol(symbol);
    };
    useEffect(() => {
        console.log("symbol: " + symbol);
    }, [symbol]);

    return (
        <div className="max-full max-h-full mx-auto mt-10 p-4 grid grid-cols-[30%_70%] gap-6">
            <div className="self-start">
                <TradeEvaluatorForm reloadHistory={reloadHistory} handleSymbolChange={handleSymbolChange} />
                <TradingHistory history={history} tradeIdChange={handleTradeIdChange} reloadHistory={reloadHistory} />
            </div>
            <div className="h-full">
                <TradingViewCustomised symbol={symbol} />
            </div>

        </div>
    );
}
