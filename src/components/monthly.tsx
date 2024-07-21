"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import Loader from "./loader";

interface ExpenseData {
  date: string;
  totalExpense: number;
}

export default function Monthly() {
  const [expenses, setExpenses] = useState<ExpenseData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseData[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;
  const { user } = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      const email = user?.email;
      try {
        const response = await fetch("/api/monthly", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          setExpenses(data.allExpenses);
        } else {
          setError(data.message || "Failed to fetch expenses");
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setError("An error occurred while fetching expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user?.email]);

  useEffect(() => {
    if (expenses) {
      const filtered = expenses.filter((expense) => {
        const [day, month, year] = expense.date.split("-");
        return month === selectedMonth && year === selectedYear;
      });
      setFilteredExpenses(filtered);

      const total = filtered.reduce(
        (sum, expense) => sum + expense.totalExpense,
        0
      );
      setMonthlyTotal(total);
    }
  }, [expenses, selectedMonth, selectedYear]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  if (loading)
    return (
      <div>
        <Loader />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-x-4">
        <div className="mb-4">
          <label
            htmlFor="year"
            className="block text-lg text-slate-400 font-medium"
          >
            Select Year:
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            className="p-2 bg-slate-800 border border-gray-500 text-slate-300 rounded"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="month"
            className="block text-lg text-slate-400 font-medium"
          >
            Select Month:
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="p-2 bg-slate-800 border border-gray-500 text-slate-300 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredExpenses.length > 0 ? (
        <>
          <table className="min-w-full border-collapse border bg-slate-700 text-center text-gray-300 border-gray-300">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 border-r">Date</th>
                <th className="py-2 px-4">Total Expense</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((expense) => (
                <tr key={expense.date} className="border-b">
                  <td className="py-2 px-4">{expense.date}</td>
                  <td className="py-2 px-4 border-l">
                    ₹{expense.totalExpense.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-700 p-2 rounded text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-700 p-2 rounded text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="mt-4 font-bold text-gray-300">
            Total Expense for{" "}
            {new Date(0, parseInt(selectedMonth) - 1).toLocaleString(
              "default",
              { month: "long" }
            )}{" "}
            {selectedYear} :{" "}
            <span className="text-orange-300"> ₹{monthlyTotal.toFixed(2)}</span>
          </div>
        </>
      ) : (
        <p>No expenses found for this month.</p>
      )}
    </div>
  );
}
