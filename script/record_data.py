import pandas as pd
from pymongo import MongoClient
from datetime import datetime

# Connect to local MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["trading-evaluate"]
collection = db["trade-history"]

# Load CSV file
csv_path = "resources/Bybit-UM-Perp-ClosedPNL-1748548800-1749239999.csv"  # Replace with your actual CSV file path
df = pd.read_csv(csv_path)


# Define a helper function to parse time string
def parse_time(ts_str):
    try:
        return datetime.strptime(ts_str.strip(), "%H:%M %Y-%m-%d")
    except Exception as e:
        print(f"Failed to parse timestamp: {ts_str} -> {e}")
        return None


# Iterate through each row in reverse order and insert into MongoDB
for index in range(len(df) - 1, -1, -1):
    row = df.iloc[index]
    symbol = row["Contracts"].strip()
    direction = row["Trade Type"].strip().lower()  # "SELL" -> "short"
    position_size = float(row["Qty"]) * float(row["Entry Price"])
    enter_price = float(row["Entry Price"])
    exit_price = float(row["Filled Price"])
    pnl = float(row["Realized P&L"])

    direction = "short" if direction == "sell" else "long"
    filled_time = parse_time(row["Filled/Settlement Time(UTC+0)"])
    startTimeStamp = parse_time(row["Create Time"])
    document = {
        "createdAt": datetime.utcnow(),
        "plan": {},  # leave it empty
        "execution": {
            "symbol": symbol,
            "positionSize": position_size,
            "direction": direction,
            "enterPrice": enter_price,
            "exitPrice": exit_price,
            "pnl": pnl,
            "startTimeStamp": startTimeStamp,
            "endTimeStamp": filled_time,
        },
    }

    collection.insert_one(document)
    print(f"Inserted record {len(df) - index} of {len(df)}")

print("✅ All records inserted into MongoDB.")
