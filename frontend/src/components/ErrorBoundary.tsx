import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/10 via-background to-background z-0" />
          <div className="max-w-md w-full surface-card p-8 text-center animate-enter z-10 relative">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Oops, something went wrong!</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              We encountered an unexpected error while loading this page. This might be a temporary glitch.
            </p>
            <Button 
              onClick={this.handleReset} 
              className="w-full group flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Refresh Page
            </Button>
            {this.state.error && (
              <details className="mt-6 text-left bg-black/40 border border-border/ p-4 rounded-xl text-xs text-destructive overflow-auto backdrop-blur-sm">
                <summary className="cursor-pointer mb-2 font-semibold text-muted-foreground hover:text-foreground transition-colors">Error Details</summary>
                <div className="font-mono mt-2">
                  {this.state.error.toString()}
                  <br />
                  <span className="text-destructive/70">{this.state.errorInfo?.componentStack}</span>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
