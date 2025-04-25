"use client";
import { ReduxProvider } from "./store/provider";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
