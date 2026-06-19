import React from 'react';

interface SucessoModalProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  onClose: () => void;
}

export default function SucessoModal({ isOpen, titulo, mensagem, onClose }: SucessoModalProps) {
  if (!isOpen) return null;

  return (
    // Z-index 60 para garantir que ele fique por cima de qualquer outro modal
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-6 text-center animate-in zoom-in-95 duration-200">
        
        {/* Ícone de Check Verde */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">{titulo}</h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {mensagem}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
        >
          Entendido!
        </button>
      </div>
    </div>
  );
}