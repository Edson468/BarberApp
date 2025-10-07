import React, { useState, useEffect, useMemo } from 'react';
import './ModalAgendamento.css';

function ModalAgendamento({ onClose, onSave, initialData = null, servicos = [], barbeiros = [], clientes: listaDeClientesComCodigos = [] }) {
    const [cliente, setCliente] = useState('');
    const [codigoCliente, setCodigoCliente] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [barbeiro, setBarbeiro] = useState('');
    const [pagamento, setPagamento] = useState('');
    const [servicosAgendados, setServicosAgendados] = useState([{ servico: '', valor: '', tempo: '' }]);
    const [sugestoesClientes, setSugestoesClientes] = useState([]);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

    useEffect(() => {
        if (initialData) {
            const [datePart, timeAndClientPart] = initialData.time.split(' às ');
            const [timePart, clientPart] = timeAndClientPart.split(' - ');
            const detailsParts = initialData.details.split(' com ');
            const servicosPart = detailsParts[0];
            const barbeiroPart = detailsParts.length > 1 ? detailsParts[1] : '';
            const [day, month, year] = datePart.split('/');
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            
            setCliente(clientPart);
            setDataHora(`${formattedDate}T${timePart}`);
            setBarbeiro(barbeiroPart);
            setPagamento(initialData.payment);

            // Preenche o primeiro serviço com os dados existentes
            setServicosAgendados([{
                servico: servicosPart,
                valor: initialData.price,
                tempo: initialData.duration
            }]);

            const clienteEncontrado = listaDeClientesComCodigos.find((c) => c.nome === clientPart);
            if (clienteEncontrado) {
                setCodigoCliente(clienteEncontrado.id);
            }
        }
    }, [initialData, listaDeClientesComCodigos]);

    // --- Funções para gerenciar múltiplos serviços ---
    const handleServicoChange = (e, index) => {
        const novoServicoDesc = e.target.value;
        const novosServicos = [...servicosAgendados];
        const detalhes = servicos.find(s => s.descricao === novoServicoDesc);

        if (detalhes) {
            novosServicos[index] = { servico: novoServicoDesc, valor: detalhes.valor, tempo: detalhes.tempo };
        } else {
            // Se o serviço for desmarcado ("Selecione"), limpa os dados da linha
            novosServicos[index] = { servico: '', valor: '', tempo: '' };
        }
        setServicosAgendados(novosServicos);
    };

    const adicionarServico = () => {
        setServicosAgendados([...servicosAgendados, { servico: '', valor: '', tempo: '' }]);
    };

    const removerServico = (index) => {
        if (servicosAgendados.length > 1) {
            const novosServicos = servicosAgendados.filter((_, i) => i !== index);
            setServicosAgendados(novosServicos);
        }
    };

    // --- Lógica de cálculo de totais ---
    const { totalValor, totalTempo } = useMemo(() => {
        const parseTime = (timeStr) => {
            if (!timeStr || typeof timeStr !== 'string') return 0;
            const hMatch = timeStr.match(/(\d+)h/);
            const mMatch = timeStr.match(/(\d+)min/);
            const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
            const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;
            return (hours * 60) + minutes;
        };

        let valorTotal = 0;
        let tempoTotalEmMinutos = 0;

        servicosAgendados.forEach(s => {
            valorTotal += parseFloat(String(s.valor).replace('R$', '').replace(',', '.')) || 0;
            tempoTotalEmMinutos += parseTime(s.tempo);
        });

        const hours = Math.floor(tempoTotalEmMinutos / 60);
        const minutes = tempoTotalEmMinutos % 60;
        const tempoFormatado = `${hours}h ${minutes}min`;

        return { totalValor: valorTotal, totalTempo: tempoFormatado };
    }, [servicosAgendados]);

    // --- Lógica de Autocomplete e Salvamento ---
    const handleClienteChange = (e) => {
        const inputCliente = e.target.value;
        setCliente(inputCliente);
        const sugestoesFiltradas = listaDeClientesComCodigos.filter(
            (c) => c.nome.toLowerCase().includes(inputCliente.toLowerCase())
        );
        setSugestoesClientes(sugestoesFiltradas);
        setMostrarSugestoes(inputCliente.length > 0 && sugestoesFiltradas.length > 0);
        const clienteEncontrado = listaDeClientesComCodigos.find(
            (c) => c.nome.toLowerCase() === inputCliente.toLowerCase()
        );
        setCodigoCliente(clienteEncontrado ? clienteEncontrado.id : '');
    };

    const handleSugestaoClick = (clienteSelecionado) => {
        setCliente(clienteSelecionado.nome);
        setCodigoCliente(clienteSelecionado.id);
        setMostrarSugestoes(false);
    };

    const handleSave = () => {
        if (!cliente || !barbeiro || !dataHora || servicosAgendados.some(s => !s.servico)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const servicosDescricoes = servicosAgendados.map(s => s.servico).join(', ');
        const agendamentoParaSalvar = {
            ...(initialData && { id: initialData.id }),
            cliente,
            barbeiro,
            details: `${servicosDescricoes} com ${barbeiro}`,
            price: totalValor,
            duration: totalTempo,
            payment: pagamento,
            time: `${new Date(dataHora).toLocaleDateString('pt-BR')} às ${new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${cliente}`,
            status: initialData ? initialData.status : 'pendente',
        };
        
        onSave(agendamentoParaSalvar);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{initialData ? 'Alterar Agendamento' : 'Novo Agendamento'}</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-content">
                    <div className="form-row">
                        <div className="form-group codigo-group">
                            <label>Código</label>
                            <input type="text" value={codigoCliente} readOnly />
                        </div>
                        <div className="form-group cliente-group">
                            <label>Cliente*</label>
                            <input
                                type="text"
                                value={cliente}
                                onChange={handleClienteChange}
                                onFocus={() => setMostrarSugestoes(true)}
                                onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                                placeholder="Digite o nome do cliente"
                                required
                            />
                            {mostrarSugestoes && sugestoesClientes.length > 0 && (
                                <ul className="autocomplete-sugestoes">
                                    {sugestoesClientes.map((c) => (
                                        <li key={c.id} onMouseDown={() => handleSugestaoClick(c)}>
                                            {c.nome}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Data/Hora*</label>
                            <input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-column">
                            <div className="form-group barbeiro-group">
                                <label>Barbeiro*</label>
                                <select value={barbeiro} onChange={(e) => setBarbeiro(e.target.value)} required>
                                    <option value="">Selecione o barbeiro</option>
                                    {barbeiros.map(b => (
                                        <option key={b.id} value={b.nome}>
                                            {b.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {servicosAgendados.map((item, index) => (
                                <div key={index} className="servico-item-row">
                                    <div className="form-group servico-group">
                                        <label>{`Serviço ${index + 1}*`}</label>
                                        <select value={item.servico} onChange={(e) => handleServicoChange(e, index)} required>
                                            <option value="">Selecione</option>
                                            {servicos.map(s => (
                                                <option key={s.id} value={s.descricao}>
                                                    {s.descricao}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {servicosAgendados.length > 1 && (
                                        <button type="button" className="btn-remover-servico" onClick={() => removerServico(index)}>
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="form-column resumo-servico">
                            <div className="form-group">
                                <label>Valor Total</label>
                                <input type="text" value={totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Tempo Total</label>
                                <input type="text" value={totalTempo} readOnly />
                            </div>
                            <button type="button" className="btn-adicionar-servico" onClick={adicionarServico}>
                                + Serviço
                            </button>
                        </div>
                    </div>

                    <div className="form-row payment-section">
                        <div className="payment-options">
                            <label>Forma de pagamento</label>
                            <div className="radio-group">
                                <label><input type="radio" name="payment" value="Pix" checked={pagamento === 'Pix'} onChange={(e) => setPagamento(e.target.value)} /> Pix</label>
                                <label><input type="radio" name="payment" value="Dinheiro" checked={pagamento === 'Dinheiro'} onChange={(e) => setPagamento(e.target.value)} /> Dinheiro</label>
                                <label><input type="radio" name="payment" value="Cartão de Débito" checked={pagamento === 'Cartão de Débito'} onChange={(e) => setPagamento(e.target.value)} /> Cartão de Débito</label>
                                <label><input type="radio" name="payment" value="Cartão de Crédito" checked={pagamento === 'Cartão de Crédito'} onChange={(e) => setPagamento(e.target.value)} /> Cartão de Crédito</label>
                            </div>
                        </div>
                        <div className="total-service">
                            <p>Total do Serviço</p>
                            <p className="total-value">{totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            <p className="total-time">{totalTempo}</p>
                            <p className="payment-status">{pagamento || 'Pagamento Pendente'}</p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-save" onClick={handleSave}>Gravar</button>
                    <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}

export default ModalAgendamento;