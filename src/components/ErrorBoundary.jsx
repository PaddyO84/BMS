import React from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-4">
          <AlertCircle className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
          <p className="text-center">The application encountered an error. Please try refreshing the page.</p>
          <pre className="mt-4 p-2 bg-red-100 text-xs rounded-md w-full max-w-lg overflow-auto">
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}