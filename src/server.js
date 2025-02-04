const express = require('express');
const { PORT, CHECK_INTERVAL } = require('./config');
const { initializeBrowser } = require('./browser');
const { checkNewPost } = require('./instagram');

let isChecking = false;

const app = express();
app.use(express.json());

// Valida e checa novas postagens, só passa após fazer o check completo.
// setInterval(async () => {
//   if (isChecking) return; // Evita execuções simultâneas

//   isChecking = true;
//   try {
//     await checkNewPost();
//   } catch (error) {
//     console.error("Erro ao verificar novo post:", error);
//   } finally {
//     isChecking = false;
//   }
// }, CHECK_INTERVAL);

app.listen(PORT, async () => {
  console.log(`\n🛜  Servidor rodando na porta ${PORT}`);
  console.log('\n==============================');
  await initializeBrowser();
  await checkNewPost();

  //TODO: ver depois
  console.log("\n✅ Finalizando processo...");
  process.exit(0); // Finaliza o processo com código 0 (sucesso)
});
