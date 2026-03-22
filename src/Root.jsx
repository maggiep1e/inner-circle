import { BrowserRouter } from "react-router-dom";
import AppGate from "./AppGate";

export default function Root() {
  return (
    <BrowserRouter>
      <AppGate />
    </BrowserRouter>
  );
}