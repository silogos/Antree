import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BoardList } from "./components/BoardList";
import { QueueBoard } from "./components/QueueBoard";

/**
 * Main App Component
 * Sets up routing for the application
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root route - shows list of all boards */}
        <Route path="/" element={<BoardList />} />

        {/* Queue board route - shows single board with queues */}
        <Route path="/queues/:id" element={<QueueBoard />} />

        {/* Catch all - redirect to root */}
        <Route path="*" element={<BoardList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
