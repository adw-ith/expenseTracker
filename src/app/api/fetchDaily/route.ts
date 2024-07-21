// pages/api/getDailyExpenses.ts
//@ts-ignore
import clientPromise from "../../../lib/mongodb";

interface Expense {
  desc: string;
  amount: number;
}

interface DailyExpense {
  date: string;
  expenses: Expense[];
}

interface User {
  email: string;
  dailyExpenses: DailyExpense[];
}

export async function POST(req: any) {
  //@ts-ignore
  const client = await clientPromise;
  //@ts-ignore
  const db = client.db("data");
  console.log("in post get daily expenses");

  try {
    const { email, date } = await req.json();

    if (!email || !date) {
      return new Response(
        JSON.stringify({
          message: "Error!! Required fields 'email' or 'date' not found",
        }),
        { status: 400 }
      );
    }

    const user: User | null = await db
      .collection("users")
      .findOne({ email: email });

    if (!user) {
      return new Response(
        JSON.stringify({
          message: "User not found",
        }),
        { status: 404 }
      );
    }

    const dailyExpenses = user.dailyExpenses.find(
      (expenseDay: DailyExpense) => expenseDay.date === date
    );

    if (!dailyExpenses) {
      return new Response(
        JSON.stringify({
          message: "No expenses found for the given date",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Daily expenses retrieved successfully",
        dailyExpenses: dailyExpenses,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving daily expenses:", error);
    return new Response(
      JSON.stringify({
        message: "An error occurred while retrieving daily expenses",
      }),
      { status: 500 }
    );
  }
}
