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

const talkersList = async () => {
  const data = await fs.readFile(route, 'utf-8');
  const talkers = JSON.parse(data);
  return talkers;
};

const isDateDDMMYYYY = (value) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(value)) {
    throw new Error('O campo "watchedAt" deve ter o formato "dd/mm/aaaa"');
  }
  return true;
};

// Middleware para validar data de acordo com o formato dd/mm/yyyy
const validateDateDDMMYYYY = (field) => body(field).custom(isDateDDMMYYYY);

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (req, res) => {
  const talkers = await talkersList();
  return res.status(HTTP_OK_STATUS).json(talkers);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await talkersList();
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
const teste = [
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
  validateDateDDMMYYYY('talk.watchedAt'),
];

app.post('/talker', teste, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
  const talkers = await talkersList();
  const newTalker = { ...req.body, id: talkers.length + 1 };
  talkers.push(newTalker);
  await fs.writeFile(route, JSON.stringify(talkers));
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
  const talkers = await talkersList();
  return res.status(HTTP_OK_STATUS).json(talkers);
});

// REQUISITO 07 - só rascunho 
app.delete('/talker/:id', [
  header('authorization').notEmpty().withMessage('Token não encontrado'),
  header('authorization').isLength({ min: 16, max: 16 }).withMessage('Token inválido'),
], async (req, res) => 
// const talkers = await talkersList();
res.status(HTTP_NO_CONTENT).json());