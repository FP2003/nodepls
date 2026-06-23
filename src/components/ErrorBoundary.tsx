import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: 'var(--nge-error, #c64545)', background: 'var(--nge-canvas, #faf9f5)', fontFamily: 'sans-serif', fontSize: 13 }}>
          <strong>Something went wrong rendering this graph.</strong>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
