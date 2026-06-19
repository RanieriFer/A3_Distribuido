import React from 'react';

interface ConfirmacaoModalProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmacaoModal({ 
  isOpen, 
  titulo, 
  mensagem, 
  textoConfirmar = "Confirmar", 
  textoCancelar = "Cancelar", 
  onConfirm, 
  onCancel 
}: ConfirmacaoModalProps) {
  if (!isOpen) return null;

  return (
    // backdrop-blur-sm adiciona um desfoque lindo no fundo da tela
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Caixa do Modal com cantos super arredondados (3xl) */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Ícone de Atenção Minimalista */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 mb-4">
          <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        {/* Título e Texto */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{titulo}</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed px-2">
          {mensagem}
        </p>

        {/* Botões Modernos e Grandes (Toque amigável) */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 w-full">
          <button
            onClick={onCancel}
            className="w-full sm:flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl border border-gray-200/60 transition-colors text-sm"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-colors shadow-sm shadow-blue-200 text-sm font-medium"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}