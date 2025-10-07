import React, { useState, useMemo } from 'react';
import './Caixa.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Funções Auxiliares de Data ---

// Formata a data atual para exibição (DD/MM/YYYY)
const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

// Converte a string de agendamento (Ex: 'DD/MM/YYYY às HH:MM - Cliente') para um objeto Date
const parseDateString = (fullTimeString) => {
    // 1. Busca o padrão 'DD/MM/YYYY' e 'HH:MM' na string completa
    const match = fullTimeString.match(/(\d{2})\/(\d{2})\/(\d{4}) às (\d{2}):(\d{2})/);
    
    if (!match) return new Date(NaN); 

    const [, day, month, year, hour, minute] = match.map(Number);
    
    // Meses em Date são zero-based (Mês - 1)
    return new Date(year, month - 1, day, hour, minute);
};

// --- Componente Caixa ---

function Caixa({ agendamentos = [], despesas = [] }) { 
    const todayDate = getTodayDate();

    // --- Lógica para unificar Entradas e Saídas ---
    const transacoes = useMemo(() => {
        // 1. Mapeia as entradas (serviços concluídos)
        const entradas = agendamentos
            .filter(ag => ag.status === 'concluido')
            .map(ag => {
                const timeAndDateMatch = ag.time.match(/(\d{2}\/\d{2}\/\d{4} às \d{2}:\d{2})/);
                const timeAndDate = timeAndDateMatch ? timeAndDateMatch[1] : ag.time;
                
                const clienteMatch = ag.time.match(/ - ([^-]+)$/);
                const cliente = clienteMatch ? clienteMatch[1].trim() : 'Cliente Desconhecido';

                const [service, barber] = ag.details.split(' com ');
                
                return {
                    id: `entrada-${ag.id}`,
                    dataObj: parseDateString(ag.time),
                    data: timeAndDate,
                    descricao: service || 'Serviço Desconhecido',
                    detalhes: `Cliente: ${cliente} | Barbeiro: ${barber || 'N/A'}`,
                    tipo: 'Entrada',
                    valor: ag.price || 0,
                };
            });

        // 2. Mapeia as saídas (despesas)
        const saidas = despesas.map(d => ({
            id: `saida-${d.id}`,
            dataObj: new Date(d.data + 'T00:00:00'),
            data: new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR'),
            descricao: d.descricao,
            detalhes: `Categoria: ${d.categoria}`,
            tipo: 'Saída',
            valor: d.valor,
        }));

        // 3. Combina e ordena por data (da mais recente para a mais antiga)
        return [...entradas, ...saidas].sort((a, b) => b.dataObj - a.dataObj);

    }, [agendamentos, despesas]);

    // --- Estados de Filtro de Período ---
    const [dataInicioInput, setDataInicioInput] = useState('');
    const [dataFimInput, setDataFimInput] = useState('');
    
    // Estados dos filtros de conteúdo
    const [servicoFiltro, setServicoFiltro] = useState('Todos');
    const [barbeiroFiltro, setBarbeiroFiltro] = useState('Todos');
    const [pagamentoFiltro, setPagamentoFiltro] = useState('Todos');

    // Estados dos filtros ATIVOS (usados para a filtragem real)
    const [activeDataInicio, setActiveDataInicio] = useState('');
    const [activeDataFim, setActiveDataFim] = useState('');
    const [activeServicoFiltro, setActiveServicoFiltro] = useState('Todos');
    const [activeBarbeiroFiltro, setActiveBarbeiroFiltro] = useState('Todos');
    const [activePagamentoFiltro, setActivePagamentoFiltro] = useState('Todos');
    const [currentDate] = useState(todayDate);

    // --- Lógica de Efeitos e Filtros ---

    const handleApplyFilters = () => {
        setActiveDataInicio(dataInicioInput);
        setActiveDataFim(dataFimInput);
        setActiveServicoFiltro(servicoFiltro);
        setActiveBarbeiroFiltro(barbeiroFiltro);
        setActivePagamentoFiltro(pagamentoFiltro);
    };

    const handleClearFilters = () => {
        setServicoFiltro('Todos');
        setBarbeiroFiltro('Todos');
        setPagamentoFiltro('Todos');
        setActiveDataInicio('');
        setActiveDataFim('');
        setActiveServicoFiltro('Todos');
        setActiveBarbeiroFiltro('Todos');
        setActivePagamentoFiltro('Todos');
    };

    // Filtra os serviços com base em TODOS os estados de filtro
    const transacoesFiltradas = useMemo(() => {
        return transacoes.filter(transacao => {
            // 1. Filtro por Data (só aplica se as datas ativas estiverem preenchidas)
            if (activeDataInicio && activeDataFim) {
                const servicoDate = transacao.dataObj;
                if (isNaN(servicoDate.getTime())) return false;

                const dataInicio = new Date(activeDataInicio);
                const dataFim = new Date(activeDataFim);

                if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) return false;

                dataInicio.setHours(0, 0, 0, 0);
                dataFim.setHours(23, 59, 59, 999);

                const servicoDateOnly = new Date(servicoDate);
                servicoDateOnly.setHours(0, 0, 0, 0);

                if (servicoDateOnly < dataInicio || servicoDateOnly > dataFim) {
                    return false; // Não passou no filtro de data
                }
            }

            // 2. Filtro por Conteúdo
            // Estes filtros se aplicam principalmente às entradas. Saídas passarão se o filtro for 'Todos'.
            if (transacao.tipo === 'Entrada') {
                const agendamentoOriginal = agendamentos.find(ag => `entrada-${ag.id}` === transacao.id);
                if (!agendamentoOriginal) return false;

                const [, barber] = agendamentoOriginal.details.split(' com ');

                const isServicoMatch = activeServicoFiltro === 'Todos' || transacao.descricao === activeServicoFiltro;
                const isBarbeiroMatch = activeBarbeiroFiltro === 'Todos' || (barber || 'Barbeiro Desconhecido') === activeBarbeiroFiltro;
                const isPagamentoMatch = activePagamentoFiltro === 'Todos' || agendamentoOriginal.payment === activePagamentoFiltro;
                
                return isServicoMatch && isBarbeiroMatch && isPagamentoMatch;
            }

            // Se for uma despesa, ela passa pelos filtros de conteúdo (que não se aplicam a ela)
            return true;
        });
    }, [
        transacoes, 
        activeDataInicio, 
        activeDataFim, 
        activeServicoFiltro, 
        activeBarbeiroFiltro, 
        activePagamentoFiltro,
        agendamentos
    ]);


    // Calcula o total dos serviços filtrados
    const totalCaixa = useMemo(() => {
        return transacoesFiltradas.reduce((acc, t) => t.tipo === 'Entrada' ? acc + t.valor : acc - t.valor, 0);
    }, [transacoesFiltradas]);

    // Obtém a lista única de opções para os filtros
    const uniqueServicos = useMemo(() => ['Todos', ...new Set(agendamentos.filter(ag => ag.status === 'concluido').map(ag => ag.details.split(' com ')[0]))], [agendamentos]);
    const uniqueBarbeiros = useMemo(() => ['Todos', ...new Set(agendamentos.filter(ag => ag.status === 'concluido').map(ag => ag.details.split(' com ')[1] || 'Barbeiro Desconhecido'))], [agendamentos]);
    const uniquePagamentos = useMemo(() => ['Todos', ...new Set(agendamentos.filter(ag => ag.status === 'concluido').map(ag => ag.payment))], [agendamentos]);

    const getPeriodoTitle = () => {
        if (activeDataInicio && activeDataFim) {
            const dataInicioDisplay = activeDataInicio.split('-').reverse().join('/');
            const dataFimDisplay = activeDataFim.split('-').reverse().join('/');
            return `de ${dataInicioDisplay} a ${dataFimDisplay}`;
        }
        
        return ' - Todos';
    };

    const handleExportPDF = () => {
        if (transacoesFiltradas.length === 0) {
            alert('Não há dados para exportar.');
            return;
        }

        const doc = new jsPDF();

        // Título do documento
        doc.setFontSize(18);
        doc.text('Relatório de Caixa', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        const periodoTitle = getPeriodoTitle().startsWith(' -') ? getPeriodoTitle().replace(' -', '') : getPeriodoTitle();
        doc.text(`Período: ${periodoTitle}`, 14, 30);

        // Definir as colunas da tabela
        const tableColumn = ['Data', 'Descrição', 'Detalhes', 'Tipo', 'Valor'];
        
        // Mapear os dados para as linhas da tabela
        const tableRows = transacoesFiltradas.map(t => [
            t.data,
            t.descricao,
            t.detalhes,
            t.tipo,
            `${t.tipo === 'Entrada' ? '+' : '-'} R$ ${t.valor.toFixed(2).replace('.', ',')}`
        ]);

        // Gerar a tabela
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            foot: [['', '', '', 'Total em Caixa:', `R$ ${totalCaixa.toFixed(2).replace('.', ',')}`]],
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [44, 44, 44] },
            footStyles: { fontStyle: 'bold', fillColor: [44, 44, 44] },
        });

        // Salvar o arquivo
        doc.save(`relatorio_caixa_${todayDate.replace(/\//g, '-')}.pdf`);
    };

    // --- LÓGICA DE EXPORTAÇÃO ---
    const handleExportCSV = () => {
        if (transacoesFiltradas.length === 0) {
            alert('Não há dados para exportar.');
            return;
        }

        // 1. Define o cabeçalho do CSV
        const headers = ['Data', 'Descrição', 'Detalhes', 'Tipo', 'Valor'];

        // 2. Mapeia os dados para o formato de linha do CSV, tratando as vírgulas
        const rows = transacoesFiltradas.map(t => {
            // Envolve cada campo com aspas para evitar problemas com vírgulas no conteúdo
            const escapedData = [
                t.data,
                t.descricao,
                t.detalhes,
                t.tipo,
                (t.tipo === 'Entrada' ? t.valor : -t.valor).toFixed(2).replace('.', ',')
            ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Escapa aspas duplas internas
            return escapedData.join(',');
        });

        // 3. Cria a linha do total
        const totalFormatted = totalCaixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const footerRow = ['', '', '', '"Total em Caixa:"', `"${totalFormatted}"`].join(',');


        // 4. Junta cabeçalho, linhas e rodapé, adicionando um BOM para compatibilidade com Excel
        const csvContent = [
            headers.join(','),
            ...rows,
            footerRow
        ].join('\n');

        // 4. Cria um Blob e dispara o download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_caixa_${todayDate.replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="caixa-container-wrapper page-content"> 
            <div className="caixa-content">
                <header className="caixa-header">
                    <div className="caixa-data-atual">
                        <span>{currentDate}</span>
                    </div>
                    <h2>Caixa</h2>
                    <div className="header-right-actions">
                        <div className="export-buttons">
                            <button className="btn-export-csv" onClick={handleExportCSV}>Exportar CSV</button>
                            <button className="btn-export-pdf" onClick={handleExportPDF}>Exportar PDF</button>
                        </div>
                    </div>
                </header>

                <section className="filtros-section">
                    
                    {/* Filtro de Período (sempre visível) */}
                    <div className="filtro-group">
                        <label>Datas</label>
                        <div className="date-inputs">
                            <input 
                                type="date" 
                                value={dataInicioInput}
                                onChange={(e) => setDataInicioInput(e.target.value)} 
                            />
                            <input 
                                type="date" 
                                value={dataFimInput}
                                onChange={(e) => setDataFimInput(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Filtro de Serviço */}
                    <div className="filtro-group">
                        <label>Serviço</label>
                        <select value={servicoFiltro} onChange={(e) => setServicoFiltro(e.target.value)}>
                            {uniqueServicos.map(servico => (
                                <option key={servico}>{servico}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Barbeiro */}
                    <div className="filtro-group">
                        <label>Barbeiro</label>
                        <select value={barbeiroFiltro} onChange={(e) => setBarbeiroFiltro(e.target.value)}>
                            {uniqueBarbeiros.map(barbeiro => (
                                <option key={barbeiro}>{barbeiro}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Forma de Pagamento */}
                    <div className="filtro-group">
                        <label>Forma de pagamento</label>
                        <select value={pagamentoFiltro} onChange={(e) => setPagamentoFiltro(e.target.value)}>
                            {uniquePagamentos.map(pagamento => (
                                <option key={pagamento}>{pagamento}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Botões de Ação para Filtros de Conteúdo */}
                    <div className="filtro-actions">
                        <button className="btn-apply" onClick={handleApplyFilters}>
                            Aplicar Filtros
                        </button>
                        <button className="btn-clear" onClick={handleClearFilters}>
                            Limpar Filtros
                        </button>
                    </div>
                </section>

                <h3 className="servicos-title">Fluxo de Caixa {getPeriodoTitle()}</h3>

                <div className="tabela-servicos-container">
                    <table className="tabela-servicos">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Serviços</th>
                                <th>Detalhes</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transacoesFiltradas.length > 0 ? (
                                transacoesFiltradas.map(t => (
                                    <tr key={t.id}>
                                        <td>{t.data}</td>
                                        <td>{t.descricao}</td>
                                        <td>{t.detalhes}</td>
                                        <td className={t.tipo === 'Entrada' ? 'valor-entrada' : 'valor-saida'}>
                                            {t.tipo === 'Entrada' ? '+' : '-'} R$ {t.valor.toFixed(2).replace('.', ',')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">Nenhuma transação encontrada no período/filtros selecionados.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="total-label">Total em Caixa:</td>
                                <td className="total-valor">R$ {totalCaixa.toFixed(2).replace('.', ',')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Caixa;
