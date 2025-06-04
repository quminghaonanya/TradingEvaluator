import TradeEvaluator from "@/components/ui/TradingEvaluator";
import { connectToDatabase } from "@/lib/mongoose";


export default async function Home() {
  await connectToDatabase(); // ensure connection before querying

  // Import model after connecting
  return (
    <main className="p-4">
      <TradeEvaluator />
    </main>
  );
}

