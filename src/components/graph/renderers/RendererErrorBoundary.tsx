import { Component, type ReactNode } from 'react';
function FaultInjector(): ReactNode {
  throw new Error('Demo: Canvas 元件渲染錯誤');
}
type Props = { children: ReactNode; onError: (error: Error) => void; injectFault?: boolean };
export class RendererErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.injectFault ? (
      <FaultInjector />
    ) : (
      this.props.children
    );
  }
}
