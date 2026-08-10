"use server";

import { revalidatePath } from "next/cache";

import {
  greetingApiRequest,
  type Greeting,
  type GreetingInput,
} from "@/lib/greetings";
import { requireAdmin } from "@/lib/auth/session";

export type GreetingActionResult = {
  success: boolean;
  error?: string;
};

async function runGreetingMutation(operation: () => Promise<unknown>): Promise<GreetingActionResult> {
  await requireAdmin();

  try {
    await operation();
    revalidatePath("/greetings");
    return { success: true };
  } catch (error) {
    console.error("Greeting mutation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Greeting update failed.",
    };
  }
}

export async function createGreetingAction(input: GreetingInput) {
  return runGreetingMutation(() => greetingApiRequest<Greeting>("", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateGreetingAction(id: string, input: GreetingInput) {
  return runGreetingMutation(() => greetingApiRequest<Greeting>(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }));
}

export async function deleteGreetingAction(id: string) {
  return runGreetingMutation(() => greetingApiRequest(`/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }));
}

export async function toggleGreetingAction(id: string, enabled: boolean) {
  return runGreetingMutation(() => greetingApiRequest<Greeting>(
    `/${encodeURIComponent(id)}/enabled`,
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    },
  ));
}
