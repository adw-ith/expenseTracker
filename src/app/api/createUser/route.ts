// pages/api/users.ts
//@ts-ignore
import clientPromise from "../../../lib/mongodb";

export async function POST(req: any) {
  //@ts-ignore
  const client = await clientPromise;
  //@ts-ignore
  const db = client.db("data");
  console.log("in post user create");

  const { email, dailyExpenses } = await req.json();

  // Validate email and dailyExpenses
  if (!email) {
    return new Response(
      JSON.stringify({
        message: "Error!! Required field 'email' not found",
      }),
      { status: 400 }
    );
  }

  const validatedDailyExpenses = Array.isArray(dailyExpenses)
    ? dailyExpenses.map((expenseDay) => {
        const { date, listOfExpenses } = expenseDay;
        const validatedListOfExpenses = Array.isArray(listOfExpenses)
          ? listOfExpenses
              .map((exp) => ({
                desc: exp.desc,
                amount: exp.amount,
              }))
              .filter((exp) => exp.desc && exp.amount != null)
          : [];

        const totalExpense = validatedListOfExpenses.reduce(
          (sum, item) => sum + item.amount,
          0
        );

        return {
          date,
          listOfExpenses: validatedListOfExpenses,
          totalExpense,
        };
      })
    : [];

  const newUser = {
    email,
    dailyExpenses: validatedDailyExpenses,
  };

  // Check if email already exists in any user
  const existingUserWithEmail = await db
    .collection("users")
    .findOne({ email: email });
  if (existingUserWithEmail) {
    return new Response(
      JSON.stringify({
        message: "Email address already exists",
        email: existingUserWithEmail.email,
      }),
      { status: 200 }
    );
  }

  console.log(`Creating new user: ${email}`);

  const result = await db.collection("users").insertOne(newUser);

  return new Response(
    JSON.stringify({
      message: "User added successfully",
      user: {
        _id: result.insertedId,
        ...newUser,
      }, // Return the newly inserted user object with the generated ID
    }),
    { status: 201 }
  );
}
