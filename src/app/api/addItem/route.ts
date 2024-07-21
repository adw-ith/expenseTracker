// pages/api/addExpense.ts
//@ts-ignore
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: any) {
  //@ts-ignore
  const client = await clientPromise;
  //@ts-ignore
  const db = client.db("data");
  console.log("in post add expense");

  const { email, date, expense } = await req.json();

  if (!email || !date || !expense || !expense.desc || expense.amount == null) {
    return new Response(
      JSON.stringify({
        message:
          "Error!! Required fields 'email', 'date', or 'expense' not found",
      }),
      { status: 400 }
    );
  }

  // Find the user by email
  const user = await db.collection("users").findOne({ email: email });
  if (!user) {
    return new Response(
      JSON.stringify({
        message: "User not found",
      }),
      { status: 404 }
    );
  }

  // Generate a unique ID for the new expense
  expense._id = new ObjectId();

  // Find the dailyExpense by date
  let dailyExpense = user.dailyExpenses.find((de: any) => de.date === date);

  if (dailyExpense) {
    // Update existing dailyExpense
    dailyExpense.listOfExpenses.push(expense);
    dailyExpense.totalExpense += expense.amount;
  } else {
    // Add new dailyExpense
    dailyExpense = {
      date: date,
      listOfExpenses: [expense],
      totalExpense: expense.amount,
    };
    user.dailyExpenses.push(dailyExpense);
  }

  const result = await db
    .collection("users")
    .updateOne(
      { email: email },
      { $set: { dailyExpenses: user.dailyExpenses } }
    );

  if (result.modifiedCount === 1) {
    return new Response(
      JSON.stringify({
        message: "Expense added successfully",
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
        message: "Failed to add expense",
      }),
      { status: 500 }
    );
  }
}
