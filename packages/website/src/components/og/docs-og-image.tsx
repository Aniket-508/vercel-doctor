import type { ReactNode } from "react";
import { LogoMark } from "@/components/logo";

interface DocsOgImageProps {
  title: ReactNode;
  description?: ReactNode;
}

const DocsOgImage = ({ title, description }: DocsOgImageProps) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      backgroundColor: "black",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      color: "white",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "60px",
        position: "relative",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          marginBottom: "40px",
          textWrap: "pretty",
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            color: "white",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 36,
            color: "#a1a1aa",
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: "95%",
            letterSpacing: "-0.01em",
            lineClamp: 2,
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {description}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <LogoMark width={36} height={36} />
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "white",
            opacity: 0.9,
          }}
        >
          Vercel Doctor
        </span>
        <div style={{ flexGrow: 1 }} />
        <div
          style={{
            height: 4,
            width: 60,
            backgroundColor: "grey",
            opacity: 0.9,
            borderRadius: 2,
          }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "grey",
            opacity: 0.9,
          }}
        >
          Documentation
        </span>
      </div>
    </div>
  </div>
);

export default DocsOgImage;
