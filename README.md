# Stalker Insta Bot

Stalker Insta Bot é um bot automatizado desenvolvido com Puppeteer e Express que monitora postagens no Instagram e envia notificações para o Telegram sempre que um novo post é detectado.

## Funcionalidades
- Acessa e faz login no Instagram automaticamente.
- Monitora postagens de um perfil específico.
- Captura imagens e legendas das postagens.
- Envia notificações via Telegram com os detalhes do post.
- Reinicializa automaticamente caso perca conexão com o navegador.

## Tecnologias Utilizadas
- [Puppeteer](https://pptr.dev/) - Automação de navegador.
- [Express](https://expressjs.com/) - Servidor web.
- [Axios](https://axios-http.com/) - Requisições HTTP.
- [Dotenv](https://www.npmjs.com/package/dotenv) - Gerenciamento de variáveis de ambiente.

## Configuração e Uso

### 1. Clonar o Repositório
```sh
git clone https://github.com/seu-usuario/stalker-insta-bot.git
cd stalker-insta-bot
```

### 2. Instalar Dependências
```sh
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:
```ini
PORT=3000
INSTAGRAM_USERNAME=seu_usuario
INSTAGRAM_PASSWORD=sua_senha
INSTAGRAM_TARGET=usuario_a_monitorar
INSTAGRAM_TARGET_CLASS=.classe_da_pagina
INSTAGRAM_TARGET_TAG=.tag_da_pagina
TELEGRAM_TOKEN=seu_token_telegram
TELEGRAM_CHAT_ID=seu_chat_id
OPENAI_API_KEY=sua_chave_openai
```

### 4. Iniciar o Bot
```sh
node index.js
```

O bot iniciará o servidor e começará a monitorar as postagens do perfil especificado.

## Contribuição
Sinta-se à vontade para abrir issues e enviar pull requests para melhorias.

## Licença
Este projeto está sob a licença MIT.

