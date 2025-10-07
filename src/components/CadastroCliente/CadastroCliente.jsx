import React, { useState } from 'react';
import './CadastroCliente.css';

function CadastroCliente({ clientes: clientesCadastrados, setClientes: setClientesCadastrados }) {
    const [cliente, setCliente] = useState({
        codigo: '01',
        nome: '',
        celular: ''
    });
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // Novo estado de controle

    // --- Funções Auxiliares ---

    const generateNewId = () => {
        // Encontra o ID mais alto e gera o próximo código formatado
        const lastId = clientesCadastrados.length > 0 
          ? Math.max(...clientesCadastrados.map(c => parseInt(c.codigo, 10)))
          : 0;
        const newIdNum = lastId + 1;
        return String(newIdNum).padStart(2, '0');
    };

    const clearForm = () => {
        setCliente({ codigo: generateNewId(), nome: '', celular: '' });
        setClienteSelecionado(null);
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCliente({ ...cliente, [name]: value });
    };
    
    // --- Lógica de Salvar/Alterar ---

    const handleSave = () => {
        if (!cliente.nome.trim() || !cliente.celular.trim()) {
            alert('Por favor, preencha o nome e o celular do cliente.');
            return;
        }

        if (clienteSelecionado && isEditing) {
            // Lógica de edição
            const novosClientes = clientesCadastrados.map(c => 
                c.id === clienteSelecionado.id 
                    ? { ...cliente, id: clienteSelecionado.id, codigo: clienteSelecionado.codigo } 
                    : c
            );
            setClientesCadastrados(novosClientes);
        } else if (!clienteSelecionado && !isEditing) {
            // Lógica de inclusão
            const novoCliente = { id: Date.now(), codigo: generateNewId(), ...cliente };
            setClientesCadastrados([...clientesCadastrados, novoCliente]);
        }
        
        clearForm(); // Limpa o formulário e reseta o estado
    };

    // --- Lógica de Seleção e Edição ---

    const handleSelectCliente = (clienteData) => {
        // Toggle: Se clicar no mesmo, desmarca
        if (clienteSelecionado && clienteSelecionado.id === clienteData.id) {
            clearForm();
        } else {
            // Apenas seleciona. Os inputs ficam vazios e readOnly.
            setClienteSelecionado(clienteData);
            setCliente({ codigo: clienteData.codigo, nome: '', celular: '' }); // Mantém campos vazios
            setIsEditing(false); // Garante que não está em modo de edição
        }
    };
    
    const handleAlterarCliente = () => {
        if (clienteSelecionado) {
            // 1. Ativa o modo de edição
            setIsEditing(true);
            // 2. Preenche os campos para edição
            setCliente({ 
                codigo: clienteSelecionado.codigo,
                nome: clienteSelecionado.nome,
                celular: clienteSelecionado.celular 
            });
        } else {
            alert('Selecione um cliente para alterar.');
        }
    };
    
    const handleCancelEdit = () => {
        clearForm();
    };

    const handleDelete = () => {
        if (clienteSelecionado) {
            // IMPORTANT: Use window.confirm for simplicity, but a custom modal is better practice
            if (window.confirm(`Tem certeza que deseja excluir o cliente ${clienteSelecionado.nome}?`)) {
                const novosClientes = clientesCadastrados.filter(c => c.id !== clienteSelecionado.id);
                setClientesCadastrados(novosClientes);
                clearForm();
            }
        } else {
            alert('Selecione um cliente para excluir.');
        }
    };

    // Determina se os campos Nome e Celular devem ser somente leitura
    const isFieldReadOnly = clienteSelecionado !== null && !isEditing;

    return (
        <div className="cadastro-cliente-container page-content">
            <div className="cadastro-cliente-content">
                <div className="cadastro-header">
                    <h2>Cadastro de Clientes</h2>
                </div>
                
                <div className="form-section">
                    <div className="form-group">
                        <label>Código</label>
                        <input 
                            type="text" 
                            name="codigo" 
                            value={cliente.codigo} 
                            readOnly 
                        />
                    </div>
                    <div className="form-group nome-group">
                        <label>Nome *</label>
                        <input 
                            type="text" 
                            name="nome" 
                            value={cliente.nome} 
                            onChange={handleInputChange} 
                            placeholder="Digite aqui"
                            readOnly={isFieldReadOnly} 
                        />
                    </div>
                    <div className="form-group celular-group">
                        <label>Celular/Whatsapp</label>
                        <input 
                            type="text" 
                            name="celular" 
                            value={cliente.celular} 
                            onChange={handleInputChange} 
                            placeholder="(99) 9 9999-9999" 
                            readOnly={isFieldReadOnly}
                        />
                    </div>
                </div>

                <div className="action-buttons">
                    <input 
                        className="btn-save" 
                        type="button" // Alterado para 'button' para evitar submit de formulário
                        value={isEditing ? 'Confirmar Alteração' : 'Gravar'}
                        onClick={handleSave}
                        // Desabilita se houver seleção E não estiver editando (força o clique em Alterar)
                        disabled={clienteSelecionado !== null && !isEditing}
                    />
                    {(isEditing || clienteSelecionado) && (
                        <input 
                            className="btn-cancel" 
                            type="button"
                            value={isEditing ? 'Cancelar Edição' : 'Limpar Seleção'}
                            onClick={handleCancelEdit}
                        />
                    )}
                </div>

                <div className="clientes-list-section">
                    <h3>Clientes</h3>
                    <div className="list-buttons-container">
                        <div className="list-buttons">
                            <button 
                                className="btn-edit" 
                                onClick={handleAlterarCliente}
                                disabled={!clienteSelecionado || isEditing}
                            >
                                Alterar
                            </button>
                            <button 
                                className="btn-delete" 
                                onClick={handleDelete}
                                disabled={!clienteSelecionado || isEditing}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="clientes-list">
                    {clientesCadastrados.map(c => (
                        <div 
                            key={c.id} 
                            className={`cliente-item ${clienteSelecionado && clienteSelecionado.id === c.id ? 'selected' : ''}`}
                            onClick={() => handleSelectCliente(c)} // Passando o objeto completo
                        >
                            <input type="radio" checked={clienteSelecionado && clienteSelecionado.id === c.id} readOnly />
                            <div className="cliente-info">
                                <span className="cliente-codigo">{c.codigo}</span>
                                <span className="cliente-nome">{c.nome}</span>
                                <span className="cliente-celular">{c.celular}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CadastroCliente;
