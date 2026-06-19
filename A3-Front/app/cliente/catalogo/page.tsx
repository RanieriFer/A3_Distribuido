'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import LivroCardCliente, { LivroCliente } from '@/components/LivroCardCliente';
import LivroDetalhesClienteModal from '@/components/LivroDetalhesClienteModal'; 
import SucessoModal from '@/components/SucessoModal';
import ConfirmacaoModal from '@/components/ConfirmModal'; 
import Link from 'next/link';

export default function CatalogoCliente() {
  const router = useRouter();
  
  const [autorizado, setAutorizado] = useState(false);
  const [livros, setLivros] = useState<LivroCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [nomeUsuario, setNomeUsuario] = useState('');
  
  const [livroDetalhes, setLivroDetalhes] = useState<LivroCliente | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<{titulo: string, texto: string} | null>(null);
  
  // MODAIS DE CONTROLE
  const [modalSairAberto, setModalSairAberto] = useState(false);
  const [livroParaReservar, setLivroParaReservar] = useState<LivroCliente | null>(null); // Controla o modal de confirmação de reserva

  // 🛡️ SEGURANÇA DA PORTA
  useEffect(() => {
    const token = localStorage.getItem('@biblioteca:token');
    const userJson = localStorage.getItem('@biblioteca:user');
    
    if (!token) {
      router.push('/auth/login');
    } else {
      if (userJson) {
        const user = JSON.parse(userJson);
        setNomeUsuario(user.nome);
      }
      setAutorizado(true);
    }
  }, [router]);

  useEffect(() => {
    if (!autorizado) return;
    
    const fetchAcervo = async () => {
      setLoading(true);
      try {
        const dados = await api.getLivros(); 
        if (Array.isArray(dados)) setLivros(dados);
        else if (dados && Array.isArray(dados.livros)) setLivros(dados.livros);
        else setLivros([]);
      } catch (error) {
        setLivros([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchAcervo();
  }, [autorizado]);

  const handleLogout = () => {
    localStorage.removeItem('@biblioteca:token');
    localStorage.removeItem('@biblioteca:user');
    router.push('/auth/login');
  };

  // 🚀 NOVA FUNÇÃO: DISPARA A RESERVA REAL
  const executarReserva = async () => {
    if (!livroParaReservar) return;

    try {
      const userJson = localStorage.getItem('@biblioteca:user');
      const token = localStorage.getItem('@biblioteca:token');
      
      if (!userJson || !token) return;
      const user = JSON.parse(userJson);

      const res = await fetch("http://localhost:5000/reservas", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          usuarioId: user.id,
          livroId: livroParaReservar.id
        }),
      });

      if (res.ok) {
        // 1. Fecha o modal de confirmação
        setLivroParaReservar(null);

        // 2. Abre o modal de sucesso
        setMensagemSucesso({
          titulo: "Reserva Realizada!",
          texto: `O exemplar "${livroParaReservar.titulo}" foi reservado em seu nome. Você pode acompanhar o status em "Meus Livros".`
        });
        
        // 3. Atualiza o status do livro na tela localmente
        setLivros((atuais) => atuais.map((l) => 
          l.id === livroParaReservar.id ? { ...l, status: "RESERVADO" } : l
        ));
      } else {
        alert("Não foi possível reservar este livro. Verifique se ele já não foi reservado.");
        setLivroParaReservar(null);
      }
    } catch (error) {
      console.error("Erro ao reservar:", error);
      alert("Erro de conexão. Tente novamente.");
      setLivroParaReservar(null);
    }
  };

  const livrosFiltrados = livros.filter((livro: LivroCliente) => {
    const correspondeBusca = (livro.titulo || '').toLowerCase().includes(busca.toLowerCase()) ||
                             (livro.autor || '').toLowerCase().includes(busca.toLowerCase());
    const statusAtual = livro.status?.toUpperCase() || 'DESCONHECIDO';
    const correspondeStatus = filtroStatus === 'TODOS' || statusAtual === filtroStatus;
    return correspondeBusca && correspondeStatus;
  });

  if (!autorizado) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-blue-600 tracking-tight">📚 MinhaBiblioteca</span>
          <Link href="/cliente/meus-livros" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
            Meus Livros
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 hidden sm:inline">Olá, {nomeUsuario}</span>
          <button 
            onClick={() => setModalSairAberto(true)} 
            className="text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 mt-4">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Catálogo da Biblioteca</h1>
          <p className="text-gray-500 text-lg">Escolha um exemplar e reserve com apenas um clique.</p>
        </div>

        {/* BUSCA */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Pesquisar por título ou autor..." 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)}
              className="w-full md:flex-1 px-4 py-3 rounded-xl focus:outline-none text-gray-900"
            />
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full md:w-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="DISPONIVEL">Disponíveis</option>
              <option value="EMPRESTADO">Emprestados</option>
              <option value="RESERVADO">Reservados</option>
            </select>
          </div>
        </div>

        {/* LISTAGEM */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Carregando acervo...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {livrosFiltrados.map((livro: LivroCliente) => (
              <LivroCardCliente 
                key={livro.id} 
                livro={livro} 
                onVerDetalhes={() => setLivroDetalhes(livro)} 
                onReservar={() => setLivroParaReservar(livro)} // Abre o Modal de Confirmação
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAIS */}
      
      {/* 1. Detalhes do Livro */}
      <LivroDetalhesClienteModal 
        isOpen={!!livroDetalhes} 
        livro={livroDetalhes} 
        onClose={() => setLivroDetalhes(null)} 
      />

      {/* 2. CONFIRMAÇÃO DE RESERVA (Em vez do formulário antigo) */}
      <ConfirmacaoModal
        isOpen={!!livroParaReservar}
        titulo="Confirmar Reserva?"
        mensagem={`Deseja reservar o livro "${livroParaReservar?.titulo}"? Ele ficará disponível para retirada por 48 horas.`}
        textoConfirmar="Sim, Reservar"
        textoCancelar="Cancelar"
        onConfirm={executarReserva}
        onCancel={() => setLivroParaReservar(null)}
      />
      
      {/* 3. SUCESSO APÓS RESERVAR */}
      <SucessoModal 
        isOpen={!!mensagemSucesso}
        titulo={mensagemSucesso?.titulo || ''}
        mensagem={mensagemSucesso?.texto || ''}
        onClose={() => setMensagemSucesso(null)}
      />

      {/* 4. CONFIRMAÇÃO DE SAÍDA (LOGOUT) */}
      <ConfirmacaoModal
        isOpen={modalSairAberto}
        titulo="Sair do sistema?"
        mensagem="Você precisará fazer login novamente para acessar seu catálogo."
        textoConfirmar="Sim, sair agora"
        textoCancelar="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setModalSairAberto(false)}
      />
    </div>
  );
}