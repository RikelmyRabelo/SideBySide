import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Erro não capturado detectado pelo ErrorBoundary:', error, errorInfo);
    }
    handleReload = () => {
        window.location.reload();
    };
    handleGoHome = () => {
        window.location.href = '/dashboard';
    };
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6]", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 text-center animate-in fade-in zoom-in-95 duration-200", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm", children: _jsx("svg", { className: "w-8 h-8 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" }) }) }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit mx-auto", children: "ALerta do Sistema" }), _jsx("h2", { className: "text-xl font-black uppercase text-[#1C1917]", children: "Ops! Algo deu errado." }), _jsx("p", { className: "text-xs text-[#57534E] font-medium leading-relaxed", children: "Encontramos uma falha inesperada na renderiza\u00E7\u00E3o deste componente. N\u00E3o se preocupe, seus dados est\u00E3o seguros." })] }), this.state.error && (_jsxs("div", { className: "bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#E7E5E4] text-left max-h-28 overflow-y-auto", children: [_jsx("span", { className: "text-[9px] font-black uppercase text-[#78716C] block mb-1", children: "Detalhes t\u00E9cnicos:" }), _jsx("code", { className: "text-[10px] font-mono text-red-600 break-all", children: this.state.error.toString() })] })), _jsxs("div", { className: "flex flex-col gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: this.handleReload, className: "w-full py-3 bg-[#1C1917] text-[#FAF9F6] text-xs font-black uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all shadow-sm", children: "Recarregar P\u00E1gina" }), _jsx("button", { type: "button", onClick: this.handleGoHome, className: "w-full py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-xs font-black uppercase rounded-xl hover:bg-[#F5F5F4] transition-all", children: "Voltar ao Dashboard" })] })] }) }));
        }
        return this.props.children;
    }
}
