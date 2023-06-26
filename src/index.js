const express = require('express');
const fs = require('fs/promises');
const crypto = require('crypto');
const path = require('path');
const { body, validationResult, header } = require('express-validator');

const app = express();
app.use(express.json());

const route = path.join(__dirname, '/talker.json');
const HTTP_OK_STATUS = 200;
const HTTP_CREATED = 201;
const HTTP_NOT_FOUND_STATUS = 404;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NO_CONTENT = 204;
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

// REQUISITO 05
// req.body: o corpo da solicitação HTTP. Pode ser qualquer valor, porém objetos, arrays e outras primitivas JavaScript funcionam melhor.
// req.cookies: o cabeçalho do Cookie analisado como um objeto do nome do cookie ao seu valor.
// req.headers: os cabeçalhos enviados junto com a requisição HTTP.
// req.params: um objeto do nome ao valor.
// Em express.js, isso é analisado a partir do caminho da solicitação e combinado com o caminho de definição de rota, mas pode ser realmente
// qualquer coisa significativa proveniente da solicitação HTTP.
// req.query: a parte após o ? no caminho da solicitação HTTP, analisado como um objeto do nome do parâmetro de consulta para o valor.
app.post('/talker', [
  header('authorization').notEmpty().withMessage('Token não encontrado'),
  header('authorization').isLength({ min: 16, max: 16 })
  .withMessage('Token inválido'),
  body('name').notEmpty().withMessage('O campo "name" é obrigatório'),
  body('name').isLength({ min: 3 })
  .withMessage('O "name" deve ter pelo menos 3 caracteres'),
  body('age').notEmpty().withMessage('O campo "age" é obrigatório'),
  body('age').isInt({ min: 18 })
  .withMessage('O campo "age" deve ser um número inteiro igual ou maior que 18'),
  body('talk').notEmpty().withMessage('O campo "talk" é obrigatório'),
  body('talk.watchedAt').notEmpty().withMessage('O campo "watchedAt" é obrigatório'),
  body('talk.rate').notEmpty().withMessage('O campo "rate" é obrigatório'),
  body('talk.rate').isInt({ min: 1, max: 5 })
  .withMessage('O campo "rate" deve ser um número inteiro entre 1 e 5'),
  body('talk.watchedAt').isDate()
  .withMessage('O campo "watchedAt" deve ter o formato "dd/mm/aaaa"'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const message = errors.errors[0].msg;
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(HTTP_UNAUTHORIZED).json({ message });
    } 
    if (authorization.length !== 16) {
      return res.status(HTTP_UNAUTHORIZED).json({ message });
    }
    return res.status(HTTP_BAD_REQUEST).json({ message });
  }
  const talkers = JSON.parse(fs.readFile(route, 'utf-8'));
  const newTalker = { ...req.body, id: talkers.length + 1 };
  talkers.push(newTalker);
  await fs.writeFile(route, JSON.stringify(newTalker));
  return res.status(HTTP_CREATED).json(newTalker);
});

// REQUISITO 06 - só rascunho 
app.put('/talker/:id', [  
  header('authorization').notEmpty().withMessage('Token não encontrado'),
  header('authorization').isLength({ min: 16, max: 16 })
  .withMessage('Token inválido'),
  body('name').notEmpty().withMessage('O campo "name" é obrigatório'),
  body('name').isLength({ min: 3 })
  .withMessage('O "name" deve ter pelo menos 3 caracteres'), 
  body('age').notEmpty().withMessage('O campo "age" é obrigatório'),
  body('age').isInt({ min: 18 })
  .withMessage('O campo "age" deve ser um número inteiro igual ou maior que 18'),
  body('talk').notEmpty().withMessage('O campo "talk" é obrigatório'),
  body('talk.watchedAt').notEmpty().withMessage('O campo "watchedAt" é obrigatório'),
  body('talk.watchedAt').isDate()
  .withMessage('O campo "watchedAt" deve ter o formato "dd/mm/aaaa"'),
  body('talk.rate').notEmpty().withMessage('O campo "rate" é obrigatório'),
  body('talk.rate').isInt({ min: 1, max: 5 })
  .withMessage('O campo "rate" deve ser um número inteiro entre 1 e 5'),
  body('id').notEmpty().withMessage('Pessoa palestrante não encontrada'),
], async (req, res) => {
  const data = fs.readFile(route, 'utf-8');
  const talker = JSON.parse(data);
  return res.status(HTTP_OK_STATUS).json(talker);
});

// REQUISITO 07 - só rascunho 
app.delete('/talker/:id', [
  header('authorization').notEmpty().withMessage('Token não encontrado'),
  header('authorization').isLength({ min: 16, max: 16 }).withMessage('Token inválido'),
], async (req, res) => res.status(HTTP_NO_CONTENT).json());