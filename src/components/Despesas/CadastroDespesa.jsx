import React, { useState } from 'react';
import './CadastroDespesa.css';

function CadastroDespesa({ despesas = [], setDespesas }) {
  const [formState, setFormState] = useState({
    descricao: '',
    valor: '',
    data: '',
    categoria: 'Diversos', // Categoria padrão
  });

  const [selectedDespesa, setSelectedDespesa] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const clearForm = () => {
    setFormState({
      descricao: '',
      valor: '',
      data: '',
      categoria: 'Diversos',
    });
    setSelectedDespesa(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!formState.descricao || !formState.valor || !formState.data) {
      alert('Por favor, preencha Descrição, Valor e Data.');
      return;
    }

    const valorNumerico = parseFloat(formState.valor.replace(',', '.'));

    if (isEditing && selectedDespesa) {
      // Lógica de Alteração
      setDespesas(despesas.map(d =>
        d.id === selectedDespesa.id
          ? { ...d, ...formState, valor: valorNumerico }
          : d
      ));
    } else {
      // Lógica de Novo Cadastro
      const novaDespesa = {
        id: Date.now(),
        ...formState,
        valor: valorNumerico,
      };
      setDespesas([...despesas, novaDespesa]);
    }

    clearForm();
  };

  const handleSelect = (despesa) => {
    if (selectedDespesa && selectedDespesa.id === despesa.id) {
      clearForm();
    } else {
      setSelectedDespesa(despesa);
      setIsEditing(false); // Apenas seleciona, não entra em modo de edição
    }
  };

  const handleEdit = () => {
    if (selectedDespesa) {
      setFormState({
        ...selectedDespesa,
        valor: String(selectedDespesa.valor).replace('.', ','), // Formata para o input
      });
      setIsEditing(true);
    } else {
      alert('Selecione uma despesa para alterar.');
    }
  };

  const handleDelete = () => {
    if (selectedDespesa) {
      if (window.confirm(`Tem certeza que deseja excluir a despesa "${selectedDespesa.descricao}"?`)) {
        setDespesas(despesas.filter(d => d.id !== selectedDespesa.id));
        clearForm();
      }
    } else {
      alert('Selecione uma despesa para excluir.');
    }
  };

  return (
    <div className="cadastro-despesa-container page-content">
      <div className="cadastro-despesa-content">
        <header className="cadastro-header">
          <h2>Cadastro de Despesas</h2>
        </header>

        <section className="form-section">
          <div className="form-group descricao-group">
            <label>Descrição *</label>
            <input
              type="text"
              name="descricao"
              placeholder="Ex: Aluguel, Compra de produtos"
              value={formState.descricao}
              onChange={handleInputChange}
              readOnly={selectedDespesa && !isEditing}
            />
          </div>
          <div className="form-group valor-group">
            <label>Valor (R$) *</label>
            <input
              type="text"
              name="valor"
              placeholder="0,00"
              value={formState.valor}
              onChange={handleInputChange}
              readOnly={selectedDespesa && !isEditing}
            />
          </div>
          <div className="form-group data-group">
            <label>Data *</label>
            <input
              type="date"
              name="data"
              value={formState.data}
              onChange={handleInputChange}
              readOnly={selectedDespesa && !isEditing}
            />
          </div>
          <div className="form-group categoria-group">
            <label>Categoria</label>
            <select
              name="categoria"
              value={formState.categoria}
              onChange={handleInputChange}
              disabled={selectedDespesa && !isEditing}
            >
              <option>Diversos</option>
              <option>Fixa</option>
              <option>Produtos</option>
              <option>Contas</option>
              <option>Salários</option>
            </select>
          </div>
        </section>

        <section className="action-buttons">
          <button className="btn-save" onClick={handleSave} disabled={selectedDespesa && !isEditing}>
            {isEditing ? 'Confirmar Alteração' : 'Gravar Despesa'}
          </button>
          {(isEditing || selectedDespesa) && (
            <button className="btn-cancel" onClick={clearForm}>
              {isEditing ? 'Cancelar' : 'Limpar Seleção'}
            </button>
          )}
        </section>

        <section className="despesas-list-section">
          <h3>Despesas Lançadas</h3>
          <div className="list-buttons">
            <button className="btn-edit" onClick={handleEdit} disabled={!selectedDespesa || isEditing}>
              Alterar
            </button>
            <button className="btn-delete" onClick={handleDelete} disabled={!selectedDespesa || isEditing}>
              Excluir
            </button>
          </div>
        </section>

        <div className="despesas-list">
          {despesas.map((despesa) => (
            <div
              key={despesa.id}
              className={`despesa-item ${selectedDespesa && selectedDespesa.id === despesa.id ? 'selected' : ''}`}
              onClick={() => handleSelect(despesa)}
            >
              <input
                type="radio"
                checked={selectedDespesa && selectedDespesa.id === despesa.id}
                readOnly
              />
              <div className="despesa-info">
                <span className="despesa-data">{new Date(despesa.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span className="despesa-descricao">{despesa.descricao}</span>
                <span className="despesa-categoria">{despesa.categoria}</span>
                <span className="despesa-valor">
                  {despesa.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CadastroDespesa;