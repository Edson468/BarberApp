// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginScreen from './components/LoginScreen/LoginScreen';
import Cadastro from './components/Cadastro/Cadastro';
import Agendamentos from './components/Agendamentos/Agendamentos';
import CadastroCliente from './components/CadastroCliente/CadastroCliente.jsx';
import Servicos from './components/Servicos/Servicos'; 
import CadastroBarbeiro from './components/CadastroBarbeiro/CadastroBarbeiro'; 
import Caixa from './components/Caixa/Caixa';
import Despesas from './components/Despesas/Despesas';
import CadastroDespesa from './components/Despesas/CadastroDespesa';
import MenuLateral from './components/MenuLateral/MenuLateral';

const PageLayout = ({ children, isSidebarCollapsed, toggleSidebar }) => {
  return (
    // Adiciona uma classe dinâmica baseada no estado do menu
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <MenuLateral 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      {children}
    </div>
  );
};

function App() {
  // --- ESTADO GLOBAL: LISTA DE SERVIÇOS ---
  // Estado para controlar se o menu lateral está recolhido ou não
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Função para alternar o estado do menu (abrir/fechar)
  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

  const [servicosCadastrados, setServicosCadastrados] = useState([]);

  // --- ESTADO GLOBAL: LISTA DE CLIENTES ---
  const [clientesCadastrados, setClientesCadastrados] = useState([]);

  // --- ESTADO GLOBAL: LISTA DE BARBEIROS ---
  const [barbeiros, setBarbeiros] = useState([]);

  // --- ESTADO GLOBAL: LISTA DE DESPESAS ---
  const [despesas, setDespesas] = useState([]);

  // --- ESTADO GLOBAL: LISTA DE AGENDAMENTOS ---
  // Adicionei dados de exemplo para que você possa testar a persistência
  const [agendamentos, setAgendamentos] = useState([]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/cadastro" element={<Cadastro />} />
          
          <Route path="/agendamentos" element={
            <PageLayout isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
              <Agendamentos 
                servicos={servicosCadastrados} 
                agendamentos={agendamentos}
                setAgendamentos={setAgendamentos}
                barbeiros={barbeiros}
                clientes={clientesCadastrados}
              />
            </PageLayout>
          } />

          <Route path="/servicos" element={
            <PageLayout isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
              <Servicos servicos={servicosCadastrados} setServicos={setServicosCadastrados} />
            </PageLayout>
          } />

          <Route path="/cadastro-cliente" element={
            <PageLayout isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
              <CadastroCliente 
                clientes={clientesCadastrados} 
                setClientes={setClientesCadastrados} 
              />
            </PageLayout>
          } />

          <Route path="/cadastro-barbeiro" element={
            <PageLayout isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
              <CadastroBarbeiro barbeiros={barbeiros} setBarbeiros={setBarbeiros} />
            </PageLayout>
          } />

          <Route path="/caixa" element={
            <PageLayout isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
              <Caixa agendamentos={agendamentos} despesas={despesas} />
            </PageLayout>
          } />

          <Route path="/despesas" element={
            <PageLayout isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
              <Despesas despesas={despesas} />
            </PageLayout>
          } />

          <Route path="/cadastro-despesa" element={
            <PageLayout isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
              <CadastroDespesa despesas={despesas} setDespesas={setDespesas} />
            </PageLayout>
          } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;