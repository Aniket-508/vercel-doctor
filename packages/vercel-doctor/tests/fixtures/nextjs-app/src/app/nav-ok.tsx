import Link from "next/link";

export const NavOk = () => (
  <nav>
    <Link href="/" prefetch={false}>
      Home
    </Link>
    <Link href="/about" prefetch={false}>
      About
    </Link>
  </nav>
);
