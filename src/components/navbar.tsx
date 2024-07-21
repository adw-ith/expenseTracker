import React from "react";
import Logout from "./logout";

export default function Navbar() {
  return (
    <div className="flex w-full bg-slate-950 justify-between px-4 sm:px-12 p-2">
      <div className="text-xl text-slate-300 font-bold">
        Expense<span className="text-orange-400">Tracker</span>
      </div>
      <Logout></Logout>
    </div>
  );
}
