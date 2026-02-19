declare module "knip" {
  import type { MainOptions } from "knip/session";
  export const main: (
    options: MainOptions,
  ) => Promise<{ issues: unknown; counters: Record<string, number> }>;
}
