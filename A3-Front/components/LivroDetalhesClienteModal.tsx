import React from "react";
import { LivroCliente } from "./LivroCardCliente";

interface LivroDetalhesClienteModalProps {
  isOpen: boolean;
  livro: LivroCliente | null; // <-- PRONTO! Sem o "any"
  onClose: () => void;
}

export default function LivroDetalhesClienteModal({
  isOpen,
  livro,
  onClose,
}: LivroDetalhesClienteModalProps) {
  if (!isOpen || !livro) return null;

  // ... resto do código continua igual

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Ficha do Livro</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✖
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col sm:flex-row gap-6">
          {/* Coluna da Capa */}
          <div className="w-full sm:w-1/3 flex-shrink-0">
            <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 aspect-[2/3] relative">
              {livro.capaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={livro.capaUrl}
                  alt={livro.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Sem Capa
                </div>
              )}
            </div>
          </div>

          {/* Coluna de Informações */}
          <div className="w-full sm:w-2/3 flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {livro.titulo}
            </h3>
            <p className="text-gray-600 mt-1">Por: {livro.autor}</p>
            {livro.isbn && (
              <p className="text-xs text-gray-400 mt-2 font-mono">
                ISBN: {livro.isbn}
              </p>
            )}

            <div className="mt-6 flex-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Sinopse
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-48 overflow-y-auto">
                {livro.sinopse ? (
                  <p className="text-sm text-gray-700 leading-relaxed text-justify">
                    {livro.sinopse}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Nenhuma sinopse disponível para este exemplar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
