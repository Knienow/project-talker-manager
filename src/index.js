const express = require('express');
const fs = require('fs/promises');

const app = express();
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

app.get('/talker', async (req, res) => {
  const data = await fs.readFile('/app/src/talker.json', 'utf-8');
  const talkers = JSON.parse(data);
  return res.status(HTTP_OK_STATUS).json(talkers);
});