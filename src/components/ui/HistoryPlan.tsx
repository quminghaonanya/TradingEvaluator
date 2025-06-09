import { Plan } from "@/app/dto/TradingHistoryDTO";
import { tradeDate } from "./utils";




export function historyPlan(plan: Plan) {
    const targetProfit = (direction: string, currentPrice: number, tpPrice: number, positionSize: number) => {
        return direction === "buy" ? (tpPrice - currentPrice) / currentPrice * positionSize :
            (currentPrice - tpPrice) / currentPrice * positionSize;
    }
    const maxLoss = (direction: string, currentPrice: number, slPrice: number, positionSize: number) => {
        return direction === "buy" ? (currentPrice - slPrice) / currentPrice * positionSize :
            (slPrice - currentPrice) / currentPrice * positionSize;
    }
    return (
        <div className="bg-gray-100 p-2 rounded">
            <div>
                <div className="flex items-center justify-between space-x-2">
                    <div className="font-medium">Plan</div>
                    <div className="text-sm text-gray-700 text-right">
                        Date: {tradeDate(plan.startTimeStamp)}
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-700">
                Position Size: {plan.positionSize}<br />
                Current Price: {plan.currentPrice}<br />
                Direction: {plan.direction}<br />
                Stop Loss: {plan.slPrice} / Max Loss: {maxLoss(plan.direction, plan.currentPrice, plan.slPrice, plan.positionSize)} <br />
                Take Profit: {plan.tpPrice} / Target Profit: {targetProfit(plan.direction, plan.currentPrice, plan.tpPrice, plan.positionSize)} <br />
                Win Ratio: {plan.winRatio}<br />

            </div>
        </div>
    )
}
