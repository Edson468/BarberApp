import React, { useState, useEffect, useMemo } from 'react';
import './Caixa.css';
import MenuLateral from '../MenuLateral/MenuLateral'; 

// --- Funções Auxiliares de Data ---

// Formata a data atual para exibição (DD/MM/YYYY)
const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// Converte a string DD/MM/YYYY para um objeto Date
const parseDateString = (dateString) => {
    const datePart = dateString.split(' - ')[0];
    const [day, month, year] = datePart.split('/').map(Number);
    if (!day || !month || !year) return new Date(NaN);
    // Meses em Date são zero-based (Mês - 1)
    return new Date(year, month - 1, day);
};

// Converte a string DD/MM/YYYY para o formato YYYY-MM-DD para o input type="date"
const formatToInputDate = (dateString) => {
    if (!dateString) return '';
    const [dd, mm, yyyy] = dateString.split('/');
    return `${yyyy}-${mm}-${dd}`;
};


// --- Componente Caixa ---

function Caixa({ agendamentos = [] }) { 
    const todayDate = getTodayDate();
    
    // Define qual lista usar: prop real ou mock data
    const dataToUse = agendamentos;

    // --- Lógica para extrair e formatar serviços concluídos ---
    const servicosConcluidos = useMemo(() => {
        return dataToUse
            .filter(ag => ag.status === 'concluido')
            .map(ag => {
                const [service, barber] = (ag.details || '').split(' com ');
                const [date, time] = (ag.time || ' - ').split(' - ');
                
                return {
                    id: ag.id,
                    data: date,
                    hora: time,
                    servico: service || 'Serviço Desconhecido',
                    barbeiro: barber || 'Barbeiro Desconhecido',
                    cliente: ag.clientName || 'Cliente Desconhecido', 
                    formaPagamento: ag.payment || 'Não Informado',
                    valor: ag.price || 0,
                    status: ag.status,
                };
            });
    }, [dataToUse]);


    // --- Estados de Filtro ---
    const [periodoSelecionado, setPeriodoSelecionado] = useState('Diário');
    const [dataInicioInput, setDataInicioInput] = useState(formatToInputDate(todayDate));
    const [dataFimInput, setDataFimInput] = useState(formatToInputDate(todayDate));
    
    const [servicoFiltro, setServicoFiltro] = useState('Todos');
    const [barbeiroFiltro, setBarbeiroFiltro] = useState('Todos');
    const [pagamentoFiltro, setPagamentoFiltro] = useState('Todos');
    
    const [activeServicoFiltro, setActiveServicoFiltro] = useState('Todos');
    const [activeBarbeiroFiltro, setActiveBarbeiroFiltro] = useState('Todos');
    const [activePagamentoFiltro, setActivePagamentoFiltro] = useState('Todos');
    const [currentDate] = useState(todayDate);

    // --- Lógica de Efeitos e Atualização de Data ---

    const handleApplyFilters = () => {
        setActiveServicoFiltro(servicoFiltro);
        setActiveBarbeiroFiltro(barbeiroFiltro);
        setActivePagamentoFiltro(pagamentoFiltro);
    };

    // Efeito para carregar o filtro 'Diário' na primeira vez que o componente é montado.
    useEffect(() => {
        handleApplyFilters();
    }, []); // O array vazio [] garante que isso rode apenas uma vez.

    useEffect(() => {
        const format = (date) => {
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yyyy = date.getFullYear();
            return `${yyyy}-${mm}-${dd}`;
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let startDate = new Date(today);
        let endDate = new Date(today);
        
        if (periodoSelecionado === 'Semanal') {
            startDate.setDate(today.getDate() - today.getDay());
            endDate.setDate(startDate.getDate() + 6);
        }

        if (periodoSelecionado !== 'Período') {
            setDataInicioInput(format(startDate));
            setDataFimInput(format(endDate));
        }

        handleApplyFilters();
    
    // A dependência handleApplyFilters foi removida para evitar loops desnecessários.
    }, [periodoSelecionado]);

    // --- Lógica de Filtragem ---

    const handleClearFilters = () => {
        setServicoFiltro('Todos');
        setBarbeiroFiltro('Todos');
        setPagamentoFiltro('Todos');
        setActiveServicoFiltro('Todos');
        setActiveBarbeiroFiltro('Todos');
        setActivePagamentoFiltro('Todos');
    };

    const filteredServicos = useMemo(() => {
        let filteredByDate = servicosConcluidos.filter(servico => {
            const servicoDate = parseDateString(servico.data);
            if (isNaN(servicoDate.getTime())) return false; 
            
            const dataInicio = new Date(dataInicioInput);
            const dataFim = new Date(dataFimInput);
            
            if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) return false;

            dataInicio.setHours(0, 0, 0, 0);
            dataFim.setHours(23, 59, 59, 999); 

            return servicoDate >= dataInicio && servicoDate <= dataFim;
        });

        return filteredByDate.filter(servico => {
            const isServicoMatch = activeServicoFiltro === 'Todos' || servico.servico === activeServicoFiltro;
            const isBarbeiroMatch = activeBarbeiroFiltro === 'Todos' || servico.barbeiro === activeBarbeiroFiltro;
            const isPagamentoMatch = activePagamentoFiltro === 'Todos' || servico.formaPagamento === activePagamentoFiltro;
            
            return isServicoMatch && isBarbeiroMatch && isPagamentoMatch;
        });
    }, [servicosConcluidos, dataInicioInput, dataFimInput, activeServicoFiltro, activeBarbeiroFiltro, activePagamentoFiltro]);


    const totalServicos = useMemo(() => {
        return filteredServicos.reduce((acc, servico) => acc + servico.valor, 0);
    }, [filteredServicos]);

    const uniqueServicos = useMemo(() => ['Todos', ...new Set(servicosConcluidos.map(s => s.servico))], [servicosConcluidos]);
    const uniqueBarbeiros = useMemo(() => ['Todos', ...new Set(servicosConcluidos.map(s => s.barbeiro))], [servicosConcluidos]);
    const uniquePagamentos = useMemo(() => ['Todos', ...new Set(servicosConcluidos.map(s => s.formaPagamento))], [servicosConcluidos]);

    const getPeriodoTitle = () => {
        const dataInicioDisplay = dataInicioInput ? dataInicioInput.split('-').reverse().join('/') : '';
        const dataFimDisplay = dataFimInput ? dataFimInput.split('-').reverse().join('/') : '';
        
        if (periodoSelecionado === 'Diário') {
            return `do dia ${dataInicioDisplay}`;
        }
        if (periodoSelecionado === 'Semanal') {
            return 'da semana';
        }
        return `de ${dataInicioDisplay} a ${dataFimDisplay}`;
    };

    return (
        <div className="caixa-page">
            <MenuLateral />
            <div className="caixa-container">
                <header className="caixa-header">
                    <div className="caixa-data-atual">
                        <span>{currentDate}</span>
                    </div>
                    <h2>Caixa</h2>
                    <div className="periodo-buttons">
                        <button 
                            className={`btn-periodo ${periodoSelecionado === 'Diário' ? 'active' : ''}`}
                            onClick={() => setPeriodoSelecionado('Diário')}
                        >
                            Diário
                        </button>
                        <button 
                            className={`btn-periodo ${periodoSelecionado === 'Semanal' ? 'active' : ''}`}
                            onClick={() => setPeriodoSelecionado('Semanal')}
                        >
                            Semanal
                        </button>
                        <button 
                            className={`btn-periodo ${periodoSelecionado === 'Período' ? 'active' : ''}`}
                            onClick={() => setPeriodoSelecionado('Período')}
                        >
                            Período
                        </button>
                    </div>
                </header>

                <section className="filtros-section">
                    
                    <div className="filtro-group">
                        <label>Datas</label>
                        <div className="date-inputs">
                            <input 
                                type="date" 
                                value={dataInicioInput}
                                onChange={(e) => {
                                    if (periodoSelecionado === 'Período') {
                                        setDataInicioInput(e.target.value);
                                    }
                                }} 
                                disabled={periodoSelecionado !== 'Período'}
                            />
                            <input 
                                type="date" 
                                value={dataFimInput}
                                onChange={(e) => {
                                    if (periodoSelecionado === 'Período') {
                                        setDataFimInput(e.target.value);
                                    }
                                }} 
                                disabled={periodoSelecionado !== 'Período'}
                            />
                        </div>
                    </div>

                    <div className="filtro-group">
                        <label>Serviço</label>
                        <select value={servicoFiltro} onChange={(e) => setServicoFiltro(e.target.value)}>
                            {uniqueServicos.map(servico => (
                                <option key={servico}>{servico}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label>Barbeiro</label>
                        <select value={barbeiroFiltro} onChange={(e) => setBarbeiroFiltro(e.target.value)}>
                            {uniqueBarbeiros.map(barbeiro => (
                                <option key={barbeiro}>{barbeiro}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label>Forma de pagamento</label>
                        <select value={pagamentoFiltro} onChange={(e) => setPagamentoFiltro(e.target.value)}>
                            {uniquePagamentos.map(pagamento => (
                                <option key={pagamento}>{pagamento}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filtro-actions">
                        <button className="btn-apply" onClick={handleApplyFilters}>
                            Aplicar Filtros
                        </button>
                        <button className="btn-clear" onClick={handleClearFilters}>
                            Limpar Filtros
                        </button>
                    </div>
                </section>

                <h3 className="servicos-title">Serviços {getPeriodoTitle()}</h3>

                <div className="tabela-servicos-container">
                    <table className="tabela-servicos">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Serviços</th>
                                <th>Barbeiro</th>
                                <th>Cliente</th>
                                <th>Forma de pagamento</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServicos.length > 0 ? (
                                filteredServicos.map(servico => (
                                    <tr key={servico.id}>
                                        <td>{servico.data}</td>
                                        <td>{servico.servico}</td>
                                        <td>{servico.barbeiro}</td>
                                        <td>{servico.cliente}</td>
                                        <td>{servico.formaPagamento}</td>
                                        <td>R$ {servico.valor.toFixed(2).replace('.', ',')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-data">Nenhum serviço concluído encontrado para os filtros selecionados.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" className="total-label">Total:</td>
                                <td className="total-valor">R$ {totalServicos.toFixed(2).replace('.', ',')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Caixa;