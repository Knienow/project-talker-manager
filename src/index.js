const express = require('express');
const { readData } = require('./utils/readAndWriteData');

const app = express();
// Dentro do app.use(), passamos uma outra função é ela que habilita a possibilidade de recebermos dados pelo corpo (body) de nossa requisição. 
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (_req, res) => {
  const talkers = await readData();
  if (talkers) {
    return res.status(HTTP_OK_STATUS).json(talkers);
  }
  return res.status(HTTP_OK_STATUS).json({ message: [] });
});