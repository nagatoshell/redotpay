
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaPlus,
  FaWallet,
  FaEye,
  FaEyeSlash,
  // FaArrowUpRightFromSquare,
  FaArrowRight,
  FaChartLine,
  // FaSearch,
  FaSignOutAlt,
  FaSyncAlt,
  FaExchangeAlt,
} from "react-icons/fa";


import {
  FaArrowDown,
  FaArrowUp,
  FaHeadset,
  FaLock,
  FaShieldAlt,
  FaTimes,
  // FaWallet,
  FaExclamationTriangle,

} from "react-icons/fa";



import {
  SiBitcoin,
  SiTether,
  SiEthereum,
  SiSolana,
  SiXrp,
} from "react-icons/si";

import lol from "../assets/logo.png";
import person from "../assets/person_1.jpg";
import StickyBottomNav from "../components/stickyNavv";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

type CryptoAsset = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  high: number;
  low: number;
  change: number;
};

const Dashboard = () => {
  const navigate = useNavigate();

  // USER INFORMATION
  const [userAmount, setUserAmount] = useState<number>(0);
  const [userImage, setUserImage] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userLastName, setLastName] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [subType, setSubType] = useState<string>("");
  const [AcctNum, setAcctNumber] = useState<string>("");

  // DASHBOARD STATES
  const [isLoading, setIsLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // LIVE MARKET STATES
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);


  const [supportModal, setSupportModal] = useState<{
  open: boolean;
  action: "deposit" | "withdraw" | null;
}>({
  open: false,
  action: null,
});

const openSupportModal = (action: "deposit" | "withdraw") => {
  setSupportModal({
    open: true,
    action,
  });
};



  // LOAD USER DATA
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedInUser");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        setUserAmount(Number(user.amount) || 0);
        setUserImage(user.profilePicture || person);
        setUserName(user.firstName || "");
        setLastName(user.lastName || "");
        setAccountType(user.accountType || "");
        setSubType(user.accountSubType || "");
        setAcctNumber(user.accountNumber || "");
      }
    } catch (error) {
      console.error("Unable to load user information:", error);
    }
  }, []);

  // LOGOUT
  const handleLogout = () => {
    setIsLoading(true);

    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    }, 1000);
  };

  // FORMAT CURRENCY
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // FORMAT CRYPTO PRICES
  const formatCryptoPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: amount < 1 ? 6 : 2,
    }).format(amount);
  };

  // LIVE CRYPTO MARKET DATA
  useEffect(() => {
    let active = true;

    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,tether,ethereum,solana,ripple&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h"
        );

        if (!response.ok) {
          throw new Error(
            response.status === 429
              ? "Market API rate limit reached. Please wait before refreshing."
              : "Unable to retrieve current market prices."
          );
        }

        const data = await response.json();

        if (!active) return;

        const formattedData: CryptoAsset[] = data.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          price: coin.current_price,
          high: coin.high_24h,
          low: coin.low_24h,
          change: coin.price_change_percentage_24h ?? 0,
        }));

        setCryptoAssets(formattedData);
        setLastUpdated(new Date());
        setMarketError("");
      } catch (error) {
        if (active) {
          setMarketError(
            error instanceof Error
              ? error.message
              : "Market data unavailable."
          );
        }
      } finally {
        if (active) {
          setMarketLoading(false);
        }
      }
    };

    fetchMarketData();

    const interval = window.setInterval(fetchMarketData, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  // CRYPTO ICONS
  const cryptoIcons: Record<string, React.ReactNode> = {
    bitcoin: <SiBitcoin />,
    tether: <SiTether />,
    ethereum: <SiEthereum />,
    solana: <SiSolana />,
    ripple: <SiXrp />,
  };

  console.log(cryptoIcons)

  // INVESTMENT GOAL
  const investmentGoal = 50000;
  const goalProgress = Math.min(
    100,
    Math.max(0, (userAmount / investmentGoal) * 100)
  );

  // LOADING SCREEN
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <img
            src={lol}
            alt="Loading"
            className="w-40 h-32 object-contain mb-5"
          />

          <div className="w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-black pb-32">

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto">

        {/* TOP HEADER */}
        <header className="bg-white px-5 sm:px-8 py-5 border-b border-gray-100">

          <div className="flex justify-between items-center">

            {/* PROFILE */}
            <div className="flex items-center gap-3">

              <img
                src={userImage || person}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-red-100"
              />

              <div>
                <p className="text-xs text-gray-500">
                  Welcome back,
                </p>

                <h2 className="font-bold text-base sm:text-lg">
                  {userName} {userLastName}
                </h2>
              </div>

            </div>

            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-2">

              <button
                onClick={() => setShowViewModal(true)}
                className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                title="Account details"
              >
                <FaPlus />
              </button>

              <button
                className="relative w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                title="Notifications"
              >
                <FaBell />

                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600" />
              </button>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 ml-2 px-4 py-3 rounded-full bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}
        <main className="px-4 sm:px-8 py-6 space-y-7">

          {/* PAGE TITLE */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-widest">
                Your financial overview
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                Dashboard
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage your account and monitor cryptocurrency markets.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

              <span className="text-xs font-medium text-gray-600">
                Market overview
              </span>
            </div>

          </div>


          {/* BALANCE AND GOAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* TOTAL BALANCE */}
            <div className="lg:col-span-2 bg-[#111111] text-white rounded-[28px] p-6 sm:p-8 relative overflow-hidden shadow-lg">

              <div className="absolute -right-20 -bottom-36 w-96 h-96 border border-red-600/20 rounded-full" />

              <div className="absolute -right-10 -bottom-28 w-72 h-72 border border-red-600/20 rounded-full" />

              <div className="absolute -left-20 -top-20 w-52 h-52 bg-red-700 rounded-full blur-[90px] opacity-30" />

              <div className="relative z-10">

                <div className="flex justify-between items-center">

                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <FaWallet className="text-red-500 text-xl" />

                    Total Account Balance

                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="text-gray-400 hover:text-white"
                      title="Toggle balance visibility"
                    >
                      {balanceVisible ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>

                  <button
                    onClick={() => setShowViewModal(true)}
                    className="w-10 h-10 bg-white rounded-full text-black flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                  >
                    <FaArrowUpRightFromSquare />
                  </button>

                </div>

                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-7">
                  {balanceVisible ? formatMoney(userAmount) : "••••••••"}
                </h2>

                <div className="flex justify-between items-center mt-7">

                  <div>
                    <p className="text-xs text-gray-400">
                      Account type
                    </p>

                    <p className="font-semibold mt-1">
                      {accountType || "Account"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Account number
                    </p>

                    <p className="font-semibold mt-1">
                      {AcctNum ? `•••• ${AcctNum.slice(-4)}` : "Not available"}
                    </p>
                  </div>

                </div>

              </div>

            </div>

{/* DEPOSIT AND WITHDRAW BUTTONS */}
<div className="mb-6 grid grid-cols-2 gap-4">
  <button
    onClick={() => openSupportModal("deposit")}
    className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 font-semibold text-white transition hover:bg-green-700"
  >
    <FaArrowDown />
    Deposit
  </button>

  <button
    onClick={() => openSupportModal("withdraw")}
    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-4 font-semibold text-white transition hover:bg-red-700"
  >
    <FaArrowUp />
    Withdraw
  </button>
</div>

{/* SUPPORT REQUIRED MODAL */}
{supportModal.open && (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md"
    onClick={() =>
      setSupportModal({ open: false, action: null })
    }
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111] shadow-[0_25px_100px_rgba(0,0,0,0.8)] animate-[modalIn_0.3s_ease-out]"
    >

      {/* TOP ACCENT */}
      <div className="h-1 w-full bg-gradient-to-r from-red-700 via-red-500 to-orange-400" />

      {/* BACKGROUND EFFECT */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />

      {/* CLOSE BUTTON */}
      <button
        onClick={() =>
          setSupportModal({ open: false, action: null })
        }
        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
      >
        <FaTimes />
      </button>

      <div className="relative z-10 p-6 sm:p-8">

        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
            <div className="absolute inset-0 animate-ping rounded-3xl border border-red-500/20 opacity-20" />

            <FaExclamationTriangle className="text-3xl text-red-400" />

            <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#111] bg-yellow-500 text-xs text-black">
              <FaLock />
            </span>
          </div>
        </div>

        {/* HEADING */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            Support assistance required
          </div>

          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {supportModal.action === "deposit"
              ? "Deposit unavailable"
              : "Withdrawal unavailable"}
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
            {supportModal.action === "deposit"
              ? "Your deposit request cannot be completed through the dashboard at this time. Please contact our support team for assistance."
              : "Your withdrawal request cannot be completed through the dashboard at this time. Please contact our support team for assistance."}
          </p>
        </div>

        {/* ERROR NOTICE */}
        <div className="mt-7 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.06] p-4">
          <div className="flex items-start gap-3">
            <FaShieldAlt className="mt-1 shrink-0 text-yellow-400" />

            <div>
              <p className="text-sm font-semibold text-yellow-400">
                Action requires support
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Please contact the support team to confirm the available
                procedure for this request. No transaction has been
                initiated by this button.
              </p>
            </div>
          </div>
        </div>

        {/* SELECTED ACTION */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Selected action
            </p>

            <p className="mt-1 text-sm font-semibold capitalize text-white">
              {supportModal.action}
            </p>
          </div>

          <span className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
            Unavailable
          </span>
        </div>

        {/* SUPPORT BUTTON */}
        <button
          onClick={() => {
            setSupportModal({ open: false, action: null });
            window.dispatchEvent(
              new CustomEvent("open-support")
            );
          }}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.98]"
        >
          <FaHeadset className="text-lg" />
          Contact Customer Support
          <FaArrowRight className="text-xs" />
        </button>

        {/* FOOTER */}
        <button
          onClick={() =>
            setSupportModal({ open: false, action: null })
          }
          className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-medium text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
        >
          Close window
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-600">
          <FaLock />
          Secure account assistance
        </div>
      </div>
    </div>
  </div>
)}

            {/* INVESTMENT GOAL */}
            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between">

              <div>

                <div className="flex justify-between items-center">

                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
                    <FaChartLine />
                  </div>

                  <span className="text-xs text-gray-400">
                    Illustrative goal
                  </span>

                </div>

                <h3 className="font-bold text-lg mt-5">
                  Investment Goal
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Progress toward your target
                </p>

                <div className="flex justify-between items-center mt-7">

                  <span className="text-2xl font-bold text-red-600">
                    {goalProgress.toFixed(1)}%
                  </span>

                  <span className="text-xs text-gray-500">
                    Target: $50,000
                  </span>

                </div>

                <div className="w-full h-3 bg-gray-100 rounded-full mt-3 overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-700"
                    style={{ width: `${goalProgress}%` }}
                  />

                </div>

              </div>

              <p className="text-xs text-gray-500 mt-5">
                Current account balance: {formatMoney(userAmount)}
              </p>

            </div>

          </div>


          {/* QUICK ACTIONS */}
          <section>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {[
                {
                  name: "Account Details",
                  icon: <FaWallet />,
                  action: () => setShowViewModal(true),
                },
                {
                  name: "Transactions",
                  icon: <FaExchangeAlt />,
                  action: () => navigate("/history"),
                },
                {
                  name: "Market Prices",
                  icon: <FaChartLine />,
                  action: () => document.getElementById("market")?.scrollIntoView({ behavior: "smooth" }),
                },
                {
                  name: "Logout",
                  icon: <FaSignOutAlt />,
                  action: handleLogout,
                },
              ].map((item) => (

                <button
                  key={item.name}
                  onClick={item.action}
                  className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col items-start gap-4 hover:border-red-300 hover:shadow-md transition text-left"
                >

                  <span className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg">
                    {item.icon}
                  </span>

                  <span className="text-sm font-semibold">
                    {item.name}
                  </span>

                </button>

              ))}

            </div>

          </section>


          {/* CRYPTO MARKET */}
          <section id="market">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">

              <div>
                <p className="text-xs text-red-600 font-semibold uppercase tracking-widest">
                  Live cryptocurrency data
                </p>

                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  Crypto Market
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Bitcoin, Tether, Ethereum, Solana and XRP
                </p>
              </div>

              <div className="flex items-center gap-2">

                <span className="text-[10px] text-gray-400">
                  {lastUpdated
                    ? `Updated ${lastUpdated.toLocaleTimeString()}`
                    : "Connecting to market..."}
                </span>

                <button
                  onClick={() => {
                    setMarketLoading(true);
                    setMarketError("");
                    window.location.reload();
                  }}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-red-600"
                  title="Refresh market"
                >
                  <FaSyncAlt />
                </button>

              </div>

            </div>


            {/* MARKET ERROR */}
            {marketError && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 mb-4 text-sm">
                {marketError}
              </div>
            )}


            {/* MARKET LOADING */}
            {marketLoading && cryptoAssets.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-3xl p-6 animate-pulse border border-gray-100"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />

                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-gray-200 rounded" />
                        <div className="w-16 h-3 bg-gray-200 rounded" />
                      </div>
                    </div>

                    <div className="w-full h-4 bg-gray-200 rounded mt-8" />
                  </div>
                ))}

              </div>
            )}


            {/* CRYPTO CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {cryptoAssets.map((coin) => (

                <div
                  key={coin.id}
                  className={`rounded-[25px] p-5 sm:p-6 relative overflow-hidden ${
                    coin.id === "bitcoin"
                      ? "bg-gradient-to-br from-red-700 to-[#790000] text-white"
                      : "bg-white border border-gray-100 text-black shadow-sm"
                  }`}
                >

                  <div className="flex justify-between items-start">

                    <div className="flex gap-3 items-center">

                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-12 h-12 rounded-full object-contain bg-white p-1"
                      />

                      <div>

                        <h3 className="font-bold text-base">
                          {coin.name}
                        </h3>

                        <p className={`text-xs mt-1 ${
                          coin.id === "bitcoin"
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}>
                          {coin.symbol}
                        </p>

                      </div>

                    </div>

                    <span className={`text-xs font-bold px-3 py-2 rounded-full ${
                      coin.change >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {coin.change > 0 ? "+" : ""}
                      {coin.change.toFixed(2)}%
                    </span>

                  </div>


                  <div className="mt-6">

                    <p className={`text-xs ${
                      coin.id === "bitcoin"
                        ? "text-white/70"
                        : "text-gray-500"
                    }`}>
                      Current Market Price
                    </p>

                    <h3 className="text-2xl font-bold mt-1">
                      {formatCryptoPrice(coin.price)}
                    </h3>

                  </div>


                  <div className={`grid grid-cols-2 gap-4 mt-6 pt-4 border-t ${
                    coin.id === "bitcoin"
                      ? "border-white/20"
                      : "border-gray-100"
                  }`}>

                    <div>
                      <p className={`text-[11px] ${
                        coin.id === "bitcoin"
                          ? "text-white/60"
                          : "text-gray-400"
                      }`}>
                        24h High
                      </p>

                      <p className="font-semibold text-sm mt-1">
                        {formatCryptoPrice(coin.high)}
                      </p>
                    </div>

                    <div>
                      <p className={`text-[11px] ${
                        coin.id === "bitcoin"
                          ? "text-white/60"
                          : "text-gray-400"
                      }`}>
                        24h Low
                      </p>

                      <p className="font-semibold text-sm mt-1">
                        {formatCryptoPrice(coin.low)}
                      </p>
                    </div>

                  </div>

                </div>

              ))}

            </div>


            {/* MARKET FOOTNOTE */}
            <p className="text-[10px] text-gray-400 mt-4 text-center">
              Market prices supplied by CoinGecko. Automatically refreshes every 60 seconds.
              Market quotes do not represent verified account holdings.
            </p>

          </section>


          {/* ACCOUNT INFORMATION */}
          <section className="bg-white border border-gray-100 rounded-[25px] p-5 sm:p-6">

            <div className="flex justify-between items-center">

              <div>
                <h2 className="font-bold text-lg">
                  Account Information
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Your registered account details
                </p>
              </div>

              <button
                onClick={() => setShowViewModal(true)}
                className="text-red-600 text-sm font-semibold flex items-center gap-2"
              >
                View Details
                <FaArrowRight />
              </button>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-6">

              <div>
                <p className="text-xs text-gray-400">
                  Account Holder
                </p>

                <p className="font-semibold text-sm mt-1">
                  {userName} {userLastName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Account Type
                </p>

                <p className="font-semibold text-sm mt-1">
                  {accountType || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Account Subtype
                </p>

                <p className="font-semibold text-sm mt-1">
                  {subType || "Not specified"}
                </p>
              </div>

            </div>

          </section>

        </main>

      </div>


      {/* ACCOUNT DETAILS MODAL */}
      {showViewModal && (

        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-[25px] p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-5 text-2xl text-gray-500 hover:text-black"
            >
              ×
            </button>

            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mb-4">
              <FaWallet className="text-xl" />
            </div>

            <h2 className="text-xl font-bold">
              Account Details
            </h2>

            <p className="text-xs text-gray-500 mt-1 mb-6">
              Account information
            </p>

            <div className="space-y-5 text-sm">

              <div>
                <p className="text-gray-500 text-xs">Account Holder</p>
                <p className="font-semibold mt-1">
                  {userName} {userLastName}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Account Number</p>
                <p className="font-semibold mt-1">
                  {AcctNum || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Account Type</p>
                <p className="font-semibold mt-1">
                  {accountType || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Account Subtype</p>
                <p className="font-semibold mt-1">
                  {subType || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Account Balance</p>
                <p className="text-2xl font-bold mt-1">
                  {formatMoney(userAmount)}
                </p>
              </div>

            </div>

            <div className="mt-6 bg-gray-100 rounded-xl p-4 text-xs text-gray-600">
              Account information is displayed from the application's stored user profile. Verify balances against your actual account records.
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-5 bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-semibold transition"
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* MOBILE LOGOUT */}
      <button
        onClick={handleLogout}
        className="sm:hidden fixed top-[90px] right-5 z-30 w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-sm"
        title="Logout"
      >
        <FaSignOutAlt />
      </button>


      {/* SEPARATE STICKY NAVIGATION COMPONENT */}
      <StickyBottomNav />

    </div>
  );
};

export default Dashboard;
