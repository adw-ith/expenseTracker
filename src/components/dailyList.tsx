"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import Loader from "./loader";

const TotalExpense = ({ total }: { total: number }) => (
  <h4 className="font-bold bg-slate-950 w-fit text-slate-400 p-2 border-2 border-slate-700">
    Total Daily Expense: ₹{total}
  </h4>
);

export default function DailyList() {
  const [exForm, setExForm] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dailyExpenses, setDailyExpenses] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [desc, setDesc] = useState("");
  const [checked, setChecked] = useState(false);
  const [amount, setAmount] = useState<number | undefined>(0);

  const { user } = useAuth();

  const expensesPerPage = 10;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateString = (dateString: string): string => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchDailyExpenses = async (date: string) => {
    setLoading(true);
    date = formatDateString(date);
    try {
      const response = await fetch("/api/fetchDaily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          date: date,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setDailyExpenses(data.dailyExpenses);
      } else {
        setDailyExpenses(null);
      }
    } catch (error) {
      console.error("Failed to fetch daily expenses:", error);
      setDailyExpenses(null);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/deleteItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          date: formatDateString(formatDate(date)),
          expenseId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchDailyExpenses(formatDate(date));
      } else {
        alert(data.message || "Failed to delete expense");
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(expenseId);
    }
  };

  const addExpense = async () => {
    //@ts-ignore
    if (!desc || amount <= 0) {
      alert("Please enter a valid description and amount");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          date: formatDateString(formatDate(date)),
          expense: {
            desc,
            amount,
          },
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setExForm(false);
        setDesc("");
        setAmount(0);
        fetchDailyExpenses(formatDate(date));
      } else {
        alert(data.message || "Failed to add expense");
      }
    } catch (error) {
      console.error("Failed to add expense:", error);
    } finally {
      setChecked(!checked);
      setLoading(false);
    }
  };

  useEffect(() => {
    const formattedDate = formatDate(date);
    fetchDailyExpenses(formattedDate);
  }, [date, checked]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    if (dailyExpenses) {
      const totalPages = Math.ceil(
        dailyExpenses.listOfExpenses.length / expensesPerPage
      );
      setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    }
  };

  const getCurrentPageExpenses = () => {
    if (!dailyExpenses) return [];
    const startIndex = (currentPage - 1) * expensesPerPage;
    const endIndex = startIndex + expensesPerPage;
    return dailyExpenses.listOfExpenses.slice(startIndex, endIndex);
  };

  const ExpenseForm = (
    <div className="absolute bg-slate-950 text-slate-400 p-4 border border-slate-700">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addExpense();
        }}
      >
        <div className="text-lg pb-4 flex justify-between">
          New expense
          <div
            onClick={() => setExForm(false)}
            className="font-bold px-2 hover:text-red-400  duration-200"
          >
            ✕
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="p-1 px-2 bg-slate-800"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            type="text"
            name="desc"
            placeholder="Description"
          />
          <input
            className="p-1 px-2 bg-slate-800 gap-2"
            type="number"
            name="amount"
            value={amount != 0 ? amount : undefined}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount"
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 border-2 border-slate-300 text-slate-300 p-1 hover:text-slate-700 hover:bg-slate-300 duration-300"
        >
          Add Expense
        </button>
      </form>
    </div>
  );

  return (
    <div className="relative flex flex-col gap-y-4 place-content-center place-items-center">
      {exForm && ExpenseForm}
      <div className="flex justify-between w-full">
        <input
          className="bg-slate-700 text-white px-2"
          type="date"
          value={formatDate(date)}
          onChange={(e) => setDate(parseDate(e.target.value))}
        />
        <button
          onClick={() => setExForm(true)}
          className="px-4 border-2 border-slate-300 text-slate-300 p-1 hover:text-slate-700 hover:bg-slate-300 duration-300"
        >
          + Add Expense
        </button>
      </div>
      {dailyExpenses && <TotalExpense total={dailyExpenses.totalExpense} />}
      <div className="items w-full">
        {loading ? (
          <Loader />
        ) : dailyExpenses ? (
          <>
            <table className="min-w-full border-2 border-slate-600 bg-slate-700 text-center text-slate-400">
              <thead>
                <tr className="border-2 border-slate-600 text-slate-300">
                  <th className="py-2">Description</th>
                  <th className="py-2 border-l-2 border-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageExpenses().map((expense: any, index: number) => (
                  <tr className="border-2 border-slate-600" key={expense._id}>
                    <td className="py-2">{expense.desc}</td>
                    <td className="py-2 border-l-2 border-slate-600">
                      ₹{expense.amount}
                    </td>
                    <td className="py-2">
                      <button
                        className="px-2 py-1 bg-red-100 text-white rounded hover:bg-red-200"
                        onClick={() => handleDelete(expense._id)}
                      >
                        <img
                          className="w-4"
                          alt="delete"
                          src="/delete.png"
                        ></img>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button
                className="px-4 border-2 border-slate-300 text-slate-300 p-1 hover:text-slate-700 hover:bg-slate-300 duration-300 disabled:opacity-50"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-slate-300">
                {currentPage} of{" "}
                {Math.ceil(
                  dailyExpenses.listOfExpenses.length / expensesPerPage
                )}
              </span>
              <button
                className="px-4 border-2 border-slate-300 text-slate-300 p-1 hover:text-slate-700 hover:bg-slate-300 duration-300 disabled:opacity-50"
                onClick={handleNextPage}
                disabled={
                  currentPage ===
                  Math.ceil(
                    dailyExpenses.listOfExpenses.length / expensesPerPage
                  )
                }
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-slate-300">
            No expenses found for the selected date.
          </p>
        )}
      </div>
    </div>
  );
}
