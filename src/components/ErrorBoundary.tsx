import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro não capturado detectado pelo ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6]">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 text-center animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit mx-auto">
                ALerta do Sistema
              </span>
              <h2 className="text-xl font-black uppercase text-[#1C1917]">
                Ops! Algo deu errado.
              </h2>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">
                Encontramos uma falha inesperada na renderização deste componente. Não se preocupe, seus dados estão seguros.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#E7E5E4] text-left max-h-28 overflow-y-auto">
                <span className="text-[9px] font-black uppercase text-[#78716C] block mb-1">Detalhes técnicos:</span>
                <code className="text-[10px] font-mono text-red-600 break-all">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 bg-[#1C1917] text-[#FAF9F6] text-xs font-black uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all shadow-sm"
              >
                Recarregar Página
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-xs font-black uppercase rounded-xl hover:bg-[#F5F5F4] transition-all"
              >
                Voltar ao Dashboard
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}