import React, { useState, useEffect } from "react";
import { LivroCliente } from "./LivroCardCliente";

interface ReservaModalProps {
  isOpen: boolean;
  livro: LivroCliente | null;
  onClose: () => void;
  onSave: (dadosReserva: {
    nomeLeitor: string;
    cpfLeitor: string;
    telefoneContato: string;
    livroId: string | number;
  }) => Promise<void>;
}

// Funções utilitárias de formatação
const formatarCPF = (valor: string) => {
  // Remove tudo o que não é número e limita a 11 caracteres
  const cpf = valor.replace(/\D/g, "").slice(0, 11);

  // Aplica a máscara 000.000.000-00
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9)
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
};

const formatarTelefone = (valor: string) => {
  // Remove tudo o que não é número e limita a 11 caracteres (DDD + 9 dígitos)
  const tel = valor.replace(/\D/g, "").slice(0, 11);

  // Aplica a máscara (00) 00000-0000 ou (00) 0000-0000
  if (tel.length <= 2) return tel;
  if (tel.length <= 6) return `(${tel.slice(0, 2)}) ${tel.slice(2)}`;
  if (tel.length <= 10)
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`;
  return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
};

export default function ReservaModal({
  isOpen,
  livro,
  onClose,
  onSave,
}: ReservaModalProps) {
  const [nomeLeitor, setNomeLeitor] = useState("");
  const [cpfLeitor, setCpfLeitor] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setNomeLeitor("");
        setCpfLeitor("");
        setTelefoneContato("");
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen || !livro) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    // LIMPEZA: Remove os pontos, traços e parênteses antes de mandar para o banco
    const cpfLimpo = cpfLeitor.replace(/\D/g, "");
    const telefoneLimpo = telefoneContato.replace(/\D/g, "");

    await onSave({
      nomeLeitor,
      cpfLeitor: cpfLimpo,
      telefoneContato: telefoneLimpo,
      livroId: livro.id,
    });

    setSalvando(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Reservar Exemplar</h2>
          <p className="text-sm text-gray-500 truncate mt-1">
            Você está reservando:{" "}
            <span className="font-semibold">{livro.titulo}</span>
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seu Nome Completo
              </label>
              <input
                type="text"
                required
                value={nomeLeitor}
                onChange={(e) => setNomeLeitor(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seu CPF
              </label>
              <input
                type="text"
                required
                value={cpfLeitor}
                // Adicionamos a função de formatação no onChange
                onChange={(e) => setCpfLeitor(formatarCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                required
                value={telefoneContato}
                // Adicionamos a função de formatação no onChange
                onChange={(e) =>
                  setTelefoneContato(formatarTelefone(e.target.value))
                }
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 leading-relaxed mt-2">
              <strong>Atenção:</strong> Ao confirmar, o livro ficará separado em
              seu nome. Você tem até 48 horas para retirá-lo no balcão da
              biblioteca.
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={salvando}
                className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
