const express = require('express');
const fs = require('fs/promises');
const crypto = require('crypto');
const path = require('path');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

const route = path.join(__dirname, '/talker.json');
const HTTP_OK_STATUS = 200;
const HTTP_NOT_FOUND_STATUS = 404;
const HTTP_BAD_REQUEST = 400;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (req, res) => {
  const data = await fs.readFile(route, 'utf-8');
  const talkers = JSON.parse(data);
  return res.status(HTTP_OK_STATUS).json(talkers);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile(route, 'utf-8');
  const talkers = JSON.parse(data);
  const findTalkerById = talkers.find((talker) => Number(talker.id) === Number(id)); 
  if (!findTalkerById) {
    res.status(HTTP_NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(HTTP_OK_STATUS).json(findTalkerById);
});

// app.post('/login', (req, res) => {
//   const generateToken = () => crypto.randomBytes(8).toString('hex');
//   return res.status(HTTP_OK_STATUS).json({ token: generateToken() });
// });

// parei na mensagem de erro - acredito que o formato esperado pelo teste não é o mesmo que está sendo utilizado na linha 57
// verificar se é possível pegar apenas o valor de msg para adaptar ao formato exigido no teste

app.post('/login', [
  body('email').notEmpty().withMessage('O campo "email" é obrigatório'),
  body('password').notEmpty().withMessage('O campo "password" é obrigatório'),
  body('email').isEmail().withMessage('O "email" deve ter o formato "email@email.com"'),
  body('password').isLength({ min: 6 })
  .withMessage('O "password" deve ter pelo menos 6 caracteres'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.errors[0].msg;
    return res.status(HTTP_BAD_REQUEST).json({ message });
  }
  const generateToken = () => crypto.randomBytes(8).toString('hex');
  return res.status(HTTP_OK_STATUS).json({ token: generateToken() });
});
