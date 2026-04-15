import { auth } from "@clerk/nextjs/server";
import AppShell from "./appShell";
import { getUserCreditsForSSR } from "@/lib/creditSystem";

export default async function Page() {
  let userId: string | null = null;
  try {
    const result = await auth();
    userId = result.userId;
  } catch {
    // Clerk not configured — SSR falls back to anonymous
  }

  const initialAuth = await getUserCreditsForSSR(userId);

  return <AppShell initialAuth={initialAuth} />;
}
