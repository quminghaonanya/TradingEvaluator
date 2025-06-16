import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TradeHistoryModel } from "@/app/dto/TradingHistoryDTO";
import ReactMarkdown from "react-markdown";
import { countTradeHistory, createTradeHistory, updateTradeHistory } from "../client/DbClient";
import { historyPlan } from "./HistoryPlan";
import { TEMPLATE } from "../constants";

interface TradingHistoryProps {
    history: TradeHistoryModel[];
    tradeIdChange: (id: number | undefined) => void;
    reloadHistory: () => void;
}

export const TradingHistory: React.FC<TradingHistoryProps> = ({ history, tradeIdChange, reloadHistory }) => {
    const [editableHistory, setEditableHistory] = useState(history);
    const [tradeIdSelected, setTradeIdSelected] = useState<boolean>(false);
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

    const pnlPercentage = (direction: string, currentPrice: number, exitPrice: number) => {
        return ((direction === "buy" ? exitPrice - currentPrice : currentPrice - exitPrice) / currentPrice * 100).toFixed(5);
    }

    const pnlAmount = (direction: string, currentPrice: number, exitPrice: number, positionSize: number | undefined) => {
        if (!positionSize) return 0;
        return direction === "buy" ? (exitPrice - currentPrice) / currentPrice * positionSize :
            (currentPrice - exitPrice) / currentPrice * positionSize;
    }

    const [reviewingIndex, setReviewingIndex] = useState<number | null>(null);
    const [reviewText, setReviewText] = useState("");

    const loadReviewTemplate = () => {
        return TEMPLATE;
    };

    const handleReviewClick = (idx: number) => {
        setReviewingIndex(idx);
        const existingReview = editableHistory[idx]?.review;
        if (existingReview) {
            setReviewText(existingReview);
        } else {
            const template = loadReviewTemplate();
            setReviewText(template);
        }
    };

    const handleReviewSave = async () => {
        if (reviewingIndex == null || reviewingIndex == undefined) return;
        const updated = [...editableHistory];
        console.log(JSON.stringify(editableHistory));
        updated[reviewingIndex].review = reviewText;
        await updateTradeHistory(updated[reviewingIndex]);
        setEditableHistory(updated);
        setReviewingIndex(null);
    };

    const getSymbol = (entry: TradeHistoryModel) => {
        return entry.symbol || "";
    }

    const [totalTrade, setTotalTrade] = useState(0);

    useEffect(() => {
        countTradeHistory().then((count) => setTotalTrade(count));
    }, []);

    useEffect(() => {
        setEditableHistory(history);
    }, [history]);

    const handleAddExecution = async (idx: number) => {
        await createTradeHistory({
            symbol: editableHistory[idx].symbol,
            plan: undefined,
            totalAssets: editableHistory[idx].totalAssets,
            execution: editableHistory[idx].execution,
            review: editableHistory[idx].review,
            tradeId: editableHistory[idx].tradeId
        });
        tradeIdChange(undefined);
        reloadHistory();
    };

    const handleTradeIdClick = (entry: TradeHistoryModel) => {
        if (!tradeIdSelected) {
            tradeIdChange(entry.tradeId);
        } else {
            tradeIdChange(undefined);
        }
        setTradeIdSelected(!tradeIdSelected);
    }

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
                            <div className="mb-5">
                                Symbol: {getSymbol(entry)} - {tradeDate(entry.execution.startTimeStamp)}
                                <div className="p-2 rounded inline-block float-right">
                                    <button
                                        className={`font-semibold px-2 py-1 rounded ${tradeIdSelected ? "bg-blue-100 text-black" : "bg-gray-500 text-white"}`}
                                        onClick={() => handleTradeIdClick(entry)}
                                    >
                                        Trade Id {entry.tradeId}
                                    </button>
                                </div>
                            </div>

                            {entry.plan?.startTimeStamp !== undefined && historyPlan(entry.plan)}

                            <div className="bg-gray-100 p-2 rounded" >
                                <div className="w-full flex items-center justify-between">
                                    <div className="font-medium">Execution</div>
                                    <button className="bg-gray-500 text-white px-2 py-1 rounded float-right" onClick={() => handleAddExecution(idx)}>Add</button>
                                </div>

                                <div className="text-sm text-gray-800" onClick={() => setEditingIndex(idx)}>
                                    Position Size: {entry.execution.positionSize}<br />
                                    Direction: {entry.execution.direction}<br />
                                    Enter Price: {entry.execution.enterPrice}<br />
                                    Exit Price: {entry.execution.exitPrice}<br />
                                    PnL: {pnlPercentage(entry.execution.direction, entry.execution.enterPrice, entry.execution.exitPrice)} %
                                    / Pnl Amount: {pnlAmount(entry.execution.direction, entry.execution.enterPrice, entry.execution.exitPrice, entry.execution.positionSize)}<br />
                                    Execution Start Time: {tradeDate(entry.execution.startTimeStamp)}<br />
                                    Execution End Time: {tradeDate(entry.execution.endTimeStamp)}<br />
                                    Remark: {entry.review}
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-200">
                                <div className="font-medium mb-1 flex justify-between items-center">
                                    <span>Review</span>
                                    <button
                                        onClick={() => handleReviewClick(idx)}
                                        className="text-blue-500 text- hover:underline"
                                    >
                                        {entry.review ? "Edit" : "Add Review"}
                                    </button>
                                </div>
                                <div className="prose prose-sm text-gray-800">
                                    {entry.review ? (
                                        <ReactMarkdown>{entry.review}</ReactMarkdown>
                                    ) : (
                                        <span className="text-gray-400 italic">Review your last trade</span>
                                    )}
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
                {reviewingIndex !== null && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto space-y-4">
                            <h2 className="text-xl font-semibold">Review Trade</h2>

                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="w-full h-64 border rounded p-2 font-mono"
                                placeholder="Write your review in markdown..."
                            />

                            <div className="text-md text-gray-700 border rounded p-4 bg-gray-50 overflow-auto h-[50vh]">
                                <div className="prose prose-base max-w-none">
                                    <ReactMarkdown>{reviewText}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setReviewingIndex(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button onClick={handleReviewSave} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                            </div>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}