import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full">
            <h2 className="text-3xl font-black text-red-600 mb-4 font-display uppercase tracking-tight">
              Something went wrong.
            </h2>
            <p className="text-gray-500 mb-6 font-medium">
              We're sorry, but the application encountered an unexpected error.
            </p>
            <details className="text-left bg-gray-100 p-4 rounded-xl mb-6 overflow-auto max-h-48 text-xs font-mono text-gray-700">
              <summary className="cursor-pointer font-bold mb-2">Error Details</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-primary-500/30"
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

export default ErrorBoundary;
