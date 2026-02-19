"use client";

import { useEffect, useState } from "react";
import Head from "next/head";

const useSearchParams = () => new URLSearchParams();

const Page = () => {
  const params = useSearchParams();
  const [_data, setData] = useState(null);

  useEffect(() => {
    // Dummy use of params to avoid unused-vars
    console.log(params.get("query"));
    fetch("/api/data");
  }, [params]);

  useEffect(() => {
    router.push("/dashboard");
  }, []);

  return (
    <div>
      <Head>
        <title>Page</title>
      </Head>
      <img src="/photo.jpg" alt="photo" />
      <a href="/about">About</a>
      <Image fill src="/hero.jpg" alt="hero" />
      <script src="https://cdn.example.com/analytics.js" />
      <Script>{`console.log("inline")`}</Script>
      <Script src="https://cdn.polyfill.io/v3/polyfill.min.js" />
      <link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />
      <link rel="stylesheet" href="/styles/main.css" />
      <div onClick={() => setData(null)}>click</div>
      <Link href="https://example.com">External Link</Link>
    </div>
  );
};

const AsyncClientComponent = async () => {
  const data = await fetch("/api/data");
  return <div>{JSON.stringify(data)}</div>;
};

const RedirectInTryCatchComponent = () => {
  try {
    redirect("/dashboard");
  } catch {
    return <div>error</div>;
  }
  return <div />;
};

const router = { push: (_path: string) => {} };
const redirect = (_path: string) => {};
const Image = (props: any) => <img {...props} />;
const Script = (props: any) => <script {...props} />;
const Link = (props: any) => <a {...props} />;

export default Page;
export { AsyncClientComponent, RedirectInTryCatchComponent };
