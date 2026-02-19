import { loadFont } from "@remotion/google-fonts/IBMPlexMono";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});
