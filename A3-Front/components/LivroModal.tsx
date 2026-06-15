import React, { useState, useEffect } from 'react';

export interface LivroEditando {
  id: string | number;
  titulo: string;
  autor: string;
  capaUrl?: string;
  sinopse?: string; // NOVO CAMPO
}

export interface LivroModalData {
  titulo: string;
  autor: string;
  capaUrl: string;
  sinopse: string; // NOVO CAMPO
}

interface LivroModalProps {
  isOpen: boolean;
  livro: LivroEditando | null;
  onClose: () => void;
  onSave: (id: string | number, dados: LivroModalData) => Promise<void>;
}

export default function LivroModal({ isOpen, livro, onClose, onSave }: LivroModalProps) {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [sinopse, setSinopse] = useState(''); // NOVO ESTADO
  const [salvando, setSalvando] = useState(false);
  const [fazendoUpload, setFazendoUpload] = useState(false);

  useEffect(() => {
    if (isOpen && livro) {
      setTitulo(livro.titulo || '');
      setAutor(livro.autor || '');
      setCapaUrl(livro.capaUrl || '');
      setSinopse(livro.sinopse || ''); // Preenche a sinopse se existir
    } else if (!isOpen) {
      setTitulo('');
      setAutor('');
      setCapaUrl('');
      setSinopse(''); // Limpa a sinopse
    }
  }, [isOpen, livro]);

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
      alert("Falha ao enviar a nova imagem para a nuvem.");
    } finally {
      setFazendoUpload(false);
    }
  };

  if (!isOpen || !livro) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    // Envia a sinopse junto no onSave
    await onSave(livro.id, { titulo, autor, capaUrl, sinopse });
    setSalvando(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Editar Livro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✖</button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor <span className="text-gray-400 text-xs">(Opcional)</span></label>
              <input type="text" value={autor} onChange={(e) => setAutor(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* NOVO CAMPO DE SINOPSE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sinopse <span className="text-gray-400 text-xs">(Opcional)</span></label>
              <textarea 
                rows={4} 
                value={sinopse} 
                onChange={(e) => setSinopse(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alterar Capa {fazendoUpload && <span className="text-blue-500 text-xs ml-2 animate-pulse">(Atualizando...)</span>}
              </label>
              
              <input type="file" accept="image/*" onChange={handleUploadCapa} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-3" />
              
              <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                {capaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={capaUrl} alt="Capa atual" className="w-full h-full object-contain bg-white" />
                ) : (
                  <span className="text-gray-400 text-sm">Nenhuma capa cadastrada</span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-2">
              <button type="button" onClick={onClose} disabled={salvando || fazendoUpload} className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={salvando || fazendoUpload} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">Salvar Alterações</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}