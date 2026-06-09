"use client"; // Mágica do Next.js: Diz que esta tela tem interatividade (botões, inputs)

import { useState } from "react";
import { api } from "@/services/api";

export default function CadastroLivro() {
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que a página recarregue ao apertar Enter
    if (!isbn) return;

    setLoading(true);
    setMensagem({ texto: "", tipo: "" }); // Limpa mensagens anteriores

    try {
      // Chama a nossa API que vai falar com o Node.js
      const response = await api.cadastrarLivro(isbn);
      const data = await response.json();

      if (response.ok) {
        // Se o status for 201 (Sucesso)
        setMensagem({
          texto: `Sucesso! O livro "${data.titulo}" foi adicionado ao acervo.`,
          tipo: "sucesso",
        });
        setIsbn(""); // Limpa a caixinha para o próximo livro
      } else {
        // Se o livro não for encontrado
        setMensagem({
          texto: data.erro || "Erro ao cadastrar o livro.",
          tipo: "erro",
        });
      }
    } catch (error) {
      setMensagem({
        texto: "Erro de conexão. O servidor Back-end está ligado?",
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* O "Cartão" branco no meio da tela */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📚 Cadastro Rápido
        </h1>

        <form onSubmit={handleCadastrar} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Leitor de Código de Barras (ISBN)
            </label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Ex: 9788532530783"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex justify-center"
          >
            {loading ? "A procurar na nuvem..." : "Cadastrar no Acervo"}
          </button>
        </form>

        {/* Caixinha de feedback (Verde para sucesso, Vermelha para erro) */}
        {mensagem.texto && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm font-medium text-center border ${
              mensagem.tipo === "sucesso"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {mensagem.texto}
          </div>
        )}
      </div>
    </div>
  );
}
