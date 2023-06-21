const express = require('express');
const fs = require('fs/promises');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_NOT_FOUND_STATUS = 404;
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

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = JSON.parse(await fs.readFile('/app/src/talker.json', 'utf-8'));
  const findTalkerById = data.find((talker) => Number(talker.id) === Number(id)); 
  if (!findTalkerById) {
    res.status(HTTP_NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(HTTP_OK_STATUS).json(findTalkerById);
});

app.post('/login', (req, res) => {
  const generateToken = () => crypto.randomBytes(8).toString('hex');
  return res.status(HTTP_OK_STATUS).json({ token: generateToken() });
});