// pages/api/getAllExpenses.ts
//@ts-ignore
import clientPromise from "../../../lib/mongodb";

interface Expense {
  desc: string;
  amount: number;
}

interface DailyExpense {
  date: string; // Format: DD-MM-YYYY
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
  console.log("in post get all expenses");

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          message: "Error!! Required field 'email' not found",
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

    const allExpenses = user.dailyExpenses;
    const updatedExpenses = allExpenses.map(
      //@ts-ignore
      ({ listOfExpenses, ...rest }) => rest
    );
    return new Response(
      JSON.stringify({
        message: "All expenses retrieved successfully",
        allExpenses: updatedExpenses,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving all expenses:", error);
    return new Response(
      JSON.stringify({
        message: "An error occurred while retrieving all expenses",
      }),
      { status: 500 }
    );
  }
}
