'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global application ErrorBoundary.
 * Captures React runtime errors and renders a fallback view.
 * 
 * @throws {never} This component itself handles exceptions to prevent layout crash.
 * @returns Instance of the class.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  /**
   * Derives state from caught errors.
   * 
   * @param _ - The caught Error object.
   * @returns The updated State object.
   * @throws {never} This method does not throw.
   */
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  /**
   * Catches side effects from React rendering errors.
   * 
   * @param error - The caught Error object.
   * @param errorInfo - Metadata containing the component stack trace.
   * @returns void
   * @throws {never} This method does not throw.
   */
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  /**
   * Renders the children or fallback UI in case of errors.
   * 
   * @returns The React nodes to render.
   * @throws {never} This method does not throw.
   */
  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] bg-surface-soft flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white border border-surface-border p-8 rounded-2xl max-w-md shadow-sm">
            <span className="text-4xl" role="img" aria-label="warning icon">⚠️</span>
            <h2 className="text-xl font-display font-bold text-forest-900 mt-4 mb-2">Something went wrong</h2>
            <p className="text-sm text-slateBlue-500 mb-6">
              An unexpected application error occurred. Please reload or try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-forest-600 hover:bg-forest-750 text-white rounded-xl text-xs font-semibold uppercase tracking-wider font-sans transition-all duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
