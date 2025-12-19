import {Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import {CreateSession} from "./pages/Session"
import Game from "./pages/Game"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/session" element={<CreateSession />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  )
}
