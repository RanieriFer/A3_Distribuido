import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ 
  isOpen, 
  titulo, 
  mensagem, 
  textoConfirmar = "Confirmar", 
  textoCancelar = "Cancelar", 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          
          {/* Ícone de Alerta e Título */}
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
          </div>

          <p className="text-gray-600 text-sm mb-6 ml-1">
            {mensagem}
          </p>

          {/* Botões */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button 
              onClick={onCancel} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {textoCancelar}
            </button>
            <button 
              onClick={onConfirm} 
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              {textoConfirmar}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}