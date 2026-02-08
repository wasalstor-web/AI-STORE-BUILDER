import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-danger" />
            </div>
            <h1 className="text-2xl font-bold mb-3">حدث خطأ غير متوقع</h1>
            <p className="text-text-secondary mb-2">عذراً، حدث خطأ في التطبيق. جرّب إعادة تحميل الصفحة.</p>
            {this.state.error && (
              <pre className="text-xs text-text-muted bg-dark-surface rounded-xl p-3 mt-4 mb-6 overflow-auto max-h-32 text-left" dir="ltr">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={this.handleReset} className="btn-primary flex items-center gap-2 px-5 py-2.5">
                <RotateCcw className="w-4 h-4" />
                إعادة المحاولة
              </button>
              <a href="/" className="btn-outline flex items-center gap-2 px-5 py-2.5">
                <Home className="w-4 h-4" />
                الرئيسية
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
