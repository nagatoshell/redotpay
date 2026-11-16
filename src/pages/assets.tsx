
import { useEffect, useMemo, useState } from "react";
import StickyBottomNav from "../components/stickyNavv";
import {
  FaArrowDown,
  FaArrowUp,
  FaChartPie,
  FaSearch,
  FaSyncAlt,
  FaWallet,
} from "react-icons/fa";
import {
  SiBitcoin,
  SiEthereum,
  SiSolana,
  SiTether,
  SiXrp,
} from "react-icons/si";

type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
};

const assetConfig = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    allocation: 40,
    icon: <SiBitcoin />,
    color: "#f7931a",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    allocation: 25,
    icon: <SiEthereum />,
    color: "#627eea",
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "USDT",
    allocation: 20,
    icon: <SiTether />,
    color: "#26a17b",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    allocation: 10,
    icon: <SiSolana />,
    color: "#9945ff",
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "XRP",
    allocation: 5,
    icon: <SiXrp />,
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

const Assets = () => {
  const [userAmount, setUserAmount] = useState(0);
  const [market, setMarket] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("value");
  const [selected, setSelected] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get the logged-in user's balance
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

  // Fetch live crypto prices in EUR
  const fetchMarket = async () => {
    try {
      setError("");

      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin,ethereum,tether,solana,ripple&order=market_cap_desc&per_page=5&page=1&sparkline=false"
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve market prices.");
      }

      const data: MarketCoin[] = await response.json();

      setMarket(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Market prices could not be refreshed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();

    const interval = window.setInterval(fetchMarket, 60000);

    return () => window.clearInterval(interval);
  }, []);

  // Calculate each asset's share from the user's balance
  const assets = useMemo(() => {
    return assetConfig.map((asset) => {
      const live = market.find((coin) => coin.id === asset.id);

      const allocatedValue =
        userAmount * (asset.allocation / 100);

      return {
        ...asset,
        price: live?.current_price ?? 0,
        change: live?.price_change_percentage_24h ?? 0,
        marketCap: live?.market_cap ?? 0,
        allocatedValue,
        image: live?.image ?? "",
      };
    });
  }, [market, userAmount]);

  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) =>
        `${asset.name} ${asset.symbol}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sort === "change") {
          return b.change - a.change;
        }

        return b.allocatedValue - a.allocatedValue;
      });
  }, [assets, search, sort]);

  const selectedAsset = assets.find((asset) => asset.id === selected);

  const totalAllocated = assets.reduce(
    (sum, asset) => sum + asset.allocatedValue,
    0
  );

  const positiveAssets = assets.filter(
    (asset) => asset.change > 0
  ).length;

  const negativeAssets = assets.filter(
    (asset) => asset.change < 0
  ).length;

  const weightedMarketChange = assets.reduce(
    (sum, asset) =>
      sum + asset.change * (asset.allocation / 100),
    0
  );

  const donutGradient = `conic-gradient(
    ${assetConfig
      .map((asset, index) => {
        const previous = assetConfig
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
              Portfolio management
            </p>

            <h1 className="text-3xl sm:text-4xl font-black mt-1">
              My Assets<span className="text-red-600">.</span>
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Manage and monitor your account portfolio.
            </p>
          </div>

          <button
            onClick={fetchMarket}
            className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center hover:bg-red-600 transition"
            aria-label="Refresh prices"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MAIN BALANCE */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

          <div className="lg:col-span-2 bg-[#111] text-white rounded-[28px] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -right-12 -top-16 w-64 h-64 border border-white/10 rounded-full" />
            <div className="absolute -right-4 -top-8 w-48 h-48 border border-red-500/20 rounded-full" />

            <div className="relative">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <FaWallet className="text-red-500" />
                Your account balance
              </div>

              <h2 className="text-4xl sm:text-5xl font-black mt-5">
                {formatEUR(userAmount)}
              </h2>

              <p className="text-xs text-gray-400 mt-3">
                Retrieved from your logged-in account
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-xs text-gray-400">Total assets</p>
                  <p className="text-xl font-bold mt-1">
                    {assets.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-xs text-gray-400">Allocated</p>
                  <p className="text-xl font-bold mt-1">
                    {formatEUR(totalAllocated)}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4 col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-400">Unallocated</p>
                  <p className="text-xl font-bold mt-1">
                    {formatEUR(userAmount - totalAllocated)}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ALLOCATION */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FaChartPie className="text-red-600" />
              Asset allocation
            </div>

            <div className="flex justify-center my-7">
              <div
                className="w-40 h-40 rounded-full flex items-center justify-center"
                style={{ background: donutGradient }}
              >
                <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-400">Portfolio</span>
                  <strong className="text-xl">
                    {formatEUR(userAmount)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="font-medium">{asset.symbol}</span>
                  </div>

                  <span className="text-gray-500">
                    {asset.allocation}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MARKET SUMMARY */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Weighted market movement</p>

            <div className={`text-2xl font-black mt-3 flex items-center gap-2 ${
              weightedMarketChange >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {weightedMarketChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {weightedMarketChange > 0 ? "+" : ""}
              {weightedMarketChange.toFixed(2)}%
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Weighted by your asset allocation
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Assets moving up</p>

            <h3 className="text-2xl font-black text-green-600 mt-3">
              {positiveAssets}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Positive 24-hour movement
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Assets moving down</p>

            <h3 className="text-2xl font-black text-red-600 mt-3">
              {negativeAssets}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Negative 24-hour movement
            </p>
          </div>

        </section>

        {/* HOLDINGS TABLE */}
        <section className="bg-white rounded-[25px] p-5 sm:p-7 shadow-sm mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">Your portfolio assets</h2>
              <p className="text-xs text-gray-400 mt-1">
                Allocation calculated from your account balance
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="relative">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-sm" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full sm:w-48 bg-gray-100 rounded-xl py-3 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-gray-100 rounded-xl py-3 px-3 text-sm outline-none"
              >
                <option value="value">Highest allocation</option>
                <option value="change">Market movement</option>
                <option value="name">Asset name</option>
              </select>

            </div>
          </div>

          <div className="hidden md:grid grid-cols-5 gap-3 px-4 pb-3 text-xs text-gray-400 uppercase tracking-wider">
            <span className="col-span-2">Asset</span>
            <span>Market price</span>
            <span>24h change</span>
            <span className="text-right">Allocated value</span>
          </div>

          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelected(asset.id)}
                className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 items-center text-left p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full text-white flex items-center justify-center text-xl"
                    style={{ backgroundColor: asset.color }}
                  >
                    {asset.icon}
                  </div>

                  <div>
                    <p className="font-bold">{asset.name}</p>
                    <p className="text-xs text-gray-400">{asset.symbol}</p>
                    <p className="text-xs text-gray-400 mt-1 md:hidden">
                      {asset.allocation}% allocation
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 md:hidden">Market price</p>
                  <p className="font-semibold text-sm">
                    {asset.price > 0 ? formatEUR(asset.price) : "--"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 md:hidden">24h change</p>

                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    asset.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {asset.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(asset.change).toFixed(2)}%
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400 md:hidden">Allocated value</p>
                  <p className="font-bold">
                    {formatEUR(asset.allocatedValue)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {asset.allocation}% of balance
                  </p>
                </div>
              </button>
            ))}

            {filteredAssets.length === 0 && (
              <p className="text-center py-10 text-sm text-gray-400">
                No assets found.
              </p>
            )}
          </div>
        </section>

        {/* ALLOCATION BREAKDOWN */}
        <section className="bg-white rounded-[25px] p-5 sm:p-7 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-2">
            Allocation breakdown
          </h2>

          <p className="text-xs text-gray-400 mb-6">
            How your current account balance is distributed in this portfolio model.
          </p>

          <div className="space-y-5">
            {assets.map((asset) => (
              <div key={asset.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">{asset.name}</span>
                  <span className="font-bold text-sm">
                    {formatEUR(asset.allocatedValue)}
                  </span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${asset.allocation}%`,
                      backgroundColor: asset.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 pb-6">
          {lastUpdated
            ? `Market prices updated ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for market prices..."}
          {" · "}Allocation percentages are illustrative, not verified wallet holdings.
        </p>

      </main>

      {/* ASSET DETAILS MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[28px] p-6 relative">

            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-4 text-2xl text-gray-400"
            >
              ×
            </button>

            <div
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center text-2xl mb-5"
              style={{ backgroundColor: selectedAsset.color }}
            >
              {selectedAsset.icon}
            </div>

            <h2 className="text-2xl font-black">
              {selectedAsset.name}
            </h2>

            <p className="text-sm text-gray-400">
              {selectedAsset.symbol} asset overview
            </p>

            <div className="mt-7 space-y-5">

              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Account balance</span>
                <strong>{formatEUR(userAmount)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Allocation</span>
                <strong>{selectedAsset.allocation}%</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Market price</span>
                <strong>
                  {selectedAsset.price > 0
                    ? formatEUR(selectedAsset.price)
                    : "--"}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">24h movement</span>
                <strong className={
                  selectedAsset.change >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }>
                  {selectedAsset.change >= 0 ? "+" : ""}
                  {selectedAsset.change.toFixed(2)}%
                </strong>
              </div>

              <div className="flex justify-between border-t pt-5">
                <span className="text-gray-500 text-sm">Allocated value</span>
                <strong className="text-xl">
                  {formatEUR(selectedAsset.allocatedValue)}
                </strong>
              </div>
            </div>

            <p className="bg-gray-100 rounded-xl p-3 text-xs text-gray-500 mt-6">
              This value represents an illustrative allocation of your account balance. It is not a verified cryptocurrency holding.
            </p>

            <button
              onClick={() => setSelected(null)}
              className="w-full bg-red-600 text-white rounded-xl py-3 mt-5 font-bold"
            >
              Close details
            </button>

          </div>
        </div>
      )}

      <StickyBottomNav />
    </div>
  );
};

export default Assets;
