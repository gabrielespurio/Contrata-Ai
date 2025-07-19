import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Clerk Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Problema com Autenticação
              </h1>
              <p className="text-gray-600 mb-6">
                Houve um problema ao inicializar o sistema de autenticação. 
                Isso pode ser devido a configurações incorretas do Clerk.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}