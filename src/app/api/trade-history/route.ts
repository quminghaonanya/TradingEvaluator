import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongoose";
import { TradeHistoryModel } from "@/schema/TradingHistoryModel"

// GET: fetch all trade history
export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);

        const action = searchParams.get('action');
        const id = searchParams.get('id');
        const status = searchParams.get('status');
        const tradeId = searchParams.get('tradeId');

        // Handle COUNT query
        if (action === 'count') {
            const count = await TradeHistoryModel.countDocuments().distinct('tradeId');
            console.log("countDistinctTradeId: " + count.length);
            return NextResponse.json({ count: count.length });
        }

        // Handle fetch by ID
        if (id) {
            const trade = await TradeHistoryModel.findById(id);
            if (!trade) {
                return NextResponse.json({ message: 'Trade history not found' }, { status: 404 });
            }
            return NextResponse.json(trade);
        }

        // Handle query by status
        if (status) {
            const trades = await TradeHistoryModel.find({ 'execution.status': status }).sort({ 'createdAt': -1 });
            return NextResponse.json(trades);
        }

        // Handle query by tradeId
        if (tradeId) {
            const trades = await TradeHistoryModel.find({ 'tradeId': tradeId }).sort({ 'createdAt': -1 });
            return NextResponse.json(trades);
        }

        if (action === 'getNextId') {
            const tradeIds: number[] = await TradeHistoryModel.countDocuments().distinct('tradeId');
            const maxId = Math.max(...tradeIds);
            console.log("nextid: " + maxId);
            return NextResponse.json({ nextId: maxId + 1 });
        }

        // Add more specific queries based on searchParams here as needed
        // Example: query by symbol
        // const symbol = searchParams.get('symbol');
        // if (symbol) {
        //     const trades = await TradeHistoryModel.find({ 'plan.symbol': symbol }).sort({ 'plan.startTimeStamp': -1 });
        //     return NextResponse.json(trades);
        // }

        // Default action: Get all trade histories, sorted by plan start time
        const trades = await TradeHistoryModel.find({}).sort({ 'createdAt': -1 });
        return NextResponse.json(trades);
    } catch (error) {
        console.error("Error in GET /api/trade-history:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: "Error fetching trade history", error: errorMessage }, { status: 500 });
    }
}


// POST: add new trade history
export async function POST(req: Request) {
    await connectToDatabase();
    const body = await req.json();
    const newTrade = await TradeHistoryModel.create(body);
    return NextResponse.json(newTrade);
}

export async function DELETE(req: Request) {
    await connectToDatabase();
    const body = await req.json();
    const deletedTrade = await TradeHistoryModel.deleteOne({ _id: body._id });
    return NextResponse.json(deletedTrade);
}

export async function PUT(req: Request) {
    await connectToDatabase();
    const body = await req.json();
    const updatedTrade = await TradeHistoryModel.updateOne({ _id: body._id }, body);
    return NextResponse.json(updatedTrade);
}

export async function COUNT() {
    await connectToDatabase();
    const count = await TradeHistoryModel.countDocuments();
    return NextResponse.json(count);
}