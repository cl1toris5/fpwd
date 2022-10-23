const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')
const { Joi, celebrate } = require('celebrate');
const { v4: uuidv4 } = require('uuid');

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3000

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get(
  '/questions/:questionId',
  celebrate({
    params: Joi.object({
      questionId: Joi.string().required(),
    }),
  }),
  async (req, res, next) => {
    const { questionId } = req.params;
    try {
      const question = await req.repositories.questionRepo.getQuestionById(questionId) || {};
      res.status(200).send(question);
    } catch(e) {
      return next(e);
    }
  }
);

app.post(
  '/questions',
  celebrate({
    body: Joi.object({
      author: Joi.string().required(),
      summary: Joi.string().required(),
      answers: Joi.array().items({
        author: Joi.string(),
        summary: Joi.string(),
      }).optional(),
    }).required(),
  }),
  async (req, res) => {
    const { answers, author, summary } = req.body;
    const answersWithId = answers?.length > 0 ? answers.map((answer) => {
      return {
        author: answer.author,
        summary: answer.summary,
        id: uuidv4(),
      };
    }) : [];
    const dataToSave = {
      id: uuidv4(),
      author,
      summary,
      answers: answersWithId,
    };
    await req.repositories.questionRepo.pushQuestion(dataToSave)
    res.send(dataToSave);
  });

app.get(
  '/questions/:questionId/answers',
  celebrate({
    params: Joi.object({
      questionId: Joi.string().required()
    })
  }),
  async (req, res) => {
    const { questionId } = req.params;
    const answers = await req.repositories.questionRepo.getAnswers(questionId);
    if (answers) {
      return res.status(200).send(answers);
    }
    return res.status(404).send('Not found');
});

app.post(
  '/questions/:questionId/answers',
  celebrate({
    params: Joi.object({
      questionId: Joi.string().required(),
    }),
    body: Joi.object({
      author: Joi.string(),
      summary: Joi.string()
    })
  }),
  async (req, res, next) => {
    const { questionId } = req.params;
    const { author, summary } = req.body;
    const answer = { author, summary, id: uuidv4() };
    const questions = await req.repositories.questionRepo.getQuestions();
    const questionsIncludesId = questions.find((q) => q.id === questionId);
    if (!questionsIncludesId) {
      return res.status(404).send('Question with provided ID not found');
    }
    try {
      await req.repositories.questionRepo.addAnswer(questionId, answer);
      return res.status(200).send('ok');
    } catch(e) {
      return next(e);
    }
  }
);

app.get(
  '/questions/:questionId/answers/:answerId',
  celebrate({
    params: Joi.object({
      questionId: Joi.string(),
      answerId: Joi.string()
    }).required()
  }),
  async (req, res) => {
    const { questionId, answerId } = req.params;
    const answer = await req.repositories.questionRepo.findAnswerInQuestion(questionId, answerId);
    if (!answer) {
      return res.status(404).send('Not found');
    }
    return res.status(200).send(answer);
  }
);

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})
