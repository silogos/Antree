import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BoardList } from "./components/BoardList";
import { QueueDetail } from "./components/QueueDetail";
import { SessionDetail } from "./components/SessionDetail";

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

        {/* Queue detail route - shows queue details and sessions */}
        <Route path="/queues/:id" element={<QueueDetail />} />

        {/* Session detail route - shows session details with kanban board */}
        <Route path="/sessions/:id" element={<SessionDetail />} />

        {/* Catch all - redirect to root */}
        <Route path="*" element={<BoardList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
