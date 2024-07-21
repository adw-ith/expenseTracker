"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/Redirects/ProtectedRoute";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import DailyList from "@/components/dailyList";
import Logout from "@/components/logout";
import Navbar from "@/components/navbar";
import Monthly from "@/components/monthly";

const Daily: React.FC = () => {
  const [ms, setMd] = useState(true);
  const [loading1, setLoading] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchOrCreateUser = async () => {
      console.log(user ? user.email : "none");
      try {
        const createUserResponse = await axios.post(`/api/createUser`, {
          email: user?.email,
          dailyExpenses: [],
        });
        console.log("User creation response:", createUserResponse);
      } catch (error) {
        console.error("Error fetching or creating user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateUser();
  }, [user]);

  return (
    <ProtectedRoute>
      <div>
        <Navbar></Navbar>
        <div className="relative p-4 md:p-12 text-slate-200 border-b-2 border-slate-700 w-dvw">
          <h1 className="text-3xl">
            {ms ? "Daily Expenses" : "Monthly Expenses"}
          </h1>
          <p className="text-slate-400">Welcome, {user?.email}</p>
          <div className="flex sm:absolute bottom-1 pt-4 right-4 gap-2">
            <button
              onClick={() => setMd(true)}
              className={`px-4 py-2 border-2 rounded-lg text-white ${
                ms
                  ? "bg-blue-700 border-blue-500"
                  : "bg-gray-600 border-gray-400 hover:bg-gray-500"
              }`}
              disabled={ms}
            >
              Daily
            </button>
            <button
              onClick={() => setMd(false)}
              className={`px-4 py-2 border-2 rounded-lg text-white ${
                !ms
                  ? "bg-blue-700 border-blue-500"
                  : "bg-gray-600 border-gray-400 hover:bg-gray-500"
              }`}
              disabled={!ms}
            >
              monthly
            </button>
          </div>
        </div>
        <div className="p-4 md:p-12 md:pt-4">
          {ms && <DailyList />}
          {!ms && <Monthly />}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Daily;
