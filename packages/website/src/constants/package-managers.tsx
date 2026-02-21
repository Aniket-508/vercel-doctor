import type { ReactNode } from "react";
import { NpmIcon, YarnIcon, PnpmIcon, BunIcon } from "@/components/icons";

export interface PackageManager {
  id: string;
  label: string;
  command: string;
  icon: ReactNode;
}

export const PACKAGE_MANAGERS: PackageManager[] = [
  {
    id: "npm",
    label: "npm",
    command: "npx -y vercel-doctor@latest .",
    icon: <NpmIcon className="size-3.5" />,
  },
  {
    id: "yarn",
    label: "yarn",
    command: "yarn dlx vercel-doctor@latest .",
    icon: <YarnIcon className="size-3.5" />,
  },
  {
    id: "pnpm",
    label: "pnpm",
    command: "pnpm dlx vercel-doctor@latest .",
    icon: <PnpmIcon className="size-3.5" />,
  },
  {
    id: "bun",
    label: "bun",
    command: "bunx vercel-doctor@latest .",
    icon: <BunIcon className="size-3.5" />,
  },
];
