import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/auth/session";

export default async function Home() {
  redirect((await isAdminAuthenticated()) ? "/dashboard" : "/login");
}
