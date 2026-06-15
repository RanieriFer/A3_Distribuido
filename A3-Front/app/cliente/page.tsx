"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import LivroCardCliente, { LivroCliente } from "@/components/LivroCardCliente";
import ReservaModal from "@/components/ReservaModal";
// IMPORTAMOS O NOVO MODAL EXCLUSIVO DO CLIENTE
import LivroDetalhesClienteModal from "@/components/LivroDetalhesClienteModal";

export default function CatalogoCliente() {
  const [livros, setLivros] = useState<LivroCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [livroDetalhes, setLivroDetalhes] = useState<LivroCliente | null>(null);
  const [livroParaReservar, setLivroParaReservar] =
    useState<LivroCliente | null>(null);

  useEffect(() => {
    let montado = true;
    const fetchAcervo = async () => {
      setLoading(true);
      try {
        const dados = await api.getLivros();
        if (montado) {
          if (Array.isArray(dados)) setLivros(dados);
          else if (dados && Array.isArray(dados.livros))
            setLivros(dados.livros);
          else setLivros([]);
        }
      } catch (error) {
        console.error("Erro ao carregar acervo:", error);
        if (montado) setLivros([]);
      } finally {
        if (montado) setLoading(false);
      }
    };
    fetchAcervo();
    return () => {
      montado = false;
    };
  }, []);

  const handleVerDetalhes = (id: string | number) => {
    const alvo = livros.find((l) => l.id === id);
    if (alvo) setLivroDetalhes(alvo);
  };

  const abrirModalReserva = (livro: LivroCliente) => {
    setLivroParaReservar(livro);
  };

  // ATUALIZADO PARA RECEBER O TELEFONE E MANDAR PRO BACKEND
  const salvarReserva = async (dadosReserva: {
    nomeLeitor: string;
    cpfLeitor: string;
    telefoneContato: string;
    livroId: string | number;
  }) => {
    try {
      const res = await fetch("http://localhost:5000/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosReserva),
      });

      if (res.ok) {
        alert("Reserva efetuada com sucesso!");
        setLivros((atuais) =>
          atuais.map((l) =>
            l.id === dadosReserva.livroId ? { ...l, status: "Reservado" } : l,
          ),
        );
        setLivroParaReservar(null);
      } else {
        alert("Falha ao efetuar a reserva. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao reservar:", error);
      alert("Erro de conexão ao salvar reserva.");
    }
  };

  const livrosFiltrados = livros.filter((livro: LivroCliente) => {
    return (
      (livro.titulo || "").toLowerCase().includes(busca.toLowerCase()) ||
      (livro.autor || "").toLowerCase().includes(busca.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="text-center max-w-2xl mx-auto mb-12 mt-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Catálogo da Biblioteca
        </h1>
        <p className="text-gray-500 text-lg">
          Encontre seu próximo livro favorito, leia a sinopse e reserve online
          para retirar no balcão.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-10">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex">
          <input
            type="text"
            placeholder="Pesquisar por título ou autor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-3 rounded-xl focus:outline-none text-gray-700"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse font-medium">
          Buscando livros...
        </div>
      ) : livrosFiltrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed font-medium max-w-3xl mx-auto">
          Nenhum livro encontrado para sua busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {livrosFiltrados.map((livro: LivroCliente) => (
            <LivroCardCliente
              key={livro.id}
              livro={livro}
              onVerDetalhes={handleVerDetalhes}
              onReservar={abrirModalReserva}
            />
          ))}
        </div>
      )}

      {/* MODAL LIMPO, APENAS LEITURA */}
      <LivroDetalhesClienteModal
        isOpen={!!livroDetalhes}
        livro={livroDetalhes}
        onClose={() => setLivroDetalhes(null)}
      />

      <ReservaModal
        isOpen={!!livroParaReservar}
        livro={livroParaReservar}
        onClose={() => setLivroParaReservar(null)}
        onSave={salvarReserva}
      />
    </div>
  );
}
