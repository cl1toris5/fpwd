const { readFile, writeFile } = require('fs/promises')

const makeQuestionRepository = fileName => {
  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)
    return questions;
  };

  const getQuestionById = async questionId => {
    const questions = await getQuestions();
    const questionById = questions.find((question) => question?.id === questionId);
    if (!questionId) {
      return null;
    }
    return questionById;
  };

  const addQuestion = async question => {
    const questions = await getQuestions();
    const updatedQuestions = [...questions, question];
    try {
      await writeFile(fileName, JSON.stringify(updatedQuestions));
    } catch(e) {
      return e;
    }
  };

  const getAnswers = async questionId => {
    const questions = await getQuestions();
    const answers = questions.find((q) => q.id === questionId)?.answers || null;
    return answers;
  };

  const getAnswer = async (questionId, answerId) => {
    const questions = await getQuestions();
    const questionById = questions.find((q) => q.id === questionId);
    if (!questionById) {
      return null;
    }
    const answer = questionById?.answers.find((answer) => answer.id === answerId) || null;
    return answer;
  };

  const addAnswer = async (questionId, answer) => {
    const questions = await getQuestions();
    const objectWithId = questions.find((q) => q.id === questionId);
    if (!objectWithId) {
      return null;
    }
    objectWithId?.answers.push(answer);
    const dataToSave = questions.filter((q) => q.id !== questionId).push(objectWithId);
    const updatedQuestions = [...questions, dataToSave];
    try {
      await writeFile(fileName, JSON.stringify(updatedQuestions));
    } catch(e) {
      return e;
    }
  };

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer,
  };
};

module.exports = { makeQuestionRepository };
