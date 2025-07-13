"use server";

import { redirect } from "next/navigation";
import { auth } from "./auth";
// import { prisma } from "./prisma";
import { APIError } from "better-auth/api";
import { log } from "console";

interface State {
  errorMessage?: string | null;
}

export async function signIn(prevState: State, formData: FormData) {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { email, password } = rawFormData;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    console.log("Signed in");
  } catch (error) {
    if (error instanceof APIError) {
      switch (error.status) {
        case "UNAUTHORIZED":
          return { errorMessage: "User Not Found." };
        case "BAD_REQUEST":
          return { errorMessage: "Invalid email." };
        default:
          return { errorMessage: "Something went wrong." };
      }
    }
    console.error("sign in with email has not worked", error);
    throw error;
  }
  redirect("/");
}

export async function signUp(prevState: State, formData: FormData) {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("firstname"),
    lastName: formData.get("lastname"),
  };

  const { email, password, firstName, lastName } = rawFormData;

  console.log({ email, password, firstName, lastName });

  if (!password) return { errorMessage: "Password is required." };

  try {
    await auth.api.signUpEmail({
      body: {
        name: `${firstName} ${lastName}`,
        email,
        password,
      },
    });
  } catch (error: any) {
    console.log(error?.status);

    if (error instanceof APIError) {
      return { errorMessage: error.message };
    }
    console.error("sign up with email and password has not worked", error);
  }
  redirect("/");
}

// export async function searchAccount(email: string) {
//   const user = await prisma.user.findUnique({
//     where: { email },
//   });

//   return !!user;
// }
