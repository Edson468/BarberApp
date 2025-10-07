// src/components/Servicos/Servicos.jsx
import React, { useState } from 'react';
import './Servicos.css';

// --- FUNÇÕES AUXILIARES DE TEMPO (MANTIDAS) ---
const formatTimeForInput = (time) => {
    if (!time || time === '00:00:00') return '0h 0min';
    if (time.includes(':')) {
        const [h, m] = time.split(':');
        return `${parseInt(h)}h ${parseInt(m)}min`;
    }
    return time; 
};

// --- NOVA FUNÇÃO AUXILIAR PARA FORMATAR MOEDA ---
const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    
    // 1. Limpa a string de formatação (mantendo apenas números e o ponto/vírgula decimal)
    let cleanedValue = String(value).replace('R$', '').trim();
    
    // 2. Tenta converter para número, considerando que a vírgula pode ser o separador decimal
    if (cleanedValue.includes(',')) {
        cleanedValue = cleanedValue.replace(/\./g, '').replace(',', '.');
    }
    
    const numberValue = parseFloat(cleanedValue) || 0;

    // 3. Formata para BRL (R$ X.XXX,XX)
    return numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};
// --------------------------------------------------------------------------


// Recebe as props 'servicos' (dados) e 'setServicos' (função de atualização)
function Servicos({ servicos, setServicos }) {
    const [servico, setServico] = useState({
        codigo: '',
        descricao: '',
        valor: '', // Mantemos o valor aqui como a string que o usuário digita (ou formatada)
        tempo: '0h 0min'
    });
    const [servicoSelecionado, setServicoSelecionado] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Se for o campo valor, podemos pré-formatar a string ou apenas salvar
        // Aqui, optamos por salvar a string bruta para que a formatação ocorra na exibição.
        // No entanto, para fins práticos e de UX, vamos aplicar a formatação ao perder o foco.
        setServico({ ...servico, [name]: value });
    };

    // Aplica a formatação de moeda quando o campo perde o foco
    const handleValueBlur = (e) => {
        const formattedValue = formatCurrency(e.target.value);
        setServico({ ...servico, valor: formattedValue });
    };

    const handleSave = () => {
        if (!servico.descricao || !servico.valor || !servico.tempo) {
            alert('Por favor, preencha todos os campos: Descrição, Valor e Tempo.');
            return;
        }
        
        // Mantém o formato "Xh Ymin" para consistência em toda a aplicação
        const tempoParaSalvar = servico.tempo;
        // O valor salvo no objeto de serviço JÁ VAI SER A STRING FORMATADA (R$ XX,XX)
        const valorFormatadoParaSalvar = formatCurrency(servico.valor);

        if (servicoSelecionado && isEditing) {
            // Lógica de Alteração
            const novosServicos = servicos.map(s => 
                s.id === servicoSelecionado.id ? { 
                    ...servico, 
                    id: servicoSelecionado.id,
                    tempo: tempoParaSalvar,
                    valor: valorFormatadoParaSalvar // Salva o valor formatado
                } : s
            );
            setServicos(novosServicos);
            setIsEditing(false);
            setServicoSelecionado(null);
        } else {
            // Lógica de Novo Cadastro
            const ultimoCodigo = servicos.reduce((max, s) => {
                const codigoNum = parseInt(s.codigo.replace(/\D/g, ''), 10);
                return codigoNum > max ? codigoNum : max;
            }, 0);
            
            const novoCodigoNum = ultimoCodigo + 1;
            const novoCodigoString = String(novoCodigoNum).padStart(2, '0');
            
            const novoServico = { 
                id: Date.now(), 
                ...servico, 
                codigo: novoCodigoString,
                tempo: tempoParaSalvar,
                valor: valorFormatadoParaSalvar // Salva o valor formatado
            };
            setServicos([...servicos, novoServico]);
        }
        
        // Limpa o formulário após salvar
        setServico({ codigo: '', descricao: '', valor: '', tempo: '0h 0min' }); 
    };
    
    const handleEdit = () => {
        if (servicoSelecionado) {
            // Preenche o formulário
            setServico({
                ...servicoSelecionado,
                tempo: formatTimeForInput(servicoSelecionado.tempo) 
            });
            setIsEditing(true); // Entra no modo de edição
        } else {
            alert("Por favor, selecione um serviço para alterar.");
        }
    };
    
    const handleSelectServico = (id) => {
        const servicoEncontrado = servicos.find(s => s.id === id);
        setServicoSelecionado(servicoEncontrado);
        
        if (isEditing) {
            setIsEditing(false);
        }
        // Limpa o formulário
         setServico({ codigo: '', descricao: '', valor: '', tempo: '0h 0min' });
    };

    const handleDelete = () => {
        if (servicoSelecionado) {
            const novosServicos = servicos.filter(s => s.id !== servicoSelecionado.id);
            setServicos(novosServicos);
            setServico({ codigo: '', descricao: '', valor: '', tempo: '0h 0min' });
            setServicoSelecionado(null);
            setIsEditing(false);
        } else {
            alert("Por favor, selecione um serviço para excluir.");
        }
    };
    
    const handleCancelEdit = () => {
        setServico({ codigo: '', descricao: '', valor: '', tempo: '0h 0min' });
        setServicoSelecionado(null);
        setIsEditing(false);
    }


    return (
        // 1. Adiciona o contêiner principal com as classes de layout corretas.
        <div className="servicos-container-wrapper page-content">
            {/* 2. O conteúdo interno agora fica dentro deste novo contêiner. */}
            <div className="cadastro-servicos-container">
                <div className="cadastro-header">
                    <h2>Cadastro de Serviços</h2>
                </div>
                
                <div className="form-section">
                    <div className="form-group codigo-group">
                        <label>Código</label>
                        <input 
                            type="text" 
                            name="codigo" 
                            value={isEditing ? servico.codigo : ''} 
                            onChange={handleInputChange} 
                            readOnly 
                        />
                    </div>
                    <div className="form-group descricao-group">
                        <label>Descrição</label>
                        <input 
                            type="text" 
                            name="descricao" 
                            value={isEditing ? servico.descricao : servico.descricao} 
                            onChange={handleInputChange} 
                            placeholder="Digite aqui" 
                            readOnly={isEditing === false && servicoSelecionado !== null}
                        />
                    </div>
                    <div className="form-group valor-group">
                        <label>Valor</label>
                        <input 
                            type="text" 
                            name="valor" 
                            value={isEditing ? servico.valor : servico.valor} 
                            onChange={handleInputChange} 
                            onBlur={handleValueBlur} // CORREÇÃO: Removido o comentário inline
                            placeholder="R$ 0,00" 
                            readOnly={isEditing === false && servicoSelecionado !== null}
                        />
                    </div>
                    <div className="form-group tempo-group">
                        <label>Tempo</label>
                        <input 
                            type="text" 
                            name="tempo" 
                            value={isEditing ? servico.tempo : servico.tempo} 
                            onChange={handleInputChange} 
                            placeholder="0h 0min" 
                            readOnly={isEditing === false && servicoSelecionado !== null}
                        />
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="btn-save" onClick={handleSave}>
                        {isEditing ? 'Confirmar Alteração' : 'Gravar'}
                    </button>
                    {isEditing && <button className="btn-cancel" onClick={handleCancelEdit}>Cancelar Edição</button>}
                </div>

                <div className="servicos-list-section">
                    <h3>Serviços</h3>
                    <div className="list-buttons-container">
                        <div className="list-buttons">
                            <button className="btn-edit" onClick={handleEdit} disabled={!servicoSelecionado || isEditing}>Alterar</button>
                            <button className="btn-delete" onClick={handleDelete} disabled={!servicoSelecionado || isEditing}>Excluir</button>
                        </div>
                    </div>
                </div>
                
                <div className="servicos-list">
                    {servicos.map(s => (
                        <div 
                            key={s.id} 
                            className={`servico-item ${servicoSelecionado && servicoSelecionado.id === s.id ? 'selected' : ''}`}
                            onClick={() => handleSelectServico(s.id)}
                        >
                            <input type="radio" checked={servicoSelecionado && servicoSelecionado.id === s.id} readOnly />
                            <div className="servico-info">
                                <span className="servico-codigo">{s.codigo}</span>
                                <span className="servico-descricao">{s.descricao}</span>
                                <span className="servico-valor">{formatCurrency(s.valor)}</span>
                                <span className="servico-tempo">{formatTimeForInput(s.tempo)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Servicos;