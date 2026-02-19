import { useState } from "react";

const App = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((previous) => previous + 1)}>{count}</button>;
};

export { App };
