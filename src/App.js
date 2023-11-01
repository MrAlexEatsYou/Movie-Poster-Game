import { useState, useEffect } from "react";

import "./styles.css";

import winningMessages from "./winningMessages.json";

const initialState = {
  darkTheme: false,
  movieList: [],
  gameMovieList: [],
  loading: false,
  welcomeDisplay: true,
  gameBlurValue: 2,
  gameCanvasDisplay: false,
  gameLevelDisplay: false,
  gameResultsDisplay: false,
  gameLevels: 10,
  gameCurrentLevel: 0,
  levelScore: 0,
  levelCurrentMovie: 0,
  levelAnswers: [],
  levelImgAlt: 0,
  levelImgSrc: "",
  resultScore: 0,
  resultMaxScore: "",
  resultMessage: "",
  tmdbURL: {
    origin: "https://api.themoviedb.org/3/discover/",
    media: "movie",
    sort: "popularity.desc",
    params:
      "?include_adult=false&include_video=false&language=en-US&region=US&with_original_language=en",
  },
};

export default function App() {
  const [appStates, setAppStates] = useState(initialState);

  var answerButtons = document.querySelectorAll(".game-answer");

  useEffect(() => {
    console.log(appStates);
  });

  function RandomNumber(upperLimit) {
    return Math.floor(Math.random() * upperLimit);
  }

  const ResetState = () => {
    setAppStates(initialState);
  };

  async function GetMovieList() {
    let tmdbPages;
    let movieList = [];

    if (appStates.gameLevels * 20 >= 200) {
      tmdbPages = appStates.gameLevels;
    } else {
      tmdbPages = 10;
    }

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
    let tmdbURL = appStates.tmdbURL;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YWQzZGQ2MzA0OTBmMDcyMDIxNDI1ODU3ZGRmZTUyNyIsInN1YiI6IjY1MTMzZDZhYWFkOWMyMDEzYmQ1Yjc3OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vmrd5wR2GfgxgDjWdo8s07w4WBz8vJOJPkLD11wge_E",
      },
    };
    return fetch(
      `${tmdbURL.origin}${tmdbURL.media}${tmdbURL.params}&sort_by=${tmdbURL.sort}&page=${pageNum}`,
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
    reduced.length = appStates.gameLevels;
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
    let movieListRange =
      (appStates.gameCurrentLevel + 1) * appStates.gameLevels;
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
      DisableAnswers();
      answerButtons[index].classList.add("btn-success");
      answerButtons[index].classList.remove("btn-primary");
      setAppStates((currentState) => {
        return {
          ...currentState,
          resultScore: currentState.resultScore + currentState.levelScore,
        };
      });
      setTimeout(() => IncrementLevel(), 1500);
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
    answerButtons[index].classList.add("btn-danger");
    answerButtons[index].classList.remove("btn-primary");
  }

  function ResetAnswers() {
    answerButtons.forEach((el) => {
      el.classList.add("btn-primary");
      el.classList.remove("btn-danger");
      el.classList.remove("btn-success");
      el.classList.remove("disabled");
    });
  }

  function DisableAnswers() {
    answerButtons.forEach((el) => {
      el.classList.add("disabled");
    });
  }

  function GameResult() {
    let resultMessage;
    let resultMaxScore = appStates.gameLevels * 4;

    let scorePercent = (100 * appStates.resultScore) / resultMaxScore;

    let index = RandomNumber(10);

    if (scorePercent < 20) {
      resultMessage = winningMessages[0][index];
    } else if (scorePercent > 19 && scorePercent < 40) {
      resultMessage = winningMessages[1][index];
    } else if (scorePercent > 39 && scorePercent < 60) {
      resultMessage = winningMessages[2][index];
    } else if (scorePercent > 59 && scorePercent < 80) {
      resultMessage = winningMessages[3][index];
    } else if (scorePercent > 79 && scorePercent < 90) {
      resultMessage = winningMessages[4][index];
    } else if (scorePercent > 89 && scorePercent < 101) {
      resultMessage = winningMessages[5][index];
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
    if (
      appStates.gameCurrentLevel > 0 &&
      appStates.gameCurrentLevel <= appStates.gameLevels
    ) {
      UpdateLevel();
    } else if (appStates.gameCurrentLevel > appStates.gameLevels) {
      GameResult();
      ToggleState(["gameResultsDisplay", "gameCanvasDisplay"]);
    }
  }, [appStates.gameCurrentLevel]);

  const blurValues = [
    ["Very Easy", 5],
    ["Easy", 10],
    ["Medium", 15],
    ["Hard", 20],
    ["Very Hard", 25],
    ["Impossible", 30],
  ];

  const handleSliderChange = (event) => {
    let inputValue = event.target.value;
    setAppStates((currentStates) => {
      return {
        ...currentStates,
        gameBlurValue: inputValue,
      };
    });
  };

  useEffect(() => {
    let index = appStates.gameBlurValue;
    let documentElemntStyle = document.documentElement.style

    documentElemntStyle.setProperty(
      "--poster-blur",
      `${blurValues[index][1]}px`,
    );

    if(appStates.darkTheme){
      documentElemntStyle.setProperty('--theme-bg-light', 'black')
      documentElemntStyle.setProperty('--theme-text-color', 'white')
      documentElemntStyle.setProperty('--theme-bg-info', 'slategrey')
    }else{
      documentElemntStyle.setProperty('--theme-bg-light', '#f8f9fa')
      documentElemntStyle.setProperty('--theme-text-color', 'black')
      documentElemntStyle.setProperty('--theme-bg-info', '#0dcaf0')
    }
  });

  const handleFilterChange = (event) => {
    let inputValue = event.target.value;
    setAppStates((currentStates) => {
      return {
        ...currentStates,
        tmdbURL: { ...currentStates.tmdbURL, sort: inputValue },
      };
    });
  };

  const handleLevelChange = (event) => {
    let inputValue = event.target.value;
    setAppStates((currentStates) => {
      return {
        ...currentStates,
        gameLevels: inputValue,
      };
    });
  };

  return (
    <div className="App">
      <div className="app-background vh-100 vw-100 d-flex flex-row bg-light justify-content-center align-items-center">
        <div
          className="welcome welcomeDisplay shadow-lg bg-light p-3 flex-column justify-content-around align-items-center rounded col-12 col-sm-10 col-md-10 col-lg-6"
          style={{
            display: appStates.welcomeDisplay ? "flex" : "none",
          }}
        >
          <h1>Guess The Poster!</h1>
          <p className="welcome-text col-8">
            A movie poster guessing game. Guess the title from the blurred movie
            poster!
          </p>
          <div className="slider-container d-flex flex-column align-items-center bg-info p-2 rounded col-12 col-md-8 mb-1">
            <label htmlFor="slider" className="form-label m-0">
              <h4 className=" bg-light rounded py-2 px-3 m-0 fw-bold">
                Difficulty
              </h4>
              <h5 className="m-0 p-2">
                {blurValues[appStates.gameBlurValue][0]}
              </h5>
            </label>
            <input
              type="range"
              className="form-range px-3"
              min="0"
              max="5"
              value={appStates.gameBlurValue}
              onChange={handleSliderChange}
            />
            <div className="arrow-container d-flex flex-row justiy-content-center">
              <div className="arrow arrow-left fs-4 text px-3 m-0 fw-bold">
                ←
              </div>
              <div className="arrow arrow-right fs-4 text px-3 m-0 fw-bold">
                →
              </div>
            </div>
          </div>
          <div className="game-container d-flex flex-column align-items-center bg-info p-2 rounded col-12 col-md-8 mb-1">
            <h4 className="game-options bg-light rounded py-2 px-3 m-0 mb-2 fw-bold">
              Options
            </h4>
            <div className="select-container d-flex bg-light rounded py-2 m-0 mb-2 fw-bold col-10">
              <label
                htmlFor="game-category"
                className="select-label text-end mx-2 col-3 col-sm-4"
              >
                Filter:
              </label>
              <select
                name="game-category"
                id="game-category"
                className=""
                onChange={handleFilterChange}
              >
                <option value="popularity.desc">Trending</option>
                <option value="vote_average.desc">Review Score</option>
                <option value="revenue.desc">Box Office Revenue</option>
              </select>
            </div>
            <div className="select-container d-flex bg-light rounded py-2 m-0 mb-2 fw-bold col-10">
              <label
                htmlFor="game-levels"
                className="select-label text-end mx-2 col-3 col-sm-4"
              >
                Levels:
              </label>
              <input
                placeholder="10"
                name="game-levels"
                type="text"
                className="game-levels col-2"
                onChange={handleLevelChange}
              />
            </div>
            <button
              className="button btn btn-secondary"
              onClick={() => {
                ToggleState(["darkTheme"]);
              }}
            >
              {appStates.darkTheme
                ? "Change to light theme"
                : "Change to dark theme"}
            </button>
          </div>

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
          <div className="loading-container">
            <div className="lds-dual-ring"></div>
            <div className="loading-text">Getting things ready...</div>
          </div>
        </div>
        <div
          className="game-canvas gameCanvasDisplay bg-light w-100 h-100 m-4 p-3 flex-column justify-content-around align-items-center rounded"
          style={{
            display: appStates.gameCanvasDisplay ? "flex" : "none",
          }}
        >
          <div className="game-level gameLevelDisplay w-100 h-100 p-2 d-flex flex-column justify-content-around align-items-center">
            <div className="score-container w-100 d-flex mb-3 align-items-center justify-content-evenly">
              <h4 className="round-identifier button btn disabled bg-info p-2 rounded shadow col-3">
                Round {appStates.gameCurrentLevel}/{appStates.gameLevels}
              </h4>
              <h4 className="round-identifier button btn disabled bg-info align-items-center p-2 rounded shadow col-3">
                Level Score {appStates.levelScore}/4
              </h4>
              <h4 className="round-identifier button btn disabled bg-info align-items-center p-2 rounded shadow col-3">
                Game Score {appStates.resultScore}/{appStates.gameLevels * 4}
              </h4>
            </div>
            <div className="poster-container d-flex overflow-hidden h-75 shadow">
              <img
                className="poster w-auto h-100"
                src={
                  appStates.levelCurrentMovie == 0
                    ? null
                    : "https://image.tmdb.org/t/p/w500" +
                      appStates.levelCurrentMovie["poster_path"]
                }
                alt={appStates.levelImgAlt}
              ></img>
            </div>
            <div className="game-answers d-flex flex-row justify-content-around align-items-stretch flex-wrap h-50 my-3">
              <button
                className="game-answer button btn btn-lg btn-primary"
                onClick={() => {
                  IsAnswer(0);
                }}
              >
                {ReturnLevelAnswers(0)}
              </button>
              <button
                className="game-answer button btn btn-lg btn-primary"
                onClick={() => {
                  IsAnswer(1);
                }}
              >
                {ReturnLevelAnswers(1)}
              </button>
              <button
                className="game-answer button btn btn-lg btn-primary"
                onClick={() => {
                  IsAnswer(2);
                }}
              >
                {ReturnLevelAnswers(2)}
              </button>
              <button
                className="game-answer button btn btn-lg btn-primary"
                onClick={() => {
                  IsAnswer(3);
                }}
              >
                {ReturnLevelAnswers(3)}
              </button>
            </div>
          </div>
        </div>
        <div
          className="game-results bg-light shadow-lg w-50 h-50 p-3 flex-column justify-content-around align-items-center rounded"
          style={{
            display: appStates.gameResultsDisplay ? "flex" : "none",
          }}
        >
          <h4 className="game-results-message align-start ">
            {appStates.resultMessage}
          </h4>
          <h3 className="game-results-message">
            Score: {appStates.resultScore}/{appStates.resultMaxScore}
          </h3>
          <button
            className="button btn btn-lg btn-primary"
            onClick={ResetState}
          >
            Play Again!
          </button>
        </div>
      </div>
    </div>
  );
}
