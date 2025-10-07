# BarberApp 2.0 - Gestor de Barbearia Full-Stack

## 🚀 Visão Geral do Projeto

O **BarberApp 2.0** é um sistema completo de gestão de barbearias, desenvolvido como uma **reconstrução moderna** de um projeto anterior (feito em Django).

O foco desta versão é oferecer uma **interface moderna, rápida e dinâmica** para gerenciar clientes, serviços, agendamentos e, principalmente, o **controle financeiro** da barbearia.

### 🛠️ Stack Tecnológica

Este projeto utiliza uma arquitetura Full-Stack moderna (MERN/NERN-like):

* **Front-end:** **React.js**
* **Back-end:** **Node.js**
* **Banco de Dados:** **SQLite** (Ideal para ambientes de pequeno e médio porte)

## ✨ Principais Funcionalidades

O BarberApp 2.0 foi desenhado para ser uma ferramenta essencial no dia a dia da barbearia, oferecendo as seguintes funcionalidades:

### 📅 Agendamento Inteligente e Dinâmico
* Otimização do tempo de agendamento com um sistema de **"autocompletar"** que sugere nomes de clientes, barbeiros e serviços, puxando automaticamente valores e tempo estimado do banco de dados.

### 💰 Controle Financeiro Integrado
* **Gestão de Despesas:** Módulo dedicado para o usuário registrar todas as despesas operacionais da barbearia (aluguel, produtos, etc.).
* **Controle de Caixa:** O caixa agora contabiliza automaticamente as despesas inseridas, fornecendo um lucro/saldo mais preciso e em tempo real.

### 📂 Relatórios e Exportação
* Melhor controle de dados com a funcionalidade de **exportação de relatórios** e registros nos formatos **CSV** e **PDF**.

### 👤 Cadastros Simplificados
* Telas ágeis para o cadastro rápido e fácil de:
    * Clientes
    * Barbeiros
    * Serviços

---

## 💻 Instalação e Execução Local

Este projeto foi inicializado com o Create React App e possui um Back-end em Node.js.

### Pré-requisitos

* **Node.js** e **npm** (ou Yarn) instalados.
* Conhecimento básico em **React.js** e **Node.js**.

### Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Edson468/BarberApp.git](https://github.com/Edson468/BarberApp.git)
    cd BarberApp
    ```

2.  **Instale as dependências do Back-end (Node.js):**
    * *Assumindo que o código do Back-end está em uma pasta chamada `server` ou na raiz:*
    ```bash
    # Se o Back-end estiver em uma pasta separada (ex: server)
    cd server
    npm install
    cd ..
    ```

3.  **Instale as dependências do Front-end (React):**
    ```bash
    npm install
    ```

4.  **Configurar e Iniciar o Back-end:**
    * Crie o arquivo de banco de dados SQLite e inicie o servidor (instruções específicas podem variar dependendo da sua estrutura de pasta e scripts).
    ```bash
    # Exemplo (pode variar)
    npm run start:server 
    ```

5.  **Iniciar o Front-end (React):**
    ```bash
    npm start
    ```

O aplicativo será executado em modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizá-lo no seu navegador.

---

## 📜 Scripts do Create React App

No diretório do projeto, você pode executar:

### `npm start`
Executa o aplicativo React em modo de desenvolvimento.

### `npm run build`
Cria a versão de produção do aplicativo na pasta `build`.

### `npm test`
Inicia o executor de testes em modo interativo.
