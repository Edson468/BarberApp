import React, { useState } from 'react';
// IMPORTANTE: Use useNavigate para fazer a navegação programática
import { useNavigate, Link } from 'react-router-dom';
import './Cadastro.css';

function Cadastro() {
  // Configuração dos estados para todos os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Hook para navegação programática (ex: ir para a página de Agendamentos)
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();

    // 1. Validação simples de senha
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    const dadosCadastro = {
      nome,
      email,
      telefone,
      senha
    };
    
    try {
      const response = await fetch('http://localhost:3001/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCadastro),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro no cadastro.');
      }

      alert('Usuário cadastrado com sucesso! Redirecionando para o login...');
      navigate('/'); // Redireciona para a tela de login após o sucesso
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="cadastro-container">
      {/* Bloco de formulário central, semelhante ao login */}
      <div className="cadastro-block">
        <div className="cadastro-form-panel">
          <div className="cadastro-card">
            <h1>Crie sua conta</h1>
            <p>Registre seus dados para começar a gerenciar sua barbearia.</p>

            <form onSubmit={handleCadastro}>
              
              {/* Nome */}
              <input 
                type="text" 
                placeholder="Nome Completo" 
                className="input-field"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              
              {/* Email */}
              <input 
                type="email" 
                placeholder="Email" 
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Telefone */}
              <input 
                type="tel" 
                placeholder="Telefone (DDD) 9xxxx-xxxx" 
                className="input-field"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
              
              {/* Senha */}
              <input 
                type="password" 
                placeholder="Senha" 
                className="input-field"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              {/* Confirmar Senha */}
              <input 
                type="password" 
                placeholder="Confirmar Senha" 
                className="input-field"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              
              {/* Botão Cadastrar */}
              <button type="submit" className="btn-cadastrar">
                Cadastrar
              </button>
              
              {/* Link para Login */}
              <p className="login-text">
                Já tem conta? <Link to="/" className="login-link">Fazer Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;