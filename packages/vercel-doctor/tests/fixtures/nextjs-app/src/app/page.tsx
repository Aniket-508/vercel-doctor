"use client";

import { useEffect, useState } from "react";

const Page = () => {
  const [_data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data");
  }, []);

  return (
    <div>
      <img src="/photo.jpg" alt="photo" />
      <Image fill src="/hero.jpg" alt="hero" />
      <div onClick={() => setData(null)}>click</div>
    </div>
  );
};

const Image = (props: any) => <img {...props} />;

export default Page;
