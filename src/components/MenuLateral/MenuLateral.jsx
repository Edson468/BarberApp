import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaCalendarAlt, FaTools, FaUserFriends, FaMoneyBillWave, FaSignOutAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import './MenuLateral.css';

function MenuLateral({ isCollapsed, toggleSidebar }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove o token de autenticação do armazenamento local
        // Isso impede que o usuário volte para as páginas protegidas
        localStorage.removeItem('authToken'); 
        
        // Redireciona o usuário para a rota de login
        // Esta rota deve estar configurada para renderizar o componente LoginScreen.jsx
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    {!isCollapsed && "BarberApp"}
                </div>
                <button className="menu-toggle-btn" onClick={toggleSidebar}>
                    <FaBars />
                </button>
            </div>
            <nav className="sidebar-nav">
                <Link to="/agendamentos" className={`nav-item agendamentos-icon ${location.pathname === '/agendamentos' ? 'active' : ''}`}>
                    <FaCalendarAlt /> {!isCollapsed && <span>Agendamentos</span>}
                </Link>
                <Link to="/servicos" className={`nav-item ${location.pathname === '/servicos' ? 'active' : ''}`}>
                    <FaTools /> {!isCollapsed && <span>Serviços</span>}
                </Link>
                {/* NOVO LINK ADICIONADO AQUI */}
                <Link to="/cadastro-barbeiro" className={`nav-item ${location.pathname === '/cadastro-barbeiro' ? 'active' : ''}`}>
                    <FaUserFriends /> {!isCollapsed && <span>Barbeiro</span>}
                </Link>
                <Link to="/cadastro-cliente" className={`nav-item ${location.pathname === '/cadastro-cliente' ? 'active' : ''}`}>
                    <FaUserFriends /> {!isCollapsed && <span>Cliente</span>}
                </Link>
                <Link to="/caixa" className={`nav-item ${location.pathname === '/caixa' ? 'active' : ''}`}>
                    <FaMoneyBillWave /> {!isCollapsed && <span>Caixa</span>}
                </Link>
                <Link to="/despesas" className={`nav-item ${location.pathname.startsWith('/despesas') ? 'active' : ''}`}>
                    <FaFileInvoiceDollar /> {!isCollapsed && <span>Despesas</span>}
                </Link>
            </nav>

            {/* O botão de Sair, posicionado no final do menu */}
            <div className="logout-container">
                <button onClick={handleLogout} className="nav-item logout-button">
                    <FaSignOutAlt /> {!isCollapsed && <span>Sair</span>}
                </button>
            </div>
        </aside>
    );
}

export default MenuLateral;