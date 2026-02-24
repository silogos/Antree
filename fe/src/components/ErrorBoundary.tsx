import type { ComponentProps, ReactNode } from "react";
import { Component } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in component tree, displays fallback UI, and logs error messages
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
		// Log error to console
		console.error("[ErrorBoundary] Caught error:", error);
		console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);

		// Log to error reporting service (e.g., Sentry) in production
		if (process.env.NODE_ENV === "production") {
			// Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
			console.error("Production error logged:", {
				message: error.message,
				stack: error.stack,
				componentStack: errorInfo.componentStack,
			});
		}
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
					<div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
						<div className="mb-4 flex items-center justify-center">
							<svg
								className="h-16 w-16 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
							Something went wrong
						</h1>
						<p className="mb-6 text-center text-gray-600">
							{this.state.error?.message ||
								"An unexpected error occurred. Please try again."}
						</p>
						{process.env.NODE_ENV === "development" && this.state.error?.stack && (
							<details className="mb-6 rounded-md bg-gray-100 p-4 text-sm">
						<summary className="mb-2 cursor-pointer font-semibold text-gray-700">
							Error Details (Development Only)
						</summary>
								<pre className="overflow-auto text-xs text-gray-800">
									{this.state.error.stack}
								</pre>
							</details>
						)}
						<div className="flex flex-col gap-3">
							<button
								type="button"
								onClick={this.handleReset}
								className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							>
								Try Again
							</button>
							<button
								type="button"
								onClick={() => window.location.href = "/"}
								className="w-full rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								Go to Home
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * Fallback error component for inline usage
 */
interface ErrorFallbackProps extends ComponentProps<"div"> {
	error?: Error;
	resetError?: () => void;
}

export function ErrorFallback({
	error,
	resetError,
	className = "",
	...props
}: ErrorFallbackProps) {
	return (
		<div
			className={`flex items-center justify-center bg-red-50 p-4 ${className}`}
			{...props}
		>
			<div className="text-center">
				<svg
					className="mx-auto mb-4 h-12 w-12 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h3 className="mb-2 text-lg font-semibold text-gray-900">
					Loading failed
				</h3>
				<p className="mb-4 text-sm text-gray-600">
					{error?.message || "An error occurred while loading this content."}
				</p>
				{resetError && (
					<button
						onClick={resetError}
						className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
					>
						Retry
					</button>
				)}
			</div>
		</div>
	);
}
