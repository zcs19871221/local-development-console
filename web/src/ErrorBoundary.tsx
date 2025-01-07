import Button from 'antd/es/button';
import { Component } from 'react';

interface State {
  readonly error: Error | null;
  readonly href: string | null;
}

export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  State
> {
  readonly state: State = {
    error: null,
    href: null,
  };

  componentDidMount() {
    // @ts-expect-error
    window.navigation?.addEventListener(
      'navigate',
      this.resetStateAfterNavigation
    );
  }

  componentWillUnmount() {
    // @ts-expect-error
    window.navigation?.removeEventListener(
      'navigate',
      this.resetStateAfterNavigation
    );
  }

  static getDerivedStateFromError(error: Error) {
    // we cannot rely on `useLocation` as it doesn't work outside a `Router`
    return { error, href: window.location.href };
  }

  private resetStateAfterNavigation = () => {
    // We must wait for react to render the next page before resetting,
    // otherwise react-router will render the previous page's tree, which will crash again,
    // so ErrorBoundary in the next page will remain in a crashed state.
    // This rAF workaround might no be needed once react-router adopts the Navigation API.
    requestAnimationFrame(() => {
      if (this.state.error === null) return;
      this.resetState();
    });
  };

  private resetState() {
    this.setState({ error: null, href: null });
  }

  render() {
    if (!this.state.error) return this.props.children;

    if (
      // @ts-expect-error
      window.navigation === undefined &&
      this.state.href !== window.location.href
    ) {
      // TODO: remove once we can use the the Navigation API on all browsers https://chromestatus.com/feature/6232287446302720
      this.resetState();
    }

    return (
      <div>
        <h1>报错了</h1>
        <p>{this.state.error.message}</p>
        <Button onClick={() => this.resetState()}>请重试</Button>
      </div>
    );
  }
}
