'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SucessoModal from '@/components/SucessoModal'; 

const formatarCPF = (valor: string) => {
  const cpf = valor.replace(/\D/g, "").slice(0, 11);
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
};

const formatarTelefone = (valor: string) => {
  const tel = valor.replace(/\D/g, "").slice(0, 11);
  if (tel.length <= 2) return tel;
  if (tel.length <= 6) return `(${tel.slice(0, 2)}) ${tel.slice(2)}`;
  if (tel.length <= 10) return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`;
  return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
};

export default function CadastroCliente() {
  const router = useRouter();
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', cpf: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  
  const [exibirSucesso, setExibirSucesso] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') setFormData({ ...formData, [name]: formatarCPF(value) });
    else if (name === 'telefone') setFormData({ ...formData, [name]: formatarTelefone(value) });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    const cpfLimpo = formData.cpf.replace(/\D/g, "");
    const telefoneLimpo = formData.telefone.replace(/\D/g, "");

    try {
      const res = await fetch("http://localhost:5000/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, cpf: cpfLimpo, telefone: telefoneLimpo, role: "CLIENTE" }),
      });

      const data = await res.json();

      if (res.ok) {
        setExibirSucesso(true); 
      } else {
        setErro(data.erro || "Falha ao criar conta.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const fecharModalESair = () => {
    setExibirSucesso(false);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Crie sua conta</h2>
        <p className="mt-2 text-sm text-gray-600">E tenha acesso a milhares de livros em nosso catálogo.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <div className="mt-1">
                <input name="nome" type="text" required value={formData.nome} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="João da Silva" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <div className="mt-1">
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="joao@exemplo.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">CPF</label>
                <div className="mt-1">
                  <input name="cpf" type="text" required value={formData.cpf} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="000.000.000-00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <div className="mt-1">
                  <input name="telefone" type="text" required value={formData.telefone} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1">
                <input name="senha" type="password" required value={formData.senha} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="••••••••" />
              </div>
            </div>

            {erro && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{erro}</div>}

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">{loading ? "Criando conta..." : "Criar Conta"}</button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Já tem uma conta? </span>
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">Faça login aqui</Link>
          </div>
        </div>
      </div>

      <SucessoModal 
        isOpen={exibirSucesso}
        titulo="Conta Criada!"
        mensagem="Seu cadastro foi realizado com sucesso. Clique abaixo para fazer o seu primeiro login."
        onClose={fecharModalESair}
      />
    </div>
  );
}