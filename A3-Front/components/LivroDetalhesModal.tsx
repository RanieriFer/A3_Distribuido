import React, { useState, useEffect } from 'react';

interface LivroDetalhesModalProps {
  isOpen: boolean;
  livro: any;
  onClose: () => void;
  onSaveStatus: (id: string | number, novoStatus: string) => void;
}

export default function LivroDetalhesModal({ isOpen, livro, onClose, onSaveStatus }: LivroDetalhesModalProps) {
  const [status, setStatus] = useState('Disponivel');

  useEffect(() => {
    if (livro) {
      setStatus(livro.status || 'Disponivel');
    }
  }, [livro, isOpen]);

  if (!isOpen || !livro) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Envia o status proposto para a página principal disparar a confirmação
    onSaveStatus(livro.id, status);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Ficha do Livro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✖</button>
        </div>

        {/* Conteúdo com scroll interno se necessário */}
        <div className="overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          
          {/* LADO ESQUERDO: Capa */}
          <div className="w-full md:w-44 flex-shrink-0 flex justify-center">
            <div className="w-40 h-60 bg-gray-100 rounded-xl shadow-sm border overflow-hidden relative">
              {livro.capaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={livro.capaUrl} alt={livro.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold uppercase">Sem Capa</div>
              )}
            </div>
          </div>

          {/* LADO DIREITO: Informações */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">{livro.titulo}</h3>
              <p className="text-md text-gray-600 font-medium mt-1">Por: {livro.autor || 'Autor Desconhecido'}</p>
              <div className="text-xs text-gray-400 font-mono mt-1">ISBN: {livro.isbn}</div>
              
              {/* Bloco de Sinopse */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Sinopse</h4>
                <p className="text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto pr-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {livro.sinopse || 'Nenhuma sinopse disponível para este exemplar.'}
                </p>
              </div>

              {/* Bloco de Informações da Reserva (Se houver) */}
              {livro.reservas && livro.reservas.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-800 mb-1">Reserva Ativa</h4>
                  <p className="text-sm text-gray-700 font-medium">{livro.reservas[0].nomeLeitor}</p>
                  <p className="text-xs text-gray-500 mt-0.5">CPF: {livro.reservas[0].cpfLeitor}</p>
                </div>
              )}
            </div>

            {/* FORMULÁRIO DE CONTROLE DE STATUS */}
            <form onSubmit={handleSubmit} className="border-t pt-4 flex flex-col sm:flex-row items-end gap-3 justify-between">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Alterar Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full sm:w-48 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
                >
                  <option value="Disponivel">🟢 Disponível</option>
                  <option value="Emprestado">🔴 Emprestado</option>
                  <option value="Reservado">🟡 Reservado</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2 rounded-lg shadow-sm transition-colors h-[38px]"
              >
                Salvar Status
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}