import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TradeHistoryModel } from "@/app/dto/TradingHistoryDTO";
import ReactMarkdown from "react-markdown";
import { countTradeHistory, updateTradeHistory } from "../client/DbClient";

interface TradingHistoryProps {
    history: TradeHistoryModel[];
}

export const TradingHistory: React.FC<TradingHistoryProps> = ({ history }) => {
    const [editableHistory, setEditableHistory] = useState(history);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleInputChange = async (field: string, value: string) => {
        if (editingIndex === null) return;
        const updated = [...editableHistory];
        (updated[editingIndex].execution as any)[field] = value;
        await updateTradeHistory(updated[editingIndex]);
        setEditableHistory(updated);
    };

    const closeModal = () => setEditingIndex(null);
    const getCardColor = (status: string) => {
        switch (status) {
            case "ongoing":
                return "border-gray-300 bg-gray-50";
            case "win":
                return "border-green-400 bg-green-50";
            case "lose":
                return "border-red-400 bg-red-50";
        }
    }
    const tradeDate = (date: number | undefined) => {
        return date ? new Date(date).toISOString().replace(/T/, '-').replace(/\..+/, '') : "";
    }
    const targetProfit = (direction: string, currentPrice: number, tpPrice: number, positionSize: number) => {
        return direction === "buy" ? (tpPrice - currentPrice) / currentPrice * positionSize :
            (currentPrice - tpPrice) / currentPrice * positionSize;
    }
    const maxLoss = (direction: string, currentPrice: number, slPrice: number, positionSize: number) => {
        return direction === "buy" ? (currentPrice - slPrice) / currentPrice * positionSize :
            (slPrice - currentPrice) / currentPrice * positionSize;
    }

    const pnlPercentage = (direction: string, currentPrice: number, exitPrice: number) => {
        return ((direction === "buy" ? exitPrice - currentPrice : currentPrice - exitPrice) / currentPrice * 100).toFixed(5);
    }

    const pnlAmount = (direction: string, currentPrice: number, exitPrice: number, positionSize: number | undefined) => {
        if (!positionSize) return 0;
        return direction === "buy" ? (exitPrice - currentPrice) / currentPrice * positionSize :
            (currentPrice - exitPrice) / currentPrice * positionSize;
    }


    const [totalTrade, setTotalTrade] = useState(0);

    useEffect(() => {
        countTradeHistory().then((count) => setTotalTrade(count));
    }, []);
    return (
        <Card className="h-full max-h-[500px] overflow-y-auto">
            <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">Trade History</div>
                    <div className="text-right">Total Trade: {totalTrade}</div>
                </div>
                {history.length === 0 ? (
                    <div className="border border-gray-300 rounded-lg p-3 shadow-sm space-y-1">No trade history yet.</div>
                ) : (
                    history.map((entry, idx) => (
                        <div key={idx} className={`border rounded-lg p-3 shadow-sm space-y-1 ${getCardColor(entry.execution.status)}`}>
                            <div className="bg-gray-50 p-2 rounded">
                                <div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <div className="font-medium">Plan</div>
                                        <div className="text-sm text-gray-700 text-right">
                                            Date: {tradeDate(entry.plan.startTimeStamp)}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-700">
                                    Symbol: {entry.plan.symbol}<br />
                                    Total Assets: {entry.plan.totalAssets}<br />
                                    Position Size: {entry.plan.positionSize}<br />
                                    Current Price: {entry.plan.currentPrice}<br />
                                    Direction: {entry.plan.direction}<br />
                                    Stop Loss: {entry.plan.slPrice} / Max Loss: {maxLoss(entry.plan.direction, entry.plan.currentPrice, entry.plan.slPrice, entry.plan.positionSize)} <br />
                                    Take Profit: {entry.plan.tpPrice} / Target Profit: {targetProfit(entry.plan.direction, entry.plan.currentPrice, entry.plan.tpPrice, entry.plan.positionSize)} <br />
                                    Win Ratio: {entry.plan.winRatio}<br />

                                </div>
                            </div>

                            <div className="bg-gray-100 p-2 rounded" onClick={() => setEditingIndex(idx)}>
                                <div className="font-medium">Execution</div>
                                <div className="text-sm text-gray-700">
                                    Symbol: {entry.execution.symbol}<br />
                                    Position Size: {entry.execution.positionSize}<br />
                                    Direction: {entry.execution.direction}<br />
                                    Enter Price: {entry.execution.enterPrice}<br />
                                    Exit Price: {entry.execution.exitPrice}<br />
                                    PnL: {pnlPercentage(entry.execution.direction, entry.plan.currentPrice, entry.execution.exitPrice)} %
                                    / Pnl Amount: {pnlAmount(entry.execution.direction, entry.plan.currentPrice, entry.execution.exitPrice, entry.execution.positionSize)}<br />
                                    Execution Start Time: {entry.execution.startTimeStamp}<br />
                                    Execution End Time: {entry.execution.endTimeStamp}<br />
                                    Remark: {entry.review}
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-200">
                                <div className="font-medium mb-1">Review</div>
                                <div className="prose text-sm text-gray-800">
                                    <ReactMarkdown>{entry.review}</ReactMarkdown>
                                </div>
                            </div>

                        </div>
                    ))
                )}
                {editingIndex !== null && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
                            <h2 className="text-lg font-semibold">Edit Execution</h2>
                            <input
                                type="number"
                                value={editableHistory[editingIndex]?.execution.positionSize}
                                onChange={(e) => handleInputChange("positionSize", e.target.value)}
                                placeholder="Position Size"
                                className="w-full border rounded p-2"
                            />
                            <input
                                type="number"
                                value={editableHistory[editingIndex]?.execution.enterPrice}
                                onChange={(e) => handleInputChange("enterPrice", e.target.value)}
                                placeholder="Enter Price"
                                className="w-full border rounded p-2"
                            />
                            <input
                                type="number"
                                value={editableHistory[editingIndex]?.execution.exitPrice}
                                onChange={(e) => handleInputChange("exitPrice", e.target.value)}
                                placeholder="Exit Price"
                                className="w-full border rounded p-2"
                            />
                            <input
                                type="number"
                                value={editableHistory[editingIndex]?.execution.pnl}
                                onChange={(e) => handleInputChange("pnl", e.target.value)}
                                placeholder="PnL"
                                className="w-full border rounded p-2"
                            />
                            <input
                                type="text"
                                value={editableHistory[editingIndex]?.execution.status}
                                onChange={(e) => handleInputChange("status", e.target.value)}
                                placeholder="Status"
                                className="w-full border rounded p-2"
                            />
                            <div className="flex justify-end space-x-2">
                                <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button onClick={closeModal} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
