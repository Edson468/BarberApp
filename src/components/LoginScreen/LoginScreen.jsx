import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginScreen.css';

function LoginScreen() {
  // Variáveis de Estado (para capturar o que o usuário digita)
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  // Hook para navegação programática
  const navigate = useNavigate();

  // Função que será chamada ao submeter o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login.');
      }

      // Lógica de sucesso no login
      alert(`Bem-vindo, ${data.user.nome}!`);
      // No futuro, podemos salvar os dados do usuário logado aqui
      // Ex: localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redireciona para a página de agendamentos
      navigate('/agendamentos');

    } catch (error) {
      // Exibe a mensagem de erro que veio do backend
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      
      {/* Bloco Central */}
      <div className="login-block">
          
          {/* Painel Esquerdo: Formulário de Login */}
          <div className="login-panel left-panel">
            <div className="login-card">
              <h1>Olá, Bem vindo!</h1>
              
              <form onSubmit={handleSubmit}>
                
                {/* Campo de Login/Email */}
                <input 
                  type="text" 
                  placeholder="Login" 
                  className="input-field"
                  value={login} 
                  onChange={(e) => setLogin(e.target.value)}
                />
                
                {/* Campo de Senha */}
                <input 
                  type="password" 
                  placeholder="Senha" 
                  className="input-field"
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)}
                />
                
                {/* Link Esqueceu a senha */}
                <a href="#!" className="forgot-password">Esqueceu a senha?</a>
                
                {/* Botão Entrar */}
                <button type="submit" className="btn-entrar">
                  Entrar
                </button>
                
                {/* Link Cadastre-se */}
                <p className="signup-text">
                  Não tem conta? <Link to="/cadastro" className="signup-link">Cadastre-se</Link>
                </p>
              </form>
            </div>
          </div>

          {/* Painel Direito: Imagem de Fundo */}
          <div
            className="login-panel right-panel"
            style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/BarberTools.png)` }}
          >
          </div>
          
      </div> {/* Fim do .login-block */}

    </div>
  );
}

export default LoginScreen;