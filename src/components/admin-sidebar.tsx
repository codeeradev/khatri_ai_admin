"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MessageSquareText,
  Settings,
  Sparkles,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/greetings", label: "Greetings", icon: MessageSquareText },
  { href: "/menu", label: "Menu", icon: MenuIcon },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpenText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex border-b border-slate-800 bg-slate-950 text-slate-300 md:fixed md:inset-y-0 md:w-64 md:flex-col md:border-b-0 md:border-r">
      <div className="flex min-h-20 items-center gap-3 px-5 md:border-b md:border-slate-800 md:px-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
          <Sparkles aria-hidden="true" className="size-5" />
        </div>
        <div>
          <p className="font-semibold tracking-tight text-white">Khatri AI</p>
          <p className="text-xs text-slate-500">Admin panel</p>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="hidden flex-1 space-y-1 p-4 md:block">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="ml-auto flex p-4 md:ml-0 md:border-t md:border-slate-800">
        <button
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white md:w-full"
          type="submit"
        >
          <LogOut aria-hidden="true" className="size-[18px]" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </form>

      <nav
        aria-label="Mobile admin navigation"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium",
                active ? "text-amber-700" : "text-slate-500",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="size-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
