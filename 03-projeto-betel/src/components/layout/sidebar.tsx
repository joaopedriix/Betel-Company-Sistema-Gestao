"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import { NAV_BY_PERFIL, type NavEntry } from "@/lib/layout/nav-config";
import type { Perfil } from "@/lib/auth/rotas";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";

function RefazerDicasButton() {
  const { steps, reiniciar } = useOnboarding();
  if (steps.length === 0) return null;
  return (
    <button
      type="button"
      onClick={reiniciar}
      className="mb-2 block text-left text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      Refazer dicas
    </button>
  );
}

function isEntryActive(entry: NavEntry, pathname: string): boolean {
  if (entry.type === "link") return pathname.startsWith(entry.href);
  return entry.items.some((item) => pathname.startsWith(item.href));
}

function NavGroupItem({ entry, pathname }: { entry: NavEntry; pathname: string }) {
  const active = isEntryActive(entry, pathname);
  const [open, setOpen] = useState(active);

  if (entry.type === "link") {
    return (
      <Link
        href={entry.href}
        className={cn(
          "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
        )}
      >
        {entry.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active ? "text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
        )}
      >
        {entry.label}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="ml-3 flex flex-col gap-0.5 border-l pl-3">
          {entry.items.map((item) => {
            const itemActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  itemActive
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({ perfil, nome }: { perfil: Perfil; nome: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const entries = NAV_BY_PERFIL[perfil];

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {entries.map((entry) => (
        <NavGroupItem key={entry.label} entry={entry} pathname={pathname} />
      ))}
    </nav>
  );

  return (
    <>
      {/* Barra superior só em telas pequenas, com botão para abrir o menu. */}
      <div className="flex items-center justify-between border-b p-3 md:hidden">
        <span className="text-sm font-semibold">Betel Company</span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 hover:bg-accent/50"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Overlay + menu deslizante em telas pequenas. */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-64 flex-col bg-background">
            <div className="flex items-center justify-between border-b p-3">
              <span className="text-sm font-semibold">Betel Company</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-2 hover:bg-accent/50"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {nav}
            <div className="border-t p-3">
              <p className="mb-1 truncate text-xs text-muted-foreground">{nome}</p>
              <RefazerDicasButton />
              <LogoutButton />
            </div>
          </div>
        </div>
      ) : null}

      {/* Barra lateral fixa em telas médias/grandes. */}
      <aside className="hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-b p-4">
          <span className="text-sm font-semibold">Betel Company</span>
        </div>
        {nav}
        <div className="border-t p-3">
          <p className="mb-1 truncate text-xs text-muted-foreground">{nome}</p>
          <RefazerDicasButton />
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
