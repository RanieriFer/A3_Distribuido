const BASE_URL = "http://localhost:5000";

export const api = {
  getLivros: async (titulo = "") => {
    const url = titulo
      ? `${BASE_URL}/livros/busca?titulo=${titulo}`
      : `${BASE_URL}/livros`;
    const response = await fetch(url);
    return response.json();
  },
  cadastrarLivro: async (isbn) => {
    const response = await fetch(`${BASE_URL}/livros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn }),
    });
    return response;
  },
};
