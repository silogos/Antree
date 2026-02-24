import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BoardList } from "./components/BoardList";
import { QueueDetail } from "./components/QueueDetail";
import { SessionDetail } from "./components/SessionDetail";

/**
 * Main App Component
 * Sets up routing for the application with error boundary
 */
function App() {
	return (
		<ErrorBoundary
			onError={(error, errorInfo) => {
				// Log errors for debugging
				console.error("[App] Unhandled error:", error);
				console.error("[App] Component stack:", errorInfo.componentStack);
			}}
		>
			<BrowserRouter>
				<Routes>
					{/* Root route - shows list of all boards */}
					<Route path="/" element={<BoardList />} />

					{/* Queue detail route - shows queue details and sessions */}
					<Route
						path="/queues/:id"
						element={
							<ErrorBoundary
								fallback={
									<div className="flex min-h-screen items-center justify-center">
										<p className="text-gray-600">
											Failed to load queue details. Please go back and try again.
										</p>
									</div>
								}
							>
								<QueueDetail />
							</ErrorBoundary>
						}
					/>

					{/* Session detail route - shows session details with kanban board */}
					<Route
						path="/sessions/:id"
						element={
							<ErrorBoundary
								fallback={
									<div className="flex min-h-screen items-center justify-center">
										<p className="text-gray-600">
											Failed to load session. Please go back and try again.
										</p>
									</div>
								}
							>
								<SessionDetail />
							</ErrorBoundary>
						}
					/>

					{/* Catch all - redirect to root */}
					<Route path="*" element={<BoardList />} />
				</Routes>
			</BrowserRouter>
		</ErrorBoundary>
	);
}

export default App;
