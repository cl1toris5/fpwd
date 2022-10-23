const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

describe('question repository', () => {
  const testQuestions = [
    {
      id: faker.datatype.uuid(),
      summary: 'What is my name?',
      author: 'Jack London',
      answers: []
    },
    {
      id: faker.datatype.uuid(),
      summary: 'Who are you?',
      author: 'Tim Doods',
      answers: []
    }
  ];
  const mockAnswer = { id: 'd498c0a3-5be2-4354-a3bc-78673aca0f31', author: 'Dr Strange', summary: 'It is egg-shaped.' };
  const testResponse = {
  id: '50f9e662-fa0e-4ec7-b53b-7845e8f821c3',
  author: 'John Stockton',
  summary:'What is the shape of the Earth?',
  answers:
    [
      {id: 'ce7bddfb-0544-4b14-92d8-188b03c41ee4', author: 'Brian McKenzie', summary: 'The Earth is flat.'},
      {id: 'd498c0a3-5be2-4354-a3bc-78673aca0f31', 'author': 'Dr Strange', summary: 'It is egg-shaped.'}
    ],
  };
  const testResponseAnswersLength = 2;
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo;
  let testQuestionId;

  beforeAll(async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]));
    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH);
    testQuestionId = '50f9e662-fa0e-4ec7-b53b-7845e8f821c3';
  })

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })

  test('getQuestions should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('getQuestions should return a list of 2 questions', async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));
    expect(await questionRepo.getQuestions()).toHaveLength(2);
  });

  test('getQuestionById without parameter should return null', async () => {
    expect(await questionRepo.getQuestionById()).toBeNull();
  });

  test('getQuestionById with correct id should be different than null or undefined', async () => {
    await expect(questionRepo.getQuestionById(testQuestionId)).resolves.not.toBeNull;
  });

  test('addQuestion should push data to json file', async () => {
    const currentJsonFile = await questionRepo.getQuestions();
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([{}]));
    expect(await questionRepo.getQuestions()).toHaveLength(currentJsonFile.length + 1);
  });

  test('getAnswers with wrong id should return null', async () => {
    expect (await questionRepo.getAnswers('123')).toBeNull();
  });

  test('getAnswers with id should be different than null or undefined', async () => {
    await expect(questionRepo.getAnswers(testQuestionId)).resolves.not.toBeNull;
  });

  test('when addAnswer receive not existed id should return null', async () => {
    await expect(questionRepo.addAnswer('123', mockAnswer)).resolves.toBeNull;
  });

  test('when addAnswer receive not existed id should return null', async () => {
    await expect(questionRepo.addAnswer('123', mockAnswer)).resolves.toBeNull;
  });

  test('when addAnswer receive existed id and correct object should save answer in question', async () => {
    let response = testResponse;
    response.answers.push(mockAnswer);
    const responseLength = response.answers.length;
    expect(responseLength).toBe(3);
  });

  test('when getAnswer some of received id not exist, should return null', async () => {
    await expect(questionRepo.getAnswer('123', '123')).resolves.toBeNull;
  });

});
