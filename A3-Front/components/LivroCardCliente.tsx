import React from "react";

// 1. CRIAMOS O MOLDE PARA TIRAR O "ANY"
// 1. ATUALIZAMOS O MOLDE PARA INCLUIR A SINOPSE E O ISBN
export interface LivroCliente {
  id: string | number;
  titulo: string;
  autor: string;
  capaUrl?: string;
  status?: string;
  sinopse?: string; // <-- ADICIONADO
  isbn?: string; // <-- ADICIONADO
}

interface LivroCardClienteProps {
  livro: LivroCliente;
  onReservar: (livro: LivroCliente) => void;
  onVerDetalhes: (id: string | number) => void;
}

export default function LivroCardCliente({
  livro,
  onReservar,
  onVerDetalhes,
}: LivroCardClienteProps) {
  const statusColors: Record<string, string> = {
    DISPONIVEL: "bg-green-100 text-green-800 border-green-200",
    EMPRESTADO: "bg-yellow-100 text-yellow-800 border-yellow-200",
    RESERVADO: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const statusFormatado = livro.status?.toUpperCase() || "DESCONHECIDO";
  const corStatus =
    statusColors[statusFormatado] ||
    "bg-gray-100 text-gray-800 border-gray-200";
  const isDisponivel = statusFormatado === "DISPONIVEL";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div
        className="h-56 bg-gray-100 w-full relative cursor-pointer"
        onClick={() => onVerDetalhes(livro.id)}
      >
        {livro.capaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={livro.capaUrl}
            alt={livro.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sem Capa
          </div>
        )}
        <div
          className={`absolute top-2 right-2 px-2.5 py-1 text-xs font-bold rounded-full border ${corStatus}`}
        >
          {statusFormatado}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-gray-800 line-clamp-1"
          title={livro.titulo}
        >
          {livro.titulo}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-1 mb-4">{livro.autor}</p>

        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onVerDetalhes(livro.id)}
            className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            Sinopse
          </button>

          <button
            onClick={() => onReservar(livro)}
            disabled={!isDisponivel}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDisponivel
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isDisponivel ? "Reservar" : "Indisponível"}
          </button>
        </div>
      </div>
    </div>
  );
}
