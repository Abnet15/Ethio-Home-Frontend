import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold mb-4">Something went wrong.</h1>
            <p className="text-gray-400 mb-4">Please refresh the page or try again later.</p>
            {this.state.error && (
              <details className="mt-4 text-left bg-gray-800 p-4 rounded">
                <summary className="cursor-pointer text-yellow-400 mb-2">Error Details (Click to expand)</summary>
                <pre className="text-xs text-red-300 overflow-auto mt-2">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2 text-gray-400">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
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



