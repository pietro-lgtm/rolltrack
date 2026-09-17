"use client";

import { useCart } from "@/components/cart/CartProvider";
import { CartBar } from "./CartBar";

/**
 * Wraps the (server-rendered) page content so the sticky CartBar can react to
 * cart state without forcing the whole /servicios page to be a client component.
 */
export function ServiciosPageShell({ children }: { children: React.ReactNode }) {
  const { count } = useCart();

  return (
    <div className={count > 0 ? "pb-28 sm:pb-24" : ""}>
      {children}
      <CartBar />
    </div>
  );
}
