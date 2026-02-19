import { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((previous) => previous + 1)}>{count}</button>;
};

export { Counter };
