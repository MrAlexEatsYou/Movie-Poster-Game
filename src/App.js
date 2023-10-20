import { useState, useEffect } from "react";

import "./styles.css";

export default function App() {
  const [appStates, setAppStates] = useState({
    movieList: [],
    gameMovieList: [],
    loading: false,
    welcomeDisplay: true,
    gameCanvasDisplay: false,
    gameLevelDisplay: false,
    gameResultsDisplay: false,
    gameLevels: 10,
    gameCurrentLevel: 0,
    levelScore: 0,
    levelCurrentMovie: 0,
    levelAnswers: [],
    levelImgAlt: 0,
    levelImgSrc:
      "https://images.squarespace-cdn.com/content/v1/5acd17597c93273e08da4786/1547847934765-ZOU5KGSHYT6UVL6O5E5J/Shrek+Poster.png",
    resultScore: 0,
    resultMaxScore: "",
    resultMessage: "",
  });

  var answerButtons = document.querySelectorAll(".game-answer");

  useEffect(() => {
    console.log(appStates);
  });

  function RandomNumber(upperLimit) {
    return Math.floor(Math.random() * upperLimit);
  }

  async function GetMovieList() {
    let tmdbPages = 10;
    let movieList = [];

    for (var page = 1; page <= tmdbPages; page++) {
      let moviePage = await GetMoviePage(page);
      moviePage.results.forEach((el) => {
        if (el["poster_path"]) {
          movieList.push(el);
        }
      });
    }

    IncrementLevel();

    return movieList;
  }

  async function GetMoviePage(pageNum) {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YWQzZGQ2MzA0OTBmMDcyMDIxNDI1ODU3ZGRmZTUyNyIsInN1YiI6IjY1MTMzZDZhYWFkOWMyMDEzYmQ1Yjc3OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vmrd5wR2GfgxgDjWdo8s07w4WBz8vJOJPkLD11wge_E",
      },
    };
    return fetch(
      `https://api.themoviedb.org/3/movie/top_rated?language=en-US&region=US&page=${pageNum}&with_original_language=en`,
      options,
    )
      .then((response) => response.json())
      .then((response) => {
        return response;
      })
      .catch((err) => console.error(err));
  }

  async function UpdateMovieListState() {
    let movieList = await GetMovieList();
    let shuffled = movieList.sort(() => 0.5 - Math.random());
    let reduced = [...shuffled];
    reduced.length = 10;
    setAppStates((currentState) => {
      return {
        ...currentState,
        movieList: shuffled,
        gameMovieList: reduced,
        loading: false,
        gameCanvasDisplay: true,
      };
    });
  }

  function ToggleState(identifiers) {
    let toggledStates = {};
    identifiers.forEach((identifier) => {
      toggledStates[identifier] = appStates[identifier] ? false : true;
    });
    setAppStates((currentState) => {
      return { ...currentState, ...toggledStates };
    });
  }

  function IncrementLevel() {
    ResetAnswers();
    setAppStates((currentState) => {
      return {
        ...currentState,
        gameCurrentLevel: currentState.gameCurrentLevel + 1,
      };
    });
  }

  function UpdateLevel() {
    setAppStates((currentState) => {
      let levelMovie =
        currentState.gameMovieList[currentState.gameCurrentLevel - 1];
      return {
        ...currentState,
        levelCurrentMovie: levelMovie,
        levelAnswers: UpdateLevelAnswers(levelMovie),
        levelScore: 4,
      };
    });
  }

  function UpdateLevelAnswers(levelMovie) {
    let movieListRange = (appStates.gameCurrentLevel + 1) * 10;
    let answerArr = [];
    answerArr[0] = levelMovie;
    answerArr[1] = appStates.movieList[movieListRange];
    answerArr[2] = appStates.movieList[movieListRange + 1];
    answerArr[3] = appStates.movieList[movieListRange + 2];
    console.log(answerArr);

    answerArr[0].isAnswer = true;
    answerArr[1].isAnswer = false;
    answerArr[2].isAnswer = false;
    answerArr[3].isAnswer = false;

    answerArr = answerArr.sort(() => 0.5 - Math.random());
    return answerArr;
  }

  function ReturnLevelAnswers(index) {
    //console.log(appStates.levelAnswers);
    if (appStates.levelAnswers[index]) {
      if ("original_title" in appStates.levelAnswers[index]) {
        return appStates.levelAnswers[index].original_title;
      } else {
        return "Error Retrieving Answer";
      }
    }
  }

  function IsAnswer(index) {
    console.log(appStates.levelAnswers[index].isAnswer);
    if (appStates.levelAnswers[index].isAnswer) {
      setAppStates((currentState) => {
        return {
          ...currentState,
          resultScore: currentState.resultScore + currentState.levelScore,
        };
      });
      IncrementLevel();
    } else {
      console.log("DisableAnswer");
      DisableAnswer(index);
      setAppStates((currentState) => {
        return { ...currentState, levelScore: currentState.levelScore - 1 };
      });
    }
  }

  function DisableAnswer(index) {
    console.log(answerButtons);
    answerButtons[index].classList.add("btn-secondary");
    answerButtons[index].classList.remove("btn-primary");
  }

  function ResetAnswers() {
    answerButtons.forEach((el) => {
      el.classList.add("btn-primary");
      el.classList.remove("btn-secondary");
    });
  }

  function GameResult() {
    let resultMessage;
    let resultMaxScore = appStates.gameLevels * 4;

    let scorePercent = (100 * appStates.resultScore) / resultMaxScore;

    if (scorePercent < 20) {
      resultMessage = "NOT SO GOOD";
    } else if (scorePercent > 19 && scorePercent < 40) {
      resultMessage = "NOT TOO BAD";
    } else if (scorePercent > 39 && scorePercent < 60) {
      resultMessage = "MIDDLE OF THE ROAD";
    } else if (scorePercent > 59 && scorePercent < 80) {
      resultMessage = "GOOD SCORE";
    } else if (scorePercent > 79 && scorePercent < 90) {
      resultMessage = "AMAZING SCORE";
    } else if (scorePercent > 89 && scorePercent < 101) {
      resultMessage = "OUTSTANDING SCORE";
    }

    setAppStates((currenState) => {
      return {
        ...currenState,
        resultMessage: resultMessage,
        resultMaxScore: resultMaxScore,
      };
    });
  }

  useEffect(() => {
    if (appStates.gameCurrentLevel > 0 && appStates.gameCurrentLevel < 11) {
      UpdateLevel();
    } else if (appStates.gameCurrentLevel > 10) {
      GameResult();
      ToggleState(["gameResultsDisplay", "gameCanvasDisplay"]);
    }
  }, [appStates.gameCurrentLevel]);

  return (
    <div className="App">
      <div className="app-background vh-100 vw-100 d-flex flex-row bg-primary justify-content-center align-items-center">
        <div
          className="welcome welcomeDisplay bg-light w-50 h-50 p-3 flex-column justify-content-around align-items-center rounded"
          style={{
            display: appStates.welcomeDisplay ? "flex" : "none",
          }}
        >
          <h1>Guess The Poster!</h1>
          <p className="welcome-text w-75">
            A movie poster guessing game. Guess the title form the blurred movie
            poster!
          </p>
          <button
            onClick={() => {
              UpdateMovieListState();
              ToggleState(["loading", "welcomeDisplay"]);
            }}
            className="get-started-btn btn btn-primary btn-lg"
          >
            Get Started
          </button>
        </div>
        <div
          className="loading"
          style={{ display: appStates.loading ? "flex" : "none" }}
        >
          LOADING!
        </div>
        <div
          className="game-canvas gameCanvasDisplay bg-light w-100 h-100 m-4 p-3 flex-column justify-content-around align-items-center rounded"
          style={{
            display: appStates.gameCanvasDisplay ? "flex" : "none",
          }}
        >
          <div className="game-level gameLevelDisplay w-100 h-100 p-2 d-flex flex-column justify-content-around align-items-center">
            <span className="round-identifier p-2">
              Round {appStates.gameCurrentLevel}/10
            </span>
            <div className="poster-container h-75 overflow-hidden shadow">
              <img
                className="poster w-100 h-100"
                src={
                  "https://image.tmdb.org/t/p/w500" +
                  appStates.levelCurrentMovie["poster_path"]
                }
                alt={appStates.levelImgAlt}
              ></img>
            </div>
            <div className="game-answers d-flex w-100 h-50 p-sm-3 p-lg-5 flex-column justify-content-around align-items-center">
              <div className="game-answers-row-1 w-100 h-100 d-flex flex-row justify-content-around align-items-center">
                <button
                  className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50"
                  onClick={() => {
                    IsAnswer(0);
                  }}
                >
                  {ReturnLevelAnswers(0)}
                </button>
                <button
                  className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50"
                  onClick={() => {
                    IsAnswer(1);
                  }}
                >
                  {ReturnLevelAnswers(1)}
                </button>
              </div>
              <div className="game-answers-row-2 w-100 h-100 d-flex flex-row justify-content-around align-items-center">
                <button
                  className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50"
                  onClick={() => {
                    IsAnswer(2);
                  }}
                >
                  {ReturnLevelAnswers(2)}
                </button>
                <button
                  className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50"
                  onClick={() => {
                    IsAnswer(3);
                  }}
                >
                  {ReturnLevelAnswers(3)}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="game-results bg-light w-50 h-50 p-3 flex-column justify-content-around align-items-center rounded"
          style={{
            display: appStates.gameResultsDisplay ? "flex" : "none",
          }}
        >
          <h3 className="game-results-message w-75">
            {appStates.resultMessage}
          </h3>
          <h3 className="game-results-message w-75">
            {appStates.resultScore}/{appStates.resultMaxScore}
          </h3>
        </div>
      </div>
    </div>
  );
}
