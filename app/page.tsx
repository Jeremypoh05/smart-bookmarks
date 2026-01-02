// app/page.tsx (服务器组件)
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomePage from "@/components/LandingPage"; 

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <HomePage />;
}