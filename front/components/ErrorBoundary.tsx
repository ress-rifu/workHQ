import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    children: ReactNode;
    fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', errorInfo);

        // You could send this to an error reporting service here
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Default fallback UI
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Ionicons name="alert-circle" size={64} color="#EF4444" />
                        <Text style={styles.title}>Oops! Something went wrong</Text>
                        <Text style={styles.message}>
                            The app encountered an unexpected error. Don't worry, your data is safe.
                        </Text>

                        {__DEV__ && this.state.error && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                                <Text style={styles.errorText}>{this.state.error.message}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.resetError}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>

                        <Text style={styles.hint}>
                            If the problem persists, please restart the app.
                        </Text>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1220',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    errorDetails: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 12,
        color: '#FCA5A5',
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0B5FFF',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    hint: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
