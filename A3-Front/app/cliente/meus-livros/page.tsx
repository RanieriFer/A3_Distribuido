'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmacaoModal from '@/components/ConfirmModal';

// O formato que esperamos receber do banco de dados
interface LivroReservado {
  id: number;
  dataReserva: string;
  statusReserva: string;
  livro: {
    titulo: string;
    autor: string;
    capaUrl?: string;
  };
}

export default function MeusLivros() {
  const router = useRouter();
  
  // ESTADOS DE CONTROLE
  const [autorizado, setAutorizado] = useState(false);
  const [reservas, setReservas] = useState<LivroReservado[]>([]);
  const [loading, setLoading] = useState(true);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [modalSairAberto, setModalSairAberto] = useState(false);

  // 🛡️ SEGURANÇA DA PORTA: Checa o token antes de desenhar a tela
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

  // 📡 BUSCA OS DADOS REAIS NO BACK-END
  useEffect(() => {
    if (!autorizado) return;

    const fetchMeusLivros = async () => {
      setLoading(true);
      try {
        const userJson = localStorage.getItem('@biblioteca:user');
        const token = localStorage.getItem('@biblioteca:token');
        
        if (!userJson || !token) return;
        
        const user = JSON.parse(userJson);

        // Faz a requisição real para a rota que vamos criar no Back-end
        const res = await fetch(`http://localhost:5000/reservas/usuario/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Mandando o "crachá" na requisição!
          }
        });

        if (res.ok) {
          const dados = await res.json();
          setReservas(dados);
        } else {
          setReservas([]);
        }
      } catch (error) {
        console.error("Erro ao buscar reservas:", error);
        setReservas([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeusLivros();
  }, [autorizado]);

  // Função real de logout
  const confirmarLogout = () => {
    localStorage.removeItem('@biblioteca:token');
    localStorage.removeItem('@biblioteca:user');
    router.push('/auth/login');
  };

  // BARREIRA VISUAL: Enquanto checa o login, exibe tela limpa
  if (!autorizado) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* NAVBAR SUPERIOR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-blue-600 tracking-tight">📚 MinhaBiblioteca</span>
          <Link href="/cliente/catalogo" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            Voltar ao Catálogo
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

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Livros Reservados</h1>
        <p className="text-gray-500 mb-8">Confira abaixo os exemplares que você reservou e o status de retirada.</p>

        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse font-medium">Carregando suas reservas...</div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8 max-w-lg mx-auto">
            <p className="text-gray-400 font-medium mb-4">Você ainda não reservou nenhum livro.</p>
            <Link href="/cliente/catalogo" className="inline-flex justify-center py-2.5 px-5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center hover:shadow-md transition-shadow">
                {reserva.livro.capaUrl ? (
                  <img src={reserva.livro.capaUrl} alt={reserva.livro.titulo} className="w-16 h-24 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">Sem capa</div>
                )}
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{reserva.livro.titulo}</h3>
                  <p className="text-gray-500 text-sm mb-2">{reserva.livro.autor || "Autor Desconhecido"}</p>
                  <p className="text-xs text-gray-400">
                    Reservado em: {new Date(reserva.dataReserva).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                    reserva.statusReserva === 'PENDENTE' ? 'bg-amber-100 text-amber-800' : 
                    reserva.statusReserva === 'DEVOLVIDO' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'
                  }`}>
                    {reserva.statusReserva}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE SAÍDA */}
      <ConfirmacaoModal
        isOpen={modalSairAberto}
        titulo="Sair do sistema?"
        mensagem="Você precisará fazer login novamente para reservar novos livros."
        textoConfirmar="Sim, sair agora"
        textoCancelar="Cancelar"
        onConfirm={confirmarLogout}
        onCancel={() => setModalSairAberto(false)}
      />
    </div>
  );
}