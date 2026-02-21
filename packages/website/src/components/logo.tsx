import { SVGProps } from "react";

export const LogoMark = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" {...props}>
      <path d="M20 6L36 34H4L20 6Z" fill="currentColor" />
      <path
        d="M20 17V25M16 21H24"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-fd-background"
      />
    </svg>
  );
};
