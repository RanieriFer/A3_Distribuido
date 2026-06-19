'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SucessoModal from '@/components/SucessoModal'; // Importado

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  
  // Estados para controlar o modal de sucesso após autenticação
  const [exibirSucesso, setExibirSucesso] = useState(false);
  const [dadosUsuario, setDadosUsuario] = useState<{nome: string, role: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('@biblioteca:token', data.token);
        localStorage.setItem('@biblioteca:user', JSON.stringify(data.usuario));

        // Guarda os dados temporariamente para exibir no modal antes de redirecionar
        setDadosUsuario(data.usuario);
        setExibirSucesso(true);
      } else {
        setErro(data.erro || "E-mail ou senha incorretos.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Trata a navegação após o usuário clicar em "Entendido!" no modal de sucesso
  const fecharModalEDirecionar = () => {
    setExibirSucesso(false);
    if (!dadosUsuario) return;

    if (dadosUsuario.role === 'ADMIN') {
      router.push('/admin/dashboard'); 
    } else {
      router.push('/cliente/catalogo'); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Acesse sua conta</h2>
        <p className="mt-2 text-sm text-gray-600">Entre para gerenciar seus livros ou fazer novas reservas.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <div className="mt-1">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="seu-email@exemplo.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1">
                <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••" />
              </div>
            </div>

            {erro && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{erro}</div>}

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">{loading ? "Autenticando..." : "Entrar no Sistema"}</button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Ainda não tem uma conta? </span>
            <Link href="/auth/cadastro" className="font-medium text-blue-600 hover:text-blue-500">Cadastre-se de graça</Link>
          </div>
        </div>
      </div>

      <SucessoModal 
        isOpen={exibirSucesso}
        titulo={`Olá, ${dadosUsuario?.nome || ''}!`}
        mensagem="Autenticação realizada com sucesso. Seus dados de acesso foram validados na rede distribuída."
        onClose={fecharModalEDirecionar}
      />
    </div>
  );
}