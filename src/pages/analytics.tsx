
import { useEffect, useMemo, useState } from "react";
import StickyBottomNav from "../components/stickyNavv";
import {
  FaArrowDown,
  FaArrowUp,
  FaChartLine,
  FaCoins,
  FaGlobe,
  FaSyncAlt,
  FaWallet,
} from "react-icons/fa";

type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
};

const portfolio = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    allocation: 40,
    color: "#f7931a",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    allocation: 25,
    color: "#627eea",
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "USDT",
    allocation: 20,
    color: "#26a17b",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    allocation: 10,
    color: "#9945ff",
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "XRP",
    allocation: 5,
    color: "#23292f",
  },
];

const formatEUR = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);



const Analytics = () => {
  const [userAmount, setUserAmount] = useState(0);
  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Read the same logged-in user balance as the Dashboard
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedInUser");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        const balance = Number(
          String(user.amount ?? 0).replace(/[^\d.-]/g, "")
        );

        setUserAmount(Number.isFinite(balance) ? balance : 0);
      }
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
    }
  }, []);

  // Get live cryptocurrency prices in EUR
  const fetchMarket = async () => {
    try {
      setError("");

      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin,ethereum,tether,solana,ripple&order=market_cap_desc&per_page=5&page=1&sparkline=false"
      );

      if (!response.ok) {
        throw new Error("Unable to load market data.");
      }

      const data: MarketCoin[] = await response.json();

      setMarket(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Market data could not be refreshed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();

    const interval = window.setInterval(fetchMarket, 60000);

    return () => window.clearInterval(interval);
  }, []);

  // Apply allocation percentages to the logged-in balance
  const assets = useMemo(() => {
    return portfolio.map((item) => {
      const live = market.find((coin) => coin.id === item.id);

      const allocatedValue =
        userAmount * (item.allocation / 100);

      return {
        ...item,
        price: live?.current_price ?? 0,
        change: live?.price_change_percentage_24h ?? 0,
        marketCap: live?.market_cap ?? 0,
        allocatedValue,
      };
    });
  }, [market, userAmount]);

  const totalAllocated = assets.reduce(
    (sum, asset) => sum + asset.allocatedValue,
    0
  );

  const weightedChange = assets.reduce(
    (sum, asset) =>
      sum + asset.change * (asset.allocation / 100),
    0
  );

  const positiveAssets = assets.filter(
    (asset) => asset.change > 0
  ).length;

  const negativeAssets = assets.filter(
    (asset) => asset.change < 0
  ).length;

  const biggestAsset = [...assets].sort(
    (a, b) => b.allocatedValue - a.allocatedValue
  )[0];

  const bestPerformer = [...assets].sort(
    (a, b) => b.change - a.change
  )[0];

  const worstPerformer = [...assets].sort(
    (a, b) => a.change - b.change
  )[0];

  const donutGradient = `conic-gradient(
    ${portfolio
      .map((asset, index) => {
        const previous = portfolio
          .slice(0, index)
          .reduce((sum, item) => sum + item.allocation, 0);

        return `${asset.color} ${previous}% ${previous + asset.allocation}%`;
      })
      .join(",")}
  )`;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-black pb-32">
      <main className="max-w-6xl mx-auto px-4 sm:px-7 pt-7">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-[2px]">
              Portfolio intelligence
            </p>

            <h1 className="text-3xl sm:text-4xl font-black mt-1">
              Analytics<span className="text-red-600">.</span>
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Account overview, market insights and allocation.
            </p>
          </div>

          <button
            onClick={fetchMarket}
            className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition"
            aria-label="Refresh analytics"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-5 text-sm">
            {error}
          </div>
        )}

        {/* TOP STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          <div className="bg-[#111] text-white rounded-2xl p-5">
            <div className="flex justify-between items-center text-gray-400 text-sm">
              <span>Account balance</span>
              <FaWallet className="text-red-500" />
            </div>

            <h2 className="text-2xl font-black mt-5">
              {formatEUR(userAmount)}
            </h2>

          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <span>Weighted market movement</span>
              <FaChartLine className="text-red-600" />
            </div>

            <h2 className={`text-2xl font-black mt-5 ${
              weightedChange >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {weightedChange > 0 ? "+" : ""}
              {weightedChange.toFixed(2)}%
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Weighted 24-hour price movement
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <span>Tracked assets</span>
              <FaCoins className="text-red-600" />
            </div>

            <h2 className="text-2xl font-black mt-5">
              {portfolio.length}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Assets in portfolio model
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <span>Market coverage</span>
              <FaGlobe className="text-red-600" />
            </div>

            <h2 className="text-2xl font-black mt-5">
              {market.length}/{portfolio.length}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Live market prices received
            </p>
          </div>

        </section>

        {/* PORTFOLIO VALUE */}
        <section className="bg-[#111] text-white rounded-[28px] p-6 sm:p-8 mb-6 relative overflow-hidden">

          <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full border border-white/10" />

          <div className="relative">
            <p className="text-sm text-gray-400">
              Your total portfolio value
            </p>

            <h2 className="text-4xl sm:text-5xl font-black mt-3">
              {formatEUR(userAmount)}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">

              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-xs text-gray-400">Allocated</p>
                <p className="text-lg font-bold mt-2">
                  {formatEUR(totalAllocated)}
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-xs text-gray-400">Unallocated</p>
                <p className="text-lg font-bold mt-2">
                  {formatEUR(userAmount - totalAllocated)}
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-xl col-span-2 sm:col-span-1">
                <p className="text-xs text-gray-400">Largest allocation</p>
                <p className="text-lg font-bold mt-2">
                  {biggestAsset?.symbol ?? "--"}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* MARKET INSIGHTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <div className="bg-white rounded-[25px] p-5 sm:p-7 shadow-sm">
            <h2 className="text-xl font-bold">Market performance</h2>

            <p className="text-xs text-gray-400 mt-1">
              Current market movements weighted by your allocation
            </p>

            <div className="flex items-center gap-3 mt-7">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${
                weightedChange >= 0
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}>
                {weightedChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Weighted 24-hour movement
                </p>

                <h3 className={`text-3xl font-black ${
                  weightedChange >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {weightedChange > 0 ? "+" : ""}
                  {weightedChange.toFixed(2)}%
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Moving up</p>
                <p className="text-2xl font-black text-green-600 mt-2">
                  {positiveAssets}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Moving down</p>
                <p className="text-2xl font-black text-red-600 mt-2">
                  {negativeAssets}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[25px] p-5 sm:p-7 shadow-sm">
            <h2 className="text-xl font-bold">Market insights</h2>
            <p className="text-xs text-gray-400 mt-1">
              Based on the latest available market prices
            </p>

            <div className="space-y-5 mt-7">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Best 24h performer</p>
                  <p className="font-bold mt-1">
                    {bestPerformer?.name ?? "--"}
                  </p>
                </div>

                <span className={`font-bold ${
                  (bestPerformer?.change ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  {bestPerformer?.change > 0 ? "+" : ""}
                  {bestPerformer?.change.toFixed(2) ?? "--"}%
                </span>
              </div>

              <div className="border-t border-gray-100" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Lowest 24h performer</p>
                  <p className="font-bold mt-1">
                    {worstPerformer?.name ?? "--"}
                  </p>
                </div>

                <span className={`font-bold ${
                  (worstPerformer?.change ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  {worstPerformer?.change > 0 ? "+" : ""}
                  {worstPerformer?.change.toFixed(2) ?? "--"}%
                </span>
              </div>

              <div className="border-t border-gray-100" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Largest allocation</p>
                  <p className="font-bold mt-1">
                    {biggestAsset?.name ?? "--"}
                  </p>
                </div>

                <strong>{biggestAsset?.allocation ?? 0}%</strong>
              </div>

            </div>
          </div>

        </section>

        {/* ALLOCATION CHART */}
        <section className="bg-white rounded-[25px] p-5 sm:p-7 shadow-sm mb-6">

          <div>
            <h2 className="text-xl font-bold">Portfolio allocation</h2>
            <p className="text-xs text-gray-400 mt-1">
              Distribution of your account balance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-7">

            <div className="flex justify-center">
              <div
                className="w-56 h-56 rounded-full flex items-center justify-center"
                style={{ background: donutGradient }}
              >
                <div className="w-40 h-40 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-400">
                    Total balance
                  </span>

                  <strong className="text-xl">
                    {formatEUR(userAmount)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {assets.map((asset) => (
                <div key={asset.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span className="font-semibold text-sm">
                        {asset.name}
                      </span>
                    </div>

                    <span className="font-bold text-sm">
                      {asset.allocation}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Portfolio allocation</span>
                    <span>{formatEUR(asset.allocatedValue)}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ASSET MARKET TABLE */}
        <section className="bg-white rounded-[25px] p-5 sm:p-7 shadow-sm mb-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold">Asset market overview</h2>
            <p className="text-xs text-gray-400 mt-1">
              Live market information for your tracked assets
            </p>
          </div>

          <div className="space-y-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: asset.color }}
                  >
                    {asset.symbol.slice(0, 1)}
                  </div>

                  <div>
                    <p className="font-bold">{asset.name}</p>
                    <p className="text-xs text-gray-400">{asset.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {asset.price > 0 ? formatEUR(asset.price) : "--"}
                  </p>

                  <p className={`text-xs font-bold mt-1 ${
                    asset.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {asset.change > 0 ? "+" : ""}
                    {asset.change.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACCOUNT SUMMARY */}
        <section className="bg-[#111] text-white rounded-[25px] p-6 sm:p-7 mb-6">

          <h2 className="text-xl font-bold">
            Account summary
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            Your account balance and portfolio distribution
          </p>

          <div className="space-y-5 mt-7">

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Account balance
              </span>
              <strong>{formatEUR(userAmount)}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Total allocated
              </span>
              <strong>{formatEUR(totalAllocated)}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Remaining allocation
              </span>
              <strong>{formatEUR(userAmount - totalAllocated)}</strong>
            </div>

            <div className="border-t border-white/10 pt-5 flex justify-between items-center">
              <span className="font-bold">Total account value</span>
              <strong className="text-2xl">
                {formatEUR(userAmount)}
              </strong>
            </div>

          </div>
        </section>

        <p className="text-center text-xs text-gray-400 pb-6">
          {lastUpdated
            ? `Market data last refreshed at ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for market data..."}
          {" · "}Historical profit and loss are not calculated because transaction history has not been connected.
        </p>

      </main>

      <StickyBottomNav />
    </div>
  );
};

export default Analytics;
