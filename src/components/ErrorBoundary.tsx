import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary:${this.props.name || 'Global'}] Uncaught error:`, error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
                    <Alert variant="destructive" className="max-w-md border-magma/20 bg-magma/5">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-lg font-semibold mb-2">Something went wrong</AlertTitle>
                        <AlertDescription className="text-sm opacity-90 mb-4">
                            {this.props.name ? `An error occurred in the ${this.props.name} section.` : "An unexpected error occurred."}
                            <br />
                            <span className="text-xs font-mono mt-2 block overflow-hidden text-ellipsis">
                                {this.state.error?.message}
                            </span>
                        </AlertDescription>

                        <div className="flex gap-3 justify-center mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={this.handleReset}
                                className="flex items-center gap-2"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Go Home
                            </Button>
                        </div>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
