'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import LivroCard from '@/components/LivroCard';
import LivroModal, { LivroEditando, LivroModalData } from '@/components/LivroModal';
import LivroAddModal from '@/components/LivroAddModal';
import ConfirmModal from '@/components/ConfirmModal';
import LivroDetalhesModal from '@/components/LivroDetalhesModal';

export interface Livro {
  id: string | number;
  titulo: string;
  autor: string;
  isbn: string;
  capaUrl?: string;
  sinopse?: string;
  status: string;
  reservas?: any[];
}

export default function GestaoAcervo() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  
  // Estados para os Modais de Ação Base
  const [livroEditando, setLivroEditando] = useState<LivroEditando | null>(null);
  const [modalAddAberto, setModalAddAberto] = useState(false);
  
  // Estados para os Detalhes e Controle de Status
  const [livroDetalhes, setLivroDetalhes] = useState<Livro | null>(null);
  const [propostaStatus, setPropostaStatus] = useState<{ id: string | number; novoStatus: string } | null>(null);
  const [livroParaExcluir, setLivroParaExcluir] = useState<string | number | null>(null);

  async function carregarAcervo() {
    try {
      setLoading(true);
      const dados = await api.getLivros(); 
      if (Array.isArray(dados)) setLivros(dados);
      else if (dados && Array.isArray(dados.livros)) setLivros(dados.livros);
      else setLivros([]);
    } catch (error) {
      console.error("Erro ao carregar acervo:", error);
      setLivros([]); 
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAcervo();
  }, []);

  // --- LOGICAS DE EXCLUSÃO ---
  const handleExcluir = (id: string | number) => setLivroParaExcluir(id);
  const confirmarExclusao = async () => {
    if (!livroParaExcluir) return;
    try {
      await api.deletarLivro(livroParaExcluir);
      setLivros(livros.filter((livro) => livro.id !== livroParaExcluir));
      setLivroParaExcluir(null);
    } catch (error) {
      alert("Erro ao excluir exemplar.");
    }
  };

  // --- LÓGICAS DE EDIÇÃO ---
  const handleAtualizar = (id: string | number) => {
    const livroAlvo = livros.find((l) => l.id === id);
    if (livroAlvo) {
      setLivroEditando({
        id: livroAlvo.id,
        titulo: livroAlvo.titulo,
        autor: livroAlvo.autor,
        capaUrl: livroAlvo.capaUrl,
        sinopse: livroAlvo.sinopse // <-- ADICIONADO: Agora a sinopse vai para o Modal de Edição!
      });
    }
  };

  const salvarEdicao = async (id: string | number, dadosAtualizados: LivroModalData) => {
    try {
      await api.atualizarLivro(id, dadosAtualizados);
      setLivros((atuais) => atuais.map((l) => l.id === id ? { ...l, ...dadosAtualizados } : l));
      setLivroEditando(null);
    } catch (error) {
      alert("Erro ao atualizar dados.");
    }
  };

  // --- LÓGICA DE CADASTRO ---
  const handleCadastrar = async (dados: any) => {
    try {
      const response = await fetch("http://localhost:5000/livros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if(response.ok) {
        const novo = await response.json();
        setLivros([...livros, novo]);
        setModalAddAberto(false);
      }
    } catch (error) {
      alert("Erro ao cadastrar.");
    }
  };

  // --- LÓGICA DE DETALHES E SALVAR STATUS COM CONFIRMAÇÃO ---
  const handleVerDetalhes = (id: string | number) => {
    const alvo = livros.find((l) => l.id === id);
    if (alvo) setLivroDetalhes(alvo);
  };

  const gatilhoSalvarStatus = (id: string | number, novoStatus: string) => {
    // Apenas intercepta o salvamento e arma o Modal de Confirmação
    setPropostaStatus({ id, novoStatus });
  };

  const confirmarAlteracaoStatus = async () => {
    if (!propostaStatus) return;
    try {
      // Faz o update para a API do Back-end atualizar no banco Neon
      await fetch(`http://localhost:5000/livros/${propostaStatus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: propostaStatus.novoStatus })
      });

      // Atualiza a lista local na tela
      setLivros((atuais) => atuais.map((l) => 
        l.id === propostaStatus.id ? { ...l, status: propostaStatus.novoStatus } : l
      ));

      // Fecha as confirmações e limpa estados
      setPropostaStatus(null);
      setLivroDetalhes(null);
    } catch (error) {
      alert("Erro ao salvar alteração de status.");
    }
  };

  // --- FILTRAGEM INTELIGENTE (BÚSSOLA POR LIVRO OU LEITOR) ---
  const listaSegura = Array.isArray(livros) ? livros : [];
  const livrosFiltrados = listaSegura.filter((livro: any) => {
    const correspondeBuscaBase = 
      (livro.titulo || '').toLowerCase().includes(busca.toLowerCase()) ||
      (livro.autor || '').toLowerCase().includes(busca.toLowerCase()) ||
      (livro.isbn || '').includes(busca);

    const reservaVinculada = livro.reservas && livro.reservas[0];
    const correspondeReserva = reservaVinculada 
      ? (reservaVinculada.nomeLeitor || '').toLowerCase().includes(busca.toLowerCase()) ||
        (reservaVinculada.cpfLeitor || '').includes(busca)
      : false;

    const correspondeStatus = 
      filtroStatus === 'TODOS' || livro.status.toLowerCase() === filtroStatus.toLowerCase();

    return (correspondeBuscaBase || correspondeReserva) && correspondeStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestão do Acervo</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie exemplares, sinopses e controle status de leitores.</p>
        </div>
        <button onClick={() => setModalAddAberto(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <span>+</span> Adicionar Livro
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Buscar por título, autor, ISBN, nome ou CPF do leitor..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full md:flex-1 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <select 
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="w-full md:w-48 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-medium text-gray-700"
        >
          <option value="TODOS">Todos os Status</option>
          <option value="DISPONIVEL">Disponíveis</option>
          <option value="EMPRESTADO">Emprestados</option>
          <option value="RESERVADO">Reservados</option>
        </select>
      </div>

      {/* GRELHA DE LIVROS */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Carregando acervo...</div>
      ) : livrosFiltrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed font-medium">Nenhum exemplar localizado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {livrosFiltrados.map((livro: Livro) => (
            <LivroCard 
              key={livro.id} 
              livro={livro} 
              onVerDetalhes={handleVerDetalhes} 
              onAtualizar={handleAtualizar}
              onExcluir={handleExcluir}
            />
          ))}
        </div>
      )}

      {/* MODAL DE FICHA DETALHADA */}
      <LivroDetalhesModal 
        isOpen={!!livroDetalhes}
        livro={livroDetalhes}
        onClose={() => setLivroDetalhes(null)}
        onSaveStatus={gatilhoSalvarStatus}
      />

      {/* MODAL DE EDIÇÃO CADASTRAL */}
      <LivroModal isOpen={!!livroEditando} livro={livroEditando} onClose={() => setLivroEditando(null)} onSave={salvarEdicao} />

      {/* MODAL DE CADASTRO COM ISBN */}
      <LivroAddModal isOpen={modalAddAberto} onClose={() => setModalAddAberto(false)} onSave={handleCadastrar} />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmModal 
        isOpen={!!livroParaExcluir}
        titulo="Excluir Exemplar"
        mensagem="Tem certeza que deseja apagar este livro permanentemente da base Neon?"
        onConfirm={confirmarExclusao}
        onCancel={() => setLivroParaExcluir(null)}
      />

      {/* MODAL DE CONFIRMAÇÃO DE STATUS */}
      <ConfirmModal 
        isOpen={!!propostaStatus}
        titulo="Alterar Status do Livro"
        mensagem={`Deseja confirmar a alteração do status deste livro para "${propostaStatus?.novoStatus}"? Isso atualizará o fluxo da biblioteca.`}
        textoConfirmar="Confirmar Mudança"
        onConfirm={confirmarAlteracaoStatus}
        onCancel={() => setPropostaStatus(null)}
      />
      
    </div>
  );
}