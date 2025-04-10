// imports used for the project
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, StyleSheet } from 'react-native';
import { ButtonGroup } from 'react-native-elements';

const Stack = createStackNavigator();

// example JSON modified to provide to the "data" route parameter of the Question component
const questions = [
  {
    prompt: 'Which of these can fly?',
    type: 'multiple-choice',
    choices: ['Elephant', 'Penguin', 'Bat', 'Mouse'],
    correct: 2 // correct answer: Bat
  },
  {
    prompt: 'Which animals have four legs? Select all that apply.',
    type: 'multiple-answer',
    choices: ['Cat', 'Dog', 'Fish', 'Bird'],
    correct: [0, 1] // correct answers: Cat and Dog
  },
  {
    prompt: 'True or False: Cats can see in the dark',
    type: 'true-false',
    choices: ['True', 'False'],
    correct: 0 // correct answer: True
  }
];

/////////

// function that controls the questions component
function Question({ route, navigation }) {
  const { questions, questionIndex } = route.params; // questions and index from route.params like the assignment requires
  const [chosenAnswers, setChosenAnswers] = useState([]);
  const answers = route.params.answers;
  const setAnswers = route.params.setAnswers;
  const setQuestionIndex = route.params.setQuestionIndex;

  const question = questions[questionIndex];

  // updates the chosenAnswers when answers are pressed and submitted
  useEffect(function () {
    if (answers[questionIndex]) {
      setChosenAnswers(answers[questionIndex]);
    } else {
      setChosenAnswers([]);
    }
  }, [answers, questionIndex]);

  // allows for multiple-answer questions for selection on this type of question
  function selectionControl(selectedIndex) {
    let updatedAnswers;

    if (question.type === 'multiple-answer') {
      if (chosenAnswers.includes(selectedIndex)) {
        updatedAnswers = chosenAnswers.filter(function (i) {
          return i !== selectedIndex;
        });
      } else {
        updatedAnswers = chosenAnswers.concat(selectedIndex);
      }
    } else {
      updatedAnswers = [selectedIndex];
    }

    setChosenAnswers(updatedAnswers);
  }

  // moves to the next question. after going through the questions, it navigates to the summary page
  function next() {
    const updatedAllAnswers = answers.slice();
    updatedAllAnswers[questionIndex] = chosenAnswers;
    setAnswers(updatedAllAnswers);

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      navigation.navigate('Summary');
    }
  }

  // displays the questions on the screen. uses ButtonGroup to display buttons (referenced react native elements documents)
  return (
    <View style={questionStyles.container}>
      <Text style={questionStyles.question}>{question.prompt}</Text>

      <ButtonGroup
        testID="choices"
        onPress={selectionControl}
        selectedIndexes={question.type === 'multiple-answer' ? chosenAnswers : undefined}
        selectedIndex={question.type !== 'multiple-answer' ? chosenAnswers[0] : undefined}
        buttons={question.choices}
        vertical
        buttonStyle={questionStyles.buttonStyle}
        selectedButtonStyle={questionStyles.selectedButtonStyle}
        textStyle={questionStyles.buttonTextStyle}
      />

      <Button
        testID="next-question"
        title="Next Question"
        onPress={next}
        disabled={chosenAnswers.length === 0}  // if there is no answer chosen, the next button is disabled
        color="#ff69b4"
      />
    </View>
  );
}

/////////

// function that controls the summary component
function Summary(props) {
  const navigation = props.navigation;
  const questions = props.questions;
  const answers = props.answers;

  // a restart quiz button when the summary is reached
  function quizRestart() {
    props.setAnswers([]);
    props.setQuestionIndex(0);
    navigation.navigate('Question');
  }

  // function to see if the answer is correct or incorrect.
  function correctOrIncorrect(question, playerAnswer) {
    if (!playerAnswer) {
      return false;
    }
    if (Array.isArray(question.correct)) {
      if (playerAnswer.length !== question.correct.length) {
        return false;
      }
      return playerAnswer.every(function (ans) {
        return question.correct.includes(ans);
      });
    }
    return playerAnswer[0] === question.correct;
  }

  var totalScore = 0;

  // displays the summary on the screen. uses ButtonGroup according to the rect native elements docs.
  return (
    <View style={summaryStyles.container}>
      <Text style={summaryStyles.title}>Summary</Text>

      {questions.map(function (question, qIndex) {
        var playerAnswer = answers[qIndex];
        var correct = correctOrIncorrect(question, playerAnswer);

        if (correct) {
          totalScore += 1;
        }

        return (
          <View key={qIndex} style={summaryStyles.questionContainer}>
            <Text style={summaryStyles.prompt}>{question.prompt}</Text>
            <Text style={correct ? summaryStyles.correctLabel : summaryStyles.incorrectLabel}>
              {correct ? 'Correct' : 'Incorrect'}
            </Text>

            {question.choices.map(function (choice, choiceIndex) {
              var playerPicked = playerAnswer && playerAnswer.includes(choiceIndex);
              var isAnswerCorrect = Array.isArray(question.correct) ? question.correct.includes(choiceIndex) : question.correct === choiceIndex;
              var textStyle = summaryStyles.choiceText;

              if (playerPicked && isAnswerCorrect) {
                textStyle = Object.assign({}, textStyle, summaryStyles.correct);
              } else if (playerPicked && !isAnswerCorrect) {
                textStyle = Object.assign({}, textStyle, summaryStyles.incorrect);
              }
              if (playerPicked && !isAnswerCorrect) {
                textStyle = Object.assign({}, textStyle, summaryStyles.strikethrough);
              }

              return (
                <Text key={choiceIndex} style={textStyle}>
                  {choice}
                </Text>
              );
            })}
          </View>
        );
      })}

      <Text style={summaryStyles.score} testID="total">
        Total Score: {totalScore} / {questions.length}
      </Text>

      <Button title="Restart Quiz" onPress={quizRestart} color="#ff69b4" />
    </View>
  );
}

/////////

// app component where the question component and the summary component are exported and displayed
const App = () => {
  const [answers, setAnswers] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen name="Question">
          {(props) => (
            <Question {...props} route={{ params: { questions: questions, questionIndex: questionIndex, answers: answers, setAnswers: setAnswers, setQuestionIndex: setQuestionIndex, }, }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Summary">
          {(props) => (
            <Summary {...props} questions={questions} answers={answers} setAnswers={setAnswers} setQuestionIndex={setQuestionIndex}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/////////

// styling for the question component
const questionStyles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#ffc9ea',
    flex: 1,
  },
  question: {
    fontSize: 25,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonStyle: {
    backgroundColor: '#ff69b4',
    margin: 10,
    borderRadius: 15,
    width: 300,
    borderWidth: 2,
    borderColor: '#d1007f',
  },
  selectedButtonStyle: {
    backgroundColor: '#d1007f',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  buttonTextStyle: {
    textAlign: 'center',
    color: 'black',
    padding: 15,
  },
});

// styling for the summary component
const summaryStyles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#ffc9ea',
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 20,
  },
  prompt: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  correctLabel: {
    color: 'green',
    textAlign: 'center',
    margin: 10,
  },
  incorrectLabel: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
  choiceText: {
    fontSize: 16,
    textAlign: 'center',
  },
  correct: {
    color: 'green',
    fontWeight: 'bold',
  },
  incorrect: {
    color: 'red',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
});

// exports the app onto the page
export default App;
