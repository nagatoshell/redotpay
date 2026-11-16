
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaClock,
  FaTimes,
  FaHeadset,
  FaLock,
  FaWallet,
  FaSearch,
  FaHistory,
} from "react-icons/fa";

import {
  fetchHistoryForLoggedUser,
  type Transaction,
} from "../backend/api";

import StickyBottomNav from "../components/stickyNavv";

type TransactionType = "credit" | "debit" | "pending";

type SupportAction = "deposit" | "withdraw";

const PAGE_SIZE = 10;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getTransactionType = (
  transaction: Transaction
): TransactionType => {
  const type = String(transaction.type || "").toLowerCase();

  if (type === "debit") return "debit";
  if (type === "pending") return "pending";

  return "credit";
};

const getAmount = (amount: string | number) => {
  const numericAmount = Number(
    String(amount).replace(/[$,\s]/g, "")
  );

  return Number.isFinite(numericAmount) ? numericAmount : 0;
};

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountBalance, setAccountBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [supportModal, setSupportModal] =
    useState<SupportAction | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("loggedInUser");

        if (!storedUser) {
          throw new Error("Please sign in to view your transaction history.");
        }

        const user = JSON.parse(storedUser);

        const balance = Number(
          String(user.amount ?? 0).replace(/[$,\s]/g, "")
        );

        if (mounted) {
          setAccountBalance(
            Number.isFinite(balance) ? balance : 0
          );
        }

        const history = await fetchHistoryForLoggedUser(user.email);

        if (mounted) {
          setTransactions(Array.isArray(history) ? history : []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load transaction history."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return transactions;

    return transactions.filter((transaction) => {
      const description = String(
        transaction.description || ""
      ).toLowerCase();

      const date = String(transaction.date || "").toLowerCase();

      const type = getTransactionType(transaction);

      return (
        description.includes(query) ||
        date.includes(query) ||
        type.includes(query)
      );
    });
  }, [transactions, search]);

  const visibleTransactions = filteredTransactions.slice(
    0,
    visibleCount
  );

  const openSupportModal = (action: SupportAction) => {
    setSupportModal(action);
  };

  const closeSupportModal = () => {
    setSupportModal(null);
  };

  const openSupport = () => {
    window.dispatchEvent(new CustomEvent("open-support"));
    closeSupportModal();
  };

  return (
    <div className="min-h-screen bg-white pb-28 text-gray-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
            <FaWallet className="text-gray-400" />
            Account
            <span>/</span>
            <span className="text-gray-900">Transactions</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Transaction History
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage your account activity.
          </p>
        </div>

        {/* BALANCE CARD */}
        <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <FaWallet />
            Account Balance
          </div>

          <div className="mt-3">
            <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {formatCurrency(accountBalance)}
            </h2>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Balance displayed from your account profile.
          </p>
        </div>

        {/* DEPOSIT AND WITHDRAW */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-5">
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

        {/* HISTORY SECTION */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* HISTORY HEADER */}
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FaHistory className="text-gray-500" />

                  <h2 className="text-lg font-bold text-gray-950">
                    Recent Transactions
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Your account activity
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {filteredTransactions.length} records
              </span>
            </div>

            {/* SEARCH */}
            <div className="relative mt-5">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Search transactions..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />
            </div>
          </div>

          {/* TRANSACTION LIST */}
          {loading ? (
            <div className="space-y-4 p-5 sm:p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-11 w-11 rounded-full bg-gray-100" />

                  <div className="flex-1">
                    <div className="mb-2 h-3 w-36 rounded bg-gray-100" />
                    <div className="h-3 w-24 rounded bg-gray-100" />
                  </div>

                  <div className="h-4 w-20 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center">
              <FaClock className="mx-auto mb-3 text-3xl text-gray-300" />

              <h3 className="font-semibold text-gray-900">
                Unable to load history
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {error}
              </p>
            </div>
          ) : visibleTransactions.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <FaHistory className="text-xl text-gray-400" />
              </div>

              <h3 className="font-semibold text-gray-900">
                No transactions found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try searching with another keyword."
                  : "Your transactions will appear here when available."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {visibleTransactions.map((transaction, index) => {
                const type = getTransactionType(transaction);
                const amount = getAmount(transaction.amount);

                const isDebit = type === "debit";
                const isPending = type === "pending";

                return (
                  <div
                    key={`${transaction.date}-${transaction.description}-${index}`}
                    className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-gray-50 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isPending
                            ? "bg-amber-50 text-amber-600"
                            : isDebit
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {isPending ? (
                          <FaClock />
                        ) : isDebit ? (
                          <FaArrowUp />
                        ) : (
                          <FaArrowDown />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {transaction.description || "Transaction"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </p>

                        <span
                          className={`mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide ${
                            isPending
                              ? "text-amber-600"
                              : isDebit
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {type}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-bold ${
                          isDebit
                            ? "text-red-600"
                            : isPending
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {isDebit ? "-" : "+"}
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LOAD MORE */}
          {!loading &&
            !error &&
            visibleCount < filteredTransactions.length && (
              <div className="border-t border-gray-100 p-5 text-center">
                <button
                  onClick={() =>
                    setVisibleCount((current) => current + PAGE_SIZE)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Load More
                </button>
              </div>
            )}
        </div>

        {/* FOOTER NOTE */}
        <p className="mt-5 text-center text-xs text-gray-400">
          Transaction information is displayed from your account records.
        </p>
      </div>

      {/* SUPPORT MODAL */}
      {supportModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={closeSupportModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-700">
                <FaLock />
              </div>

              <button
                onClick={closeSupportModal}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-950">
              {supportModal === "deposit"
                ? "Deposit Unavailable"
                : "Withdrawal Unavailable"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {supportModal === "deposit"
                ? "Please contact our support team for assistance with your deposit request."
                : "Please contact our support team for assistance with your withdrawal request."}
            </p>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-800">
                No transaction has been initiated. Contact support for
                further assistance.
              </p>
            </div>

            <button
              onClick={openSupport}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              <FaHeadset />
              Contact Support
            </button>

            <button
              onClick={closeSupportModal}
              className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <StickyBottomNav />
    </div>
  );
}
