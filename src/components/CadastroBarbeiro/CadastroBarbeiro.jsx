import React, { useState } from 'react';
import './CadastroBarbeiro.css';

function CadastroBarbeiro({ barbeiros = [], setBarbeiros }) {

  const [novoNome, setNovoNome] = useState('');
  const [novoCelular, setNovoCelular] = useState('');
  const [selectedBarbeiro, setSelectedBarbeiro] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Novo estado para controlar o modo de edição

  const generateNewId = () => {
    // Garante que o ID seja gerado corretamente, mesmo se a lista estiver vazia
    const lastId = barbeiros.length > 0 
      ? Math.max(...barbeiros.map(b => parseInt(b.id, 10)))
      : 0;
    const newIdNum = lastId + 1;
    return String(newIdNum).padStart(2, '0');
  };

  const clearForm = () => {
    setNovoNome('');
    setNovoCelular('');
    setSelectedBarbeiro(null);
    setIsEditing(false);
  };

  const handleSaveBarbeiro = () => {
    if (!novoNome.trim() || !novoCelular.trim()) {
      alert('Por favor, preencha o nome e o celular do barbeiro.');
      return;
    }

    if (selectedBarbeiro && isEditing) {
      // Lógica de Alteração
      setBarbeiros(barbeiros.map(barbeiro =>
        barbeiro.id === selectedBarbeiro.id
          ? { ...barbeiro, nome: novoNome, celular: novoCelular }
          : barbeiro
      ));
    } else if (!selectedBarbeiro && !isEditing) {
      // Lógica de Novo Cadastro (só funciona se não houver nada selecionado e não estiver editando)
      const newId = generateNewId();
      setBarbeiros([...barbeiros, { id: newId, nome: novoNome, celular: novoCelular }]);
    }
    
    clearForm();
  };

  const handleSelectBarbeiro = (barbeiro) => {
    // Se clicar no item já selecionado, desmarca tudo (comportamento de toggle)
    if (selectedBarbeiro && selectedBarbeiro.id === barbeiro.id) {
      clearForm();
    } else {
      // Quando seleciona, apenas marca o barbeiro. 
      // Os campos de input continuam vazios para um novo cadastro
      setSelectedBarbeiro(barbeiro);
      setNovoNome(''); // Garante que o nome fique vazio
      setNovoCelular(''); // Garante que o celular fique vazio
      setIsEditing(false);
    }
  };

  const handleAlterarBarbeiro = () => {
    if (selectedBarbeiro) {
      // 1. Entra no modo de edição
      setIsEditing(true);
      // 2. PREENCHE os campos com os dados do barbeiro selecionado
      setNovoNome(selectedBarbeiro.nome);
      setNovoCelular(selectedBarbeiro.celular);
    } else {
      alert('Selecione um barbeiro para alterar.');
    }
  };

  const handleExcluirBarbeiro = () => {
    if (!selectedBarbeiro) {
      alert('Selecione um barbeiro para excluir.');
      return;
    }
    // IMPORTANTE: Evitar window.confirm() em produção, usar modal customizado
    if (window.confirm(`Tem certeza que deseja excluir o barbeiro ${selectedBarbeiro.nome}?`)) {
      setBarbeiros(barbeiros.filter(barbeiro => barbeiro.id !== selectedBarbeiro.id));
      clearForm();
    }
  };

  const handleCancelEdit = () => {
    // Volta ao estado inicial, limpando o formulário e o barbeiro selecionado
    clearForm();
  };

  // Determina o valor do campo Código: ID do selecionado se estiver editando, ou um novo ID
  const codigoValue = selectedBarbeiro ? selectedBarbeiro.id : generateNewId();

  return (
    <div className="cadastro-barbeiro-container page-content">
      <div className="cadastro-barbeiro-content">
        <header className="cadastro-header">
          <h2>Cadastro de Barbeiro</h2>
        </header>

        <section className="form-section">
          <div className="form-group">
            <label htmlFor="codigo-barbeiro">Código</label>
            <input 
              type="text" 
              id="codigo-barbeiro" 
              value={codigoValue} 
              readOnly 
            />
          </div>
          <div className="form-group nome-group">
            <label htmlFor="nome-barbeiro">Nome *</label>
            <input 
              type="text" 
              id="nome-barbeiro" 
              placeholder="Digite aqui" 
              value={novoNome} 
              onChange={(e) => setNovoNome(e.target.value)}
              // Campo editável apenas se for novo cadastro ou estiver em modo de edição
              readOnly={selectedBarbeiro !== null && !isEditing}
            />
          </div>
          <div className="form-group celular-group">
            <label htmlFor="celular-barbeiro">Celular/Whatsapp</label>
            <input 
              type="text" 
              id="celular-barbeiro" 
              placeholder="(99) 9 9999-9999" 
              value={novoCelular} 
              onChange={(e) => setNovoCelular(e.target.value)}
              // Campo editável apenas se for novo cadastro ou estiver em modo de edição
              readOnly={selectedBarbeiro !== null && !isEditing}
            />
          </div>
        </section>

        <section className="action-buttons">
          <button 
            className="btn-save" 
            onClick={handleSaveBarbeiro}
            // Desabilita o Gravar se houver seleção E não estiver editando (forçando o clique em Alterar)
            disabled={selectedBarbeiro !== null && !isEditing}
          >
            {isEditing ? 'Confirmar Alteração' : 'Gravar'}
          </button>
          {(isEditing || selectedBarbeiro) && (
            <button className="btn-cancel" onClick={handleCancelEdit}>
              {isEditing ? 'Cancelar Edição' : 'Limpar Seleção'}
            </button>
          )}
        </section>

        <section className="barbeiros-list-section">
          <h3>Barbeiros</h3>
          <div className="list-buttons-container">
            <div className="list-buttons">
              <button 
                className="btn-edit" 
                onClick={handleAlterarBarbeiro} 
                // Desabilitado se não houver seleção OU se já estiver editando
                disabled={!selectedBarbeiro || isEditing} 
              >
                Alterar
              </button>
              <button 
                className="btn-delete" 
                onClick={handleExcluirBarbeiro} 
                disabled={!selectedBarbeiro || isEditing}
              >
                Excluir
              </button>
            </div>
          </div>
        </section>

        <div className="barbeiros-list">
          {barbeiros.map((barbeiro) => (
            <div 
              key={barbeiro.id} 
              className={`barbeiro-item ${selectedBarbeiro && selectedBarbeiro.id === barbeiro.id ? 'selected' : ''}`}
              onClick={() => handleSelectBarbeiro(barbeiro)}
            >
              <input 
                type="radio" 
                name="select-barbeiro" 
                checked={selectedBarbeiro && selectedBarbeiro.id === barbeiro.id} 
                readOnly 
              />
              <div className="barbeiro-info">
                <span className="barbeiro-codigo">{barbeiro.id}</span>
                <span className="barbeiro-nome">{barbeiro.nome}</span>
                <span className="barbeiro-celular">{barbeiro.celular}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CadastroBarbeiro;
