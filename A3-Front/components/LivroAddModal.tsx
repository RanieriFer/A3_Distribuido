import React, { useState, useEffect } from 'react';

interface LivroAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: any) => Promise<void>;
}

export default function LivroAddModal({ isOpen, onClose, onSave }: LivroAddModalProps) {
  const [isbn, setIsbn] = useState('');
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [sinopse, setSinopse] = useState('');
  
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [fazendoUpload, setFazendoUpload] = useState(false);

  // Limpa os campos toda vez que o modal abre/fecha
  useEffect(() => {
    if (!isOpen) {
      setIsbn('');
      setTitulo('');
      setAutor('');
      setCapaUrl('');
      setSinopse('');
      setBuscando(false);
      setFazendoUpload(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUploadCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // CAPTURA PROTEGIDA: Lendo dados do arquivo .env
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Configurações do Cloudinary não encontradas no arquivo .env");
      return;
    }

    setFazendoUpload(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setCapaUrl(data.secure_url); 
      }
    } catch (error) {
      alert("Falha ao enviar imagem.");
    } finally {
      setFazendoUpload(false);
    }
  };

  const buscarIsbn = async () => {
    if (!isbn || isbn.length < 10) return;
    setBuscando(true);
    
    // CAPTURA PROTEGIDA: Lendo a API Key do arquivo .env
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY; 

    if (!googleApiKey) {
      alert("Chave de API do Google não configurada no arquivo .env");
      setBuscando(false);
      return;
    }
    
    try {
      let tituloEncontrado = titulo;
      let autorEncontrado = autor;
      let capaEncontrada = capaUrl;
      let sinopseEncontrada = sinopse;

      // 1. Tenta a BrasilAPI primeiro (Excelente para ISBNs nacionais)
      try {
        const resBrasil = await fetch(`https://brasilapi.com.br/api/isbn/v1/${isbn}`);
        if (resBrasil.ok) {
          const data = await resBrasil.json();
          if (data.title) tituloEncontrado = data.title;
          if (data.authors && data.authors.length > 0) autorEncontrado = data.authors.join(', ');
          if (data.cover_url) capaEncontrada = data.cover_url.replace('http:', 'https:');
          if (data.synopsis) sinopseEncontrada = data.synopsis;
        }
      } catch (e) {}

      // 2. Tenta a OpenLibrary pelo ISBN
      if (!tituloEncontrado || !autorEncontrado || !capaEncontrada || !sinopseEncontrada) {
        try {
          const resOpen = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
          if (resOpen.ok) {
            const data = await resOpen.json();
            const chave = `ISBN:${isbn}`;
            if (data[chave]) {
              const info = data[chave];
              if (!tituloEncontrado && info.title) tituloEncontrado = info.title;
              if (!autorEncontrado && info.authors && info.authors.length > 0) autorEncontrado = info.authors[0].name;
              if (!capaEncontrada && info.cover) capaEncontrada = info.cover.large || info.cover.medium;
              if (!sinopseEncontrada && info.description) {
                sinopseEncontrada = typeof info.description === 'string' ? info.description : info.description.value;
              }
            }
          }
        } catch (e) {}
      }

      // 3. Tenta o Google Books pelo ISBN (Protegido por API Key oculta)
      if (!tituloEncontrado || !autorEncontrado || !capaEncontrada || !sinopseEncontrada) {
        try {
          const resG = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${googleApiKey}`);
          if (resG.ok) {
            const dataG = await resG.json();
            if (dataG.items && dataG.items.length > 0) {
              const info = dataG.items[0].volumeInfo;
              if (!tituloEncontrado && info.title) tituloEncontrado = info.title;
              if (!autorEncontrado && info.authors) autorEncontrado = info.authors.join(', ');
              if (!capaEncontrada && info.imageLinks?.thumbnail) {
                capaEncontrada = info.imageLinks.thumbnail.replace('http:', 'https:');
              }
              if (!sinopseEncontrada && info.description) sinopseEncontrada = info.description;
            }
          }
        } catch (e) {}
      }

      // 4. TRUQUE MESTRE: Vasculha 10 resultados no Google usando Título + Autor (Protegido por API Key oculta)
      if (tituloEncontrado && (!capaEncontrada || !sinopseEncontrada)) {
        try {
          const tituloLimpo = tituloEncontrado.split(':')[0].trim();
          const autorPrincipal = autorEncontrado ? autorEncontrado.split(',')[0].trim() : '';
          
          const termoBusca = `${tituloLimpo} ${autorPrincipal}`.trim();
          const queryPesquisa = encodeURIComponent(termoBusca);
          
          const urlBusca = `https://www.googleapis.com/books/v1/volumes?q=${queryPesquisa}&maxResults=10&key=${googleApiKey}`;
          const resGTitulo = await fetch(urlBusca);
          
          if (resGTitulo.ok) {
            const dataGTitulo = await resGTitulo.json();
            
            if (dataGTitulo.items && dataGTitulo.items.length > 0) {
              for (const item of dataGTitulo.items) {
                const info = item.volumeInfo;
                
                if (!capaEncontrada && info.imageLinks?.thumbnail) {
                  capaEncontrada = info.imageLinks.thumbnail.replace('http:', 'https:');
                }
                
                if (!sinopseEncontrada) {
                  if (info.description) {
                    sinopseEncontrada = info.description.replace(/(<([^>]+)>)/gi, "");
                  } else if (item.searchInfo && item.searchInfo.textSnippet) {
                    sinopseEncontrada = item.searchInfo.textSnippet.replace(/(<([^>]+)>)/gi, "");
                  }
                }

                if (capaEncontrada && sinopseEncontrada) break;
              }
            }
          }
        } catch (e) {
          console.error("Erro no fallback do Google Books:", e);
        }
      }

      setTitulo(tituloEncontrado);
      setAutor(autorEncontrado);
      setCapaUrl(capaEncontrada);
      setSinopse(sinopseEncontrada || '');

    } catch (error) {
      console.error("Erro geral na busca de ISBN", error);
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    await onSave({ isbn, titulo, autor: autor || "Autor Desconhecido", capaUrl, sinopse });
    setSalvando(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Novo Livro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✖</button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN {buscando && <span className="text-blue-500 text-xs ml-2 animate-pulse">(Buscando dados...)</span>}
              </label>
              <input type="text" required value={isbn} onChange={(e) => setIsbn(e.target.value)} onBlur={buscarIsbn} placeholder="Digite e clique fora..." className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor <span className="text-gray-400 text-xs">(Opcional)</span></label>
              <input type="text" value={autor} onChange={(e) => setAutor(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sinopse <span className="text-gray-400 text-xs">(Opcional)</span></label>
              <textarea 
                rows={3} 
                value={sinopse} 
                onChange={(e) => setSinopse(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="A sinopse será preenchida automaticamente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem de Capa {fazendoUpload && <span className="text-blue-500 text-xs ml-2 animate-pulse">(Enviando...)</span>}
              </label>
              <input type="file" accept="image/*" onChange={handleUploadCapa} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-3" />
              
              <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                {capaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={capaUrl} alt="Preview" className="w-full h-full object-contain bg-white" />
                ) : (
                  <span className="text-gray-400 text-sm">Nenhuma capa carregada</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t mt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={salvando || buscando || fazendoUpload} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg disabled:opacity-50">Cadastrar Livro</button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}