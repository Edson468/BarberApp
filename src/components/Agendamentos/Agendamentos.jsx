// src/components/Agendamentos/Agendamentos.jsx
import React, { useState } from 'react';
import './Agendamentos.css';
import ModalAgendamento from './ModalAgendamento.jsx';

// Componentes auxiliares (mantidos como estão)
const StatCard = ({ title, value, color }) => (
  <div className="stat-card" style={{ backgroundColor: color }}>
    <p className="card-title">{title}</p>
    <p className="card-value">{value}</p>
  </div>
);

const AppointmentItem = ({ appointment, isSelected, onSelect, onComplete }) => (
  <div className="appointment-item">
    <input 
      type="radio" 
      name="selected-appointment"
      className="radio-button"
      checked={isSelected}
      onChange={() => onSelect(appointment)}
    />
    <div className="appointment-details">
      <p className="app-time">{appointment.time}</p>
      <p className="app-details">{appointment.details}</p>
      {appointment.status === 'pendente' && (
        <button 
          className="complete-btn" 
          onClick={(e) => { 
            e.stopPropagation(); 
            onComplete(appointment.id); 
          }}
        >
          Concluído
        </button>
      )}
    </div>
    <div className="appointment-price">
      <p className="app-price">
        {/* Garante que o preço (salvo como número) seja formatado corretamente */}
        R$ {Number(appointment.price).toFixed(2).replace('.', ',')}
      </p>
      <p className="app-duration">{appointment.duration}</p>
      {appointment.payment && <span className="app-payment">{appointment.payment}</span>}
    </div>
  </div>
);

const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

// --- NOVA FUNÇÃO AUXILIAR PARA PARSEAR DATA E HORA COMPLETA (ORDENAÇÃO) ---
const parseAppointmentDateTime = (timeString) => {
    // Espera o formato: 'DD/MM/YYYY às HH:MM - Nome'
    const match = timeString.match(/(\d{2}\/\d{2}\/\d{4}) às (\d{2}:\d{2})/);
    if (!match) return new Date(0); // Retorna uma data inválida se não houver correspondência

    const [datePart, timePart] = [match[1], match[2]];
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    // Cria um objeto Date: meses são baseados em zero (month - 1)
    // Usamos o ano atual se o ano estiver no futuro (pequena correção de ano)
    const currentYear = new Date().getFullYear();
    const finalYear = year < currentYear ? year : year;

    return new Date(finalYear, month - 1, day, hour, minute, 0);
};
// -----------------------------------------------------------------------


// --- Recebe as props 'servicos', 'agendamentos' e 'setAgendamentos' ---
function Agendamentos({ servicos, agendamentos, setAgendamentos, barbeiros, clientes }) {
  const todayDate = getTodayDate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState('diario');

  const handleOpenModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  }
  const handleCloseModal = () => setIsModalOpen(false);

  // A função handleSaveAgendamento agora usa a função setAgendamentos que veio da prop
  const handleSaveAgendamento = (agendamentoSalvo) => {
        
    const agendamentoFormatado = {
        id: agendamentoSalvo.id || Date.now(), 
        // Usa os dados já formatados que vêm do modal
        time: agendamentoSalvo.time,
        details: agendamentoSalvo.details,
        price: agendamentoSalvo.price, 
        duration: agendamentoSalvo.duration,
        payment: agendamentoSalvo.payment || 'Pagamento Pendente',
        status: agendamentoSalvo.status || 'pendente',
    };
    
    if (agendamentoSalvo.id) {
        setAgendamentos(agendamentos.map(agendamento =>
            agendamento.id === agendamentoSalvo.id ? agendamentoFormatado : agendamento
        ));
    } else {
        setAgendamentos(prevAgendamentos => [...prevAgendamentos, agendamentoFormatado]);
    }
    
    handleCloseModal();
  };

  const handleDeleteAgendamento = () => {
    if (selectedAppointment) {
      setAgendamentos(agendamentos.filter(agendamento => agendamento.id !== selectedAppointment.id));
      setSelectedAppointment(null);
    } else {
      alert("Por favor, selecione um agendamento para excluir.");
    }
  };

  const handleOpenEditModal = () => {
    if (selectedAppointment) {
      setIsModalOpen(true);
    } else {
      alert("Por favor, selecione um agendamento para alterar.");
    }
  };

  const handleCompleteAppointment = (id) => {
    setAgendamentos(agendamentos.map(agendamento => 
      agendamento.id === id ? { ...agendamento, status: 'concluido' } : agendamento
    ));
  };
  
  // Função auxiliar para converter a data do formato DD/MM/YYYY para objeto Date (usada nos filtros)
  const parseDateString = (dateString) => {
      const [day, month, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const todayDateString = getTodayDate();

    switch (filter) {
      case 'diario':
        return agendamentos.filter(agendamento => {
          const appointmentDate = agendamento.time.split(' ')[0];
          return appointmentDate === todayDateString;
        });

      case 'semanal':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); 
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return agendamentos.filter(agendamento => {
          const appointmentDate = parseDateString(agendamento.time.split(' ')[0]);
          return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
        });

      case 'periodo':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        return agendamentos.filter(agendamento => {
          const appointmentDate = parseDateString(agendamento.time.split(' ')[0]);
          return appointmentDate >= startOfMonth && appointmentDate <= endOfMonth;
        });
        
      default:
        return agendamentos;
    }
  };
  
  const agendamentosFiltrados = getFilteredAppointments();
  
  let agendamentosPendentesFiltrados = agendamentosFiltrados.filter(agendamento => agendamento.status === 'pendente');
  const agendamentosConcluidosFiltrados = agendamentosFiltrados.filter(agendamento => agendamento.status === 'concluido');

  // --- LÓGICA DE ORDENAÇÃO POR DATA E HORA APLICADA AQUI ---
  // Ordena os agendamentos pendentes do mais próximo (menor valor de Date) para o mais distante.
  agendamentosPendentesFiltrados.sort((a, b) => {
    const dateA = parseAppointmentDateTime(a.time);
    const dateB = parseAppointmentDateTime(b.time);
    
    // Retorna a diferença de tempo em milissegundos para ordenar
    return dateA - dateB; 
  });
  // --------------------------------------------------------

  // O cálculo do faturamento agora usa o campo 'price' que está como número
  const faturamentoTotal = agendamentosConcluidosFiltrados.reduce((total, agendamento) => {
      return total + agendamento.price;
  }, 0);

  return (
    <div className="agendamentos-container"> {/* Alterado para evitar conflito de classe */}
      <main className="main-content">
        
        <header className="main-header">
          <div className="header-actions">
            <button className="action-button include-btn" onClick={handleOpenModal}>Incluir</button>
            <button className="action-button alter-btn" onClick={handleOpenEditModal} disabled={!selectedAppointment}>Alterar</button>
            <button className="action-button exclude-btn" onClick={handleDeleteAgendamento} disabled={!selectedAppointment}>Excluir</button>
          </div>
          <div className="header-greeting">
            Bem vindo, Edson!
            <p className="header-date">{todayDate}</p>
          </div>
        </header>

        <section className="stats-row">
          <StatCard title="Agendamentos para hoje!" value={agendamentosPendentesFiltrados.length} color="#e67e22" />
          <StatCard title="Pendentes!" value={agendamentosPendentesFiltrados.length} color="#e67e22" />
          <StatCard title="Realizados!" value={agendamentosConcluidosFiltrados.length} color="#34495e" />
          <StatCard title="Faturamento!" value={`R$ ${faturamentoTotal.toFixed(2).replace('.', ',')}`} color="#34495e" />
        </section>

        <section className="filter-row">
            <button className={`filter-btn ${filter === 'diario' ? 'active' : ''}`} onClick={() => setFilter('diario')}>Diário</button>
            <button className={`filter-btn ${filter === 'semanal' ? 'active' : ''}`} onClick={() => setFilter('semanal')}>Semanal</button>
            <button className={`filter-btn ${filter === 'periodo' ? 'active' : ''}`} onClick={() => setFilter('periodo')}>Período</button>
        </section>

        <section className="appointments-row">
          <div className="appointments-column orange-panel">
            <h2>Agendamentos pendentes</h2>
            {agendamentosPendentesFiltrados.length > 0 ? (
              // Mapeia a lista JÁ ORDENADA
              agendamentosPendentesFiltrados.map(agendamento => (
                <AppointmentItem 
                  key={agendamento.id} 
                  appointment={agendamento} 
                  isSelected={selectedAppointment && selectedAppointment.id === agendamento.id}
                  onSelect={setSelectedAppointment}
                  onComplete={handleCompleteAppointment} 
                />
              ))
            ) : (
              <p>Não há agendamentos pendentes neste período.</p>
            )}
          </div>
          <div className="appointments-column gray-panel">
             <h2>Agendamentos concluídos</h2>
             {agendamentosConcluidosFiltrados.length > 0 ? (
               agendamentosConcluidosFiltrados.map(agendamento => (
                <AppointmentItem 
                  key={agendamento.id} 
                  appointment={agendamento} 
                  isSelected={selectedAppointment && selectedAppointment.id === agendamento.id}
                  onSelect={setSelectedAppointment}
                />
              ))
            ) : (
              <p>Não há agendamentos concluídos neste período.</p>
            )}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <ModalAgendamento 
          onClose={handleCloseModal} 
          onSave={handleSaveAgendamento}
          initialData={selectedAppointment}
          servicos={servicos}
          barbeiros={barbeiros}
          clientes={clientes}
        />
      )}
    </div>
  );
}

export default Agendamentos;