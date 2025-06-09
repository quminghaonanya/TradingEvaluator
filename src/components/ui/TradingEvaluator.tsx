"use client"
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TradingHistory } from "./TradingHistory";
import { getNextId, createTradeHistory, fetchTradeHistory } from "../client/DbClient";
import { TradeHistoryModel } from "@/app/dto/TradingHistoryDTO";

const MAX_LOSS_PCT = 0.02;
const MUST_TP_PCT = 0.3;

function formatNumber(num: number, decimals = 2): string {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function evaluateTrade(
    totalAssets: number,
    currentPrice: number,
    direction: "long" | "short",
    slPrice: number,
    tpPrice: number,
    winRatio: number
): { logs: string[]; isValid: boolean; kellySize: number } {
    const income = Math.abs(tpPrice - currentPrice) / currentPrice;
    const loss = Math.abs(slPrice - currentPrice) / currentPrice;
    const roi = winRatio * income - (1 - winRatio) * loss;

    const logs: string[] = [];
    logs.push(`Income: ${income.toFixed(4)}`);
    logs.push(`Loss: ${loss.toFixed(4)}`);
    logs.push(`ROI: ${roi.toFixed(4)}`);

    if (roi < 0) {
        logs.push("Not a good trade");
        return { logs, isValid: false, kellySize: 0 };
    }

    const lossRatio = Math.abs(currentPrice - slPrice) / currentPrice;
    const maxLeverage = MAX_LOSS_PCT / lossRatio;
    const maxPositionSize = totalAssets * maxLeverage;

    logs.push(`Max Leverage: ${maxLeverage.toFixed(4)}`);
    logs.push(`Max Position Size: ${formatNumber(maxPositionSize)}`);

    if (direction === "long") {
        const mustSlPrice = (1 - MAX_LOSS_PCT / maxLeverage) * currentPrice;
        const mustTpPrice = (1 + MUST_TP_PCT / maxLeverage) * currentPrice;
        logs.push(`Must SL Price (Long): ${formatNumber(mustSlPrice)}`);
        logs.push(`Must TP Price (Long): ${formatNumber(mustTpPrice)}`);
    } else {
        const mustSlPrice = (1 + MAX_LOSS_PCT / maxLeverage) * currentPrice;
        const mustTpPrice = (1 - MUST_TP_PCT / maxLeverage) * currentPrice;
        logs.push(`Must SL Price (Short): ${formatNumber(mustSlPrice)}`);
        logs.push(`Must TP Price (Short): ${formatNumber(mustTpPrice)}`);
    }

    const b = income / loss;
    const kelly = winRatio - (1 - winRatio) / b;
    const kellySize = kelly > 0 ? totalAssets * maxLeverage * kelly : 0;

    logs.push(`Kelly Factor: ${(kelly * 100).toFixed(2)}%`);
    logs.push(`Kelly-Adjusted Position Size: ${kelly > 0 ? formatNumber(kellySize) : "0 (not a profitable edge)"}`);

    return { logs, isValid: true, kellySize };
}

export default function TradeEvaluator() {
    const [inputs, setInputs] = useState({
        totalAssets: 447000,
        currentPrice: 2667,
        direction: "short" as "long" | "short",
        slPrice: 2700,
        tpPrice: 2500,
        winRatio: 0.6,
    });
    const [symbol, setSymbol] = useState("ETHUSDT");
    const [output, setOutput] = useState<string[]>([]);
    const [mode, setMode] = useState<"plan" | "trade">("trade");
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
    const [canSave, setCanSave] = useState(false);
    const [kellySize, setKellySize] = useState(0);

    async function fetchPrice() {
        try {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
            const data = await res.json();
            if (data.price) {
                setInputs((prev) => ({ ...prev, currentPrice: parseFloat(data.price) }));
            }
        } catch (err) {
            console.error("Failed to fetch price:", err);
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (symbol && mode === "trade") {
            fetchPrice();
            interval = setInterval(fetchPrice, 10000);
        }
        return () => clearInterval(interval);
    }, [symbol, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleDirectionChange = () => {
        setInputs((prev) => ({
            ...prev,
            direction: prev.direction === "long" ? "short" : "long",
        }));
    };
    const handleTradeIdChange = (id: number | undefined) => {
        setTradeId(id);
    };

    const toggleMode = () => {
        setMode((prev) => (prev === "trade" ? "plan" : "trade"));
    };

    const runEvaluation = () => {
        const result = evaluateTrade(
            inputs.totalAssets,
            inputs.currentPrice,
            inputs.direction,
            inputs.slPrice,
            inputs.tpPrice,
            inputs.winRatio
        );
        setOutput(result.logs);
        setCanSave(result.isValid);
        setKellySize(result.kellySize);
        // if (result.logs.length) setHistory((prev) => [[...result.logs], ...prev]);
    };


    const savePlan = async () => {
        const plan = {
            currentPrice: inputs.currentPrice,
            direction: inputs.direction,
            slPrice: inputs.slPrice,
            tpPrice: inputs.tpPrice,
            winRatio: inputs.winRatio,
            maxLoss: MAX_LOSS_PCT,
            positionSize: kellySize,
            startTimeStamp: Date.now()
        };

        const execution = {
            symbol,
            positionSize: kellySize,
            direction: inputs.direction,
            enterPrice: inputs.currentPrice,
            exitPrice: inputs.tpPrice,
            pnl: 0,
            status: "ongoing",
            startTimeStamp: undefined,
            endTimeStamp: undefined,
            remark: ""
        };

        const tradeId = await getNextId();
        console.log("tradeId: " + tradeId);
        await createTradeHistory({
            plan, execution,
            tradeId: tradeId,
            review: "",
            symbol: symbol,
            totalAssets: inputs.totalAssets,
        });
        setCanSave(false);
        loadHistory();
    };

    const reloadHistory = () => {
        loadHistory(tradeId);
    };

    return (
        <div className="max-w-7xl mx-auto mt-10 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardContent className="space-y-4 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-lg font-semibold">Mode: {mode.toUpperCase()}</div>
                        <Button onClick={toggleMode} variant="outline">Switch to {mode === "trade" ? "Plan" : "Trade"} Mode</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Trading Pair (e.g. BTCUSDT)</label>
                            <Input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={fetchPrice}>Refresh Price</Button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Total Assets</label>
                            <Input type="number" name="totalAssets" value={inputs.totalAssets} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Current Price</label>
                            <Input type="number" name="currentPrice" value={inputs.currentPrice} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stop Loss Price (SL)</label>
                            <Input type="number" name="slPrice" value={inputs.slPrice} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Take Profit Price (TP)</label>
                            <Input type="number" name="tpPrice" value={inputs.tpPrice} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Win Ratio (0-1)</label>
                            <Input type="number" step="0.01" name="winRatio" value={inputs.winRatio} onChange={handleChange} />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleDirectionChange}>Direction: {inputs.direction}</Button>
                        </div>
                    </div>
                    <Button className="w-full" onClick={runEvaluation}>Evaluate Trade</Button>
                    {canSave && (
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={savePlan}>Add Plan</Button>
                    )}
                    <div className="space-y-2">
                        {output.map((line, idx) => (
                            <div key={idx} className="text-sm">{line}</div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <TradingHistory history={history} tradeIdChange={handleTradeIdChange} reloadHistory={reloadHistory} />

        </div>
    );
}
