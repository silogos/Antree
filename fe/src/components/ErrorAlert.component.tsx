/**
 * ErrorAlert Component
 * Displays user-friendly error messages with suggestions
 */

import type { ComponentProps } from "react";
import { formatErrorForDisplay } from "../lib/errors";

interface ErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, className = "" }: ErrorAlertProps) {
  const { heading, message, suggestions, requestId, showSupportContact } =
    formatErrorForDisplay(error);

  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{heading}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>

          {suggestions && suggestions.length > 0 && (
            <div className="mt-3 text-sm text-red-700">
              <p className="font-medium">What you can try:</p>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {requestId && <p className="mt-2 text-xs text-red-600">Request ID: {requestId}</p>}

          {showSupportContact && (
            <p className="mt-2 text-xs text-red-600">
              If this problem persists, please contact support with the Request ID above.
            </p>
          )}

          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline error display for form fields
 */
interface InlineErrorProps extends ComponentProps<"div"> {
  error: unknown;
}

export function InlineError({ error, className = "", ...props }: InlineErrorProps) {
  const { message } = formatErrorForDisplay(error);

  return (
    <div className={`text-sm text-red-600 ${className}`} {...props}>
      {message}
    </div>
  );
}

/**
 * Compact error badge
 */
export function ErrorBadge({ error }: { error: unknown }) {
  const parsed = formatErrorForDisplay(error);

  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      {parsed.heading}
    </span>
  );
}
