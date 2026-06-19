import Image from 'next/image';
import React from 'react';

interface LivroCardProps {
  livro: {
    id: string | number;
    titulo: string;
    autor: string | null;
    isbn: string;
    capaUrl?: string;
    status: string;
    sinopse?: string | null;
    reservas?: Array<{
      nomeLeitor: string;
      cpfLeitor: string;
    }>;
  };
  onVerDetalhes: (id: string | number) => void; // NOVO
  onAtualizar: (id: string | number) => void;
  onExcluir: (id: string | number) => void;
}

export default function LivroCard({ livro, onVerDetalhes, onAtualizar, onExcluir }: LivroCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full group">
      
      {/* Container da Imagem (Agora com cursor-pointer e onClick) */}
      <div 
        onClick={() => onVerDetalhes(livro.id)}
        className="relative h-72 w-full bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
      >
        {livro.capaUrl ? (
          <Image
            src={livro.capaUrl}
            alt={`Capa de ${livro.titulo}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={!livro.capaUrl.includes('cloudinary')}
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs uppercase tracking-wider">Sem Capa</span>
          </div>
        )}

        {/* Badge de Status */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm border backdrop-blur-md ${
            livro.status.toLowerCase() === "disponivel"
              ? "bg-green-50/90 text-green-700 border-green-200"
              : livro.status.toLowerCase() === "emprestado"
              ? "bg-red-50/90 text-red-700 border-red-200"
              : "bg-yellow-50/90 text-yellow-800 border-yellow-200"
          }`}
        >
          {livro.status}
        </span>
      </div>

      {/* Informações do Livro */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2" title={livro.titulo}>
            {livro.titulo}
          </h3>
          <p className="text-sm text-gray-500 mt-1 truncate" title={livro.autor || 'Autor Desconhecido'}>
            {livro.autor || 'Autor Desconhecido'}
          </p>

          {/* Identificador de quem reservou */}
          {livro.status.toLowerCase() === "reservado" && livro.reservas && livro.reservas.length > 0 && (
            <div className="mt-2 text-xs font-medium px-2 py-1.5 rounded-md border bg-yellow-50 text-yellow-800 border-yellow-100 w-full">
              <span className="font-bold block text-gray-700">Reservado para:</span>
              <span className="block truncate mt-0.5">{livro.reservas[0].nomeLeitor}</span>
              <span className="block text-[10px] text-gray-500 font-normal mt-0.5">
                CPF: {livro.reservas[0].cpfLeitor}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé do Card */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-400 font-mono布">
            ISBN: {livro.isbn}
          </div>
          
          <div className="flex gap-1.5">
            {/* NOVO: Botão de Ver Detalhes (Olho) */}
            <button
              onClick={() => onVerDetalhes(livro.id)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              title="Ver Detalhes e Ações"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            <button
              onClick={() => onAtualizar(livro.id)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Editar Livro"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            
            <button
              onClick={() => onExcluir(livro.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Excluir Livro"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}