// pages/api/deleteExpense.ts
//@ts-ignore
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: any) {
  //@ts-ignore
  const client = await clientPromise;
  //@ts-ignore
  const db = client.db("data");
  console.log("in post delete expense");

  const { email, date, expenseId } = await req.json();

  if (!email || !date || !expenseId) {
    return new Response(
      JSON.stringify({
        message:
          "Error!! Required fields 'email', 'date', or 'expenseId' not found",
      }),
      { status: 400 }
    );
  }

  try {
    const user = await db.collection("users").findOne({ email: email });
    if (!user) {
      return new Response(
        JSON.stringify({
          message: "User not found",
        }),
        { status: 404 }
      );
    }

    let dailyExpense = user.dailyExpenses.find((de: any) => de.date === date);
    if (!dailyExpense) {
      return new Response(
        JSON.stringify({
          message: "Daily expense not found for the given date",
        }),
        { status: 404 }
      );
    }

    const expenseIndex = dailyExpense.listOfExpenses.findIndex(
      (expense: any) => new ObjectId(expense._id).toString() === expenseId
    );

    if (expenseIndex === -1) {
      return new Response(
        JSON.stringify({
          message: "Expense not found",
        }),
        { status: 404 }
      );
    }

    const deletedExpense = dailyExpense.listOfExpenses.splice(
      expenseIndex,
      1
    )[0];
    dailyExpense.totalExpense -= deletedExpense.amount;

    const result = await db
      .collection("users")
      .updateOne(
        { email: email },
        { $set: { dailyExpenses: user.dailyExpenses } }
      );

    if (result.modifiedCount === 1) {
      return new Response(
        JSON.stringify({
          message: "Expense deleted successfully",
          user: {
            email: email,
            dailyExpenses: user.dailyExpenses,
          },
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Failed to delete expense",
        }),
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
