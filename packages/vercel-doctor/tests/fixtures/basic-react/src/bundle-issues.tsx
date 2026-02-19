import { debounce } from "lodash";
import moment from "moment";
import { motion } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import { Button } from "./components/index";

const DebouncedInput = () => {
  const handleChange = debounce(() => {}, 300);
  return <input onChange={handleChange} />;
};

const DateDisplay = () => <div>{moment().format("YYYY-MM-DD")}</div>;

const AnimatedBox = () => <motion.div animate={{ x: 100 }} />;

const EditorComponent = () => <MonacoEditor height="400px" />;

const ImportedButton = () => <Button />;

const ThirdPartyScript = () => <script src="https://cdn.example.com/widget.js" />;

export {
  DebouncedInput,
  DateDisplay,
  AnimatedBox,
  EditorComponent,
  ImportedButton,
  ThirdPartyScript,
};
