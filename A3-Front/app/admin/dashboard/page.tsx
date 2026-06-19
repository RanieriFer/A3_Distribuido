'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
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

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

export default function GestaoAcervo() {
  const router = useRouter();

  // --- ESTADOS ---
  const [autorizado, setAutorizado] = useState(false);
  const [nomeAdmin, setNomeAdmin] = useState('');
  const [modalSairAberto, setModalSairAberto] = useState(false);
  const [notificacaoPopup, setNotificacaoPopup] = useState<string | null>(null);
  
  // Estados de Notificações Laterais
  const [notificacoesModalAberto, setNotificacoesModalAberto] = useState(false);
  const [notificacoesLista, setNotificacoesLista] = useState<Notificacao[]>([]);

  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  
  const [livroEditando, setLivroEditando] = useState<LivroEditando | null>(null);
  const [modalAddAberto, setModalAddAberto] = useState(false);
  const [livroDetalhes, setLivroDetalhes] = useState<Livro | null>(null);
  const [propostaStatus, setPropostaStatus] = useState<{ id: string | number; novoStatus: string } | null>(null);
  const [livroParaExcluir, setLivroParaExcluir] = useState<string | number | null>(null);

  // 🛡️ SEGURANÇA E LOGIN
  useEffect(() => {
    const token = localStorage.getItem('@biblioteca:token');
    const userJson = localStorage.getItem('@biblioteca:user');
    
    if (!token) {
      router.push('/auth/login');
    } else {
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user.role !== 'ADMIN') {
          router.push('/cliente/catalogo');
          return;
        }
        setNomeAdmin(user.nome);
      }
      setAutorizado(true);
    }
  }, [router]);

  async function carregarDadosIniciais() {
    try {
      setLoading(true);
      // Busca Livros
      const dados = await api.getLivros(); 
      if (Array.isArray(dados)) setLivros(dados);
      else if (dados && Array.isArray(dados.livros)) setLivros(dados.livros);
      else setLivros([]);

      // Busca Notificações Iniciais
      const notifRes = await fetch("http://localhost:5000/notificacoes");
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotificacoesLista(notifData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // 📡 WEBSOCKET E BUSCA INICIAL
  useEffect(() => {
    if (!autorizado) return;
    
    carregarDadosIniciais();

    const socket = io("http://localhost:5000");

    socket.on("nova_reserva", (novaNotificacao: Notificacao) => {
      // Exibe o popup no topo
      setNotificacaoPopup(novaNotificacao.mensagem);
      
      // Adiciona na lista do menu lateral (no topo)
      setNotificacoesLista((atuais) => [novaNotificacao, ...atuais]);
      
      // Atualiza os livros para mudar o status
      api.getLivros().then(dados => {
        if (Array.isArray(dados)) setLivros(dados);
        else if (dados && Array.isArray(dados.livros)) setLivros(dados.livros);
      });

      setTimeout(() => setNotificacaoPopup(null), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [autorizado]);

  const handleLogout = () => {
    localStorage.removeItem('@biblioteca:token');
    localStorage.removeItem('@biblioteca:user');
    router.push('/auth/login');
  };

  // 🗑️ DELETAR NOTIFICAÇÃO
  const deletarNotificacao = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/notificacoes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setNotificacoesLista(notificacoesLista.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar notificação");
    }
  };

  // --- LÓGICAS DE EXCLUSÃO ---
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
        sinopse: livroAlvo.sinopse 
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

  // --- LÓGICA DE DETALHES E STATUS ---
  const handleVerDetalhes = (id: string | number) => {
    const alvo = livros.find((l) => l.id === id);
    if (alvo) setLivroDetalhes(alvo);
  };

  const gatilhoSalvarStatus = (id: string | number, novoStatus: string) => {
    setPropostaStatus({ id, novoStatus });
  };

  const confirmarAlteracaoStatus = async () => {
    if (!propostaStatus) return;
    try {
      await fetch(`http://localhost:5000/livros/${propostaStatus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: propostaStatus.novoStatus })
      });

      setLivros((atuais) => atuais.map((l) => 
        l.id === propostaStatus.id ? { ...l, status: propostaStatus.novoStatus } : l
      ));

      setPropostaStatus(null);
      setLivroDetalhes(null);
    } catch (error) {
      alert("Erro ao salvar alteração de status.");
    }
  };

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

  if (!autorizado) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative overflow-hidden">
      
      {/* 🔔 TOAST DE NOTIFICAÇÃO WEBSOCKET POPUP */}
      {notificacaoPopup && (
        <div className="fixed top-6 right-6 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-bounce flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <p className="font-medium">{notificacaoPopup}</p>
        </div>
      )}

      {/* NAVBAR SUPERIOR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center mb-8 relative z-20">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-blue-600 tracking-tight">AdminBiblioteca</span>
        </div>
        <div className="flex items-center gap-4">
          
          {/* BOTÃO DO SINO DE NOTIFICAÇÃO MODERNIZADO */}
          <button 
            onClick={() => setNotificacoesModalAberto(true)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {notificacoesLista.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {notificacoesLista.length}
              </span>
            )}
          </button>

          {nomeAdmin && <span className="text-sm font-medium text-gray-600 hidden sm:inline border-l pl-4 border-gray-200">Admin: {nomeAdmin}</span>}
          <button 
            onClick={() => setModalSairAberto(true)} 
            className="text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors ml-2"
          >
            Sair
          </button>
        </div>
      </nav>

      {/* 🟢 MENU LATERAL DE NOTIFICAÇÕES (DRAWER) */}
      {notificacoesModalAberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay escuro de fundo */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setNotificacoesModalAberto(false)}
          ></div>
          
          {/* Painel lateral */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                Notificações
              </h2>
              <button 
                onClick={() => setNotificacoesModalAberto(false)}
                className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm border border-gray-200 flex items-center justify-center w-8 h-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notificacoesLista.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Nenhuma notificação nova.</div>
              ) : (
                notificacoesLista.map((notif) => (
                  <div key={notif.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow flex justify-between items-start gap-3 transition-shadow">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium leading-snug">{notif.mensagem}</p>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {new Date(notif.createdAt).toLocaleDateString('pt-BR')} às {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {/* BOTÃO DA LIXEIRA MODERNIZADO */}
                    <button 
                      onClick={() => deletarNotificacao(notif.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                      title="Apagar notificação"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA PÁGINA */}
      <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestão do Acervo</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie exemplares, sinopses e controle status de leitores.</p>
          </div>
          <button onClick={() => setModalAddAberto(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Adicionar Livro
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Buscar por título, autor, ISBN..." 
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
      </div>

      {/* MODAIS */}
      <LivroDetalhesModal isOpen={!!livroDetalhes} livro={livroDetalhes} onClose={() => setLivroDetalhes(null)} onSaveStatus={gatilhoSalvarStatus} />
      <LivroModal isOpen={!!livroEditando} livro={livroEditando} onClose={() => setLivroEditando(null)} onSave={salvarEdicao} />
      <LivroAddModal isOpen={modalAddAberto} onClose={() => setModalAddAberto(false)} onSave={handleCadastrar} />

      <ConfirmModal 
        isOpen={!!livroParaExcluir}
        titulo="Excluir Exemplar"
        mensagem="Tem certeza que deseja apagar este livro permanentemente da base Neon?"
        onConfirm={confirmarExclusao}
        onCancel={() => setLivroParaExcluir(null)}
      />

      <ConfirmModal 
        isOpen={!!propostaStatus}
        titulo="Alterar Status do Livro"
        mensagem={`Deseja confirmar a alteração do status deste livro para "${propostaStatus?.novoStatus}"? Isso atualizará o fluxo da biblioteca.`}
        textoConfirmar="Confirmar Mudança"
        onConfirm={confirmarAlteracaoStatus}
        onCancel={() => setPropostaStatus(null)}
      />

      <ConfirmModal
        isOpen={modalSairAberto}
        titulo="Sair do sistema Admin?"
        mensagem="Você precisará fazer login novamente para acessar a gestão do acervo."
        textoConfirmar="Sim, sair agora"
        onConfirm={handleLogout}
        onCancel={() => setModalSairAberto(false)}
      />
      
    </div>
  );
}