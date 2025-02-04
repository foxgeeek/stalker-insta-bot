# Stalker Insta Bot

Stalker Insta Bot é um bot automatizado desenvolvido com Puppeteer e Express que monitora postagens no Instagram e envia notificações para o Telegram sempre que um novo post é detectado. Agora, o bot também utiliza OpenAI para gerar textos dinâmicos nas notificações, tornando as mensagens mais personalizadas e interativas.

## 🚀 Funcionalidades
- Acessa e faz login no Instagram automaticamente.  
- Monitora postagens de um perfil específico ou múltiplos perfis.  
- Captura imagens e legendas das postagens.  
- Gera descrições dinâmicas usando OpenAI.  
- Envia notificações via Telegram com os detalhes do post.  
- Suporte para múltiplas instâncias para monitorar diferentes perfis.  
- Reinicializa automaticamente caso perca conexão com o navegador.  

## 🛠️ Tecnologias Utilizadas
- [Puppeteer](https://pptr.dev/) - Automação de navegador.  
- [Express](https://expressjs.com/) - Servidor web.  
- [Axios](https://axios-http.com/) - Requisições HTTP.  
- [Dotenv](https://www.npmjs.com/package/dotenv) - Gerenciamento de variáveis de ambiente.  
- [OpenAI API](https://openai.com) - Geração de texto dinâmico.  

## ⚙️ Configuração e Uso

### 1️⃣ Clonar o Repositório  
```sh
git clone https://github.com/seu-usuario/stalker-insta-bot.git
cd stalker-insta-bot
```

### 2️⃣ Instalar Dependências  
```sh
npm install
```

### 3️⃣ Configurar Variáveis de Ambiente  
Reutilize o arquivo `.env-example` que está na raíz do projeto. Copiando e colando na raiz do projeto, em seguida renomeando para `.env` e modificando as variáveis:  

#### 🔧 Exemplo de `.env`
```ini
# Configuração do servidor
PORT=8080
CHECK_INTERVAL=300000  # Intervalo de checagem em milissegundos (5 minutos)

# Configuração do Telegram
TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=

# Configuração do Instagram
INSTAGRAM_TARGET_CLASS=.x4gyw5p
INSTAGRAM_TARGET_TAG=h1

INSTAGRAM_TARGET=
INSTAGRAM_USERNAME=
INSTAGRAM_PASSWORD=

# Configuração do OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Configuração para múltiplas instâncias
INSTAGRAM_TARGET_LIST=fulano1,fulano2
NUM_INSTANCES=2
```

### 4️⃣ Iniciar o Bot  
```sh
node index.js
```
ou, para rodar com **nodemon**:  
```sh
npx nodemon index.js
```

O bot iniciará o servidor e começará a monitorar as postagens do(s) perfil(is) especificado(s).  

## 🤝 Contribuição
Sinta-se à vontade para abrir issues e enviar pull requests para melhorias.  

## 📛 Licença
Este projeto está sob a licença MIT.  
