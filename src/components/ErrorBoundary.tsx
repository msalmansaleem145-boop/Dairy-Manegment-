import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AskLogo } from './AskLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ASK Dairy Management - Uncaught Runtime Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      localStorage.removeItem('ask_dairy_database_v1');
      localStorage.removeItem('ask_dairy_offline_queue_v1');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 text-center space-y-5">
            {/* Logo */}
            <div className="flex justify-center">
              <AskLogo size="lg" theme="light" variant="horizontal" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Application Recovery Mode
              </div>
              <h1 className="text-xl font-bold text-neutral-900">
                Application Rendering Paused
              </h1>
              <p className="text-xs text-neutral-600 leading-relaxed">
                An unexpected error prevented the application from rendering normally. You can reload the app or reset local cache to restore defaults without losing your app files.
              </p>
            </div>

            {/* Error detail (collapsed/compact) */}
            {this.state.error && (
              <div className="bg-neutral-900 text-neutral-200 rounded-lg p-3 text-left font-mono text-[11px] overflow-x-auto max-h-36 border border-neutral-800">
                <p className="text-rose-400 font-semibold mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-neutral-400 text-[10px] whitespace-pre-wrap leading-tight">
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Reload Application
              </button>

              <button
                type="button"
                onClick={this.handleResetData}
                className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-semibold transition-colors border border-neutral-200 cursor-pointer"
              >
                Reset Storage & Load Fresh Demo Data
              </button>

              <a
                href="https://wa.me/923029075029"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-4 text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold text-center hover:underline cursor-pointer"
              >
                Need Help? WhatsApp Support (+923029075029)
              </a>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 mt-6 text-center">
            Powered By M Salman Saleem | ASK Dairy Management
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
