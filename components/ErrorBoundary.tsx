import React from 'react';

type Props = React.PropsWithChildren<void>;
type State = {
    hasError: boolean;
};
export default class ErrorBoundary extends React.PureComponent<Props, State> {
    constructor(props: React.PropsWithChildren<void>) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <h1
                    style={{
                        width: '100%',
                        textAlign: 'center',
                        marginTop: '48px',
                    }}
                >
                    😬 Something went wrong. Refresh the page. 🔄
                </h1>
            );
        }

        return this.props.children;
    }
}
