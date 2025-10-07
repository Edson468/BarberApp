import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Despesas.css';

function Despesas({ despesas = [] }) {
    const navigate = useNavigate();

    const totalDespesas = despesas.reduce((acc, despesa) => acc + despesa.valor, 0);

    const handleNavigateToCadastro = () => {
        navigate('/cadastro-despesa');
    };

    return (
        <div className="despesas-container-wrapper page-content">
            <div className="despesas-content">
                <header className="despesas-header">
                    <h2>Controle de Despesas</h2>
                    <button className="btn-novo" onClick={handleNavigateToCadastro}>
                        + Novo Lançamento
                    </button>
                </header>

                <section className="despesas-summary">
                    <div className="summary-card-despesa">
                        <h4>Total de Despesas</h4>
                        <p>
                            {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                </section>

                <section className="despesas-list-view">
                    <h3>Últimos Lançamentos</h3>
                    <div className="despesas-list-items">
                        {despesas.map((despesa) => (
                            <div key={despesa.id} className="despesa-list-item">
                                <div className="despesa-list-info">
                                    <span className="despesa-list-data">
                                        {new Date(despesa.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="despesa-list-descricao">{despesa.descricao}</span>
                                </div>
                                <div className="despesa-list-details">
                                    <span className="despesa-list-categoria">{despesa.categoria}</span>
                                    <span className="despesa-list-valor">
                                        {despesa.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Despesas;