import { MotionConfig } from "motion/react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Operator from "./pages/Operator";
import Scoreboard from "./pages/Scoreboard";

export default function App() {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}>
      <Header />
      <Routes>
        <Route path="/operator" element={<Operator />} />
        <Route path="*" element={<Scoreboard />} />
      </Routes>
    </MotionConfig>
  );
}
