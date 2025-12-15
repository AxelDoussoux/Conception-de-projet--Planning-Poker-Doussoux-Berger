import {Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Session from "./pages/Session"
import Game from "./pages/Game"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/session" element={<Session />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  )
}
