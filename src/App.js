import { useState } from "react";

import "./styles.css";

export default function App() {
  const [appStates, setAppStates] = useState({
    welcomeDisplay: true,
    gameCanvasDisplay: false,
    gameLevelDisplay: false,
    gameLevels: 10,
    gameCurrentLevel: 0,
    levelImgAlt: 0,
    levelImgSrc:
      "https://images.squarespace-cdn.com/content/v1/5acd17597c93273e08da4786/1547847934765-ZOU5KGSHYT6UVL6O5E5J/Shrek+Poster.png",
  });

  function GetMovieList() {
    function GetMoviePage(pageNum) {
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

    let tmdbPages = 10;
    let movieList = [];

    for (var page = 1; i <= tmdbPages; page++) {
      (async function () {
        moviePage = await GetMoviePage(i);
        moviePage.results.forEach((el) => {
          if (el["backdrop_path"]) {
            movieList.push(el);
          }
        });
      })();
    }
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
    setAppStates((currentState) => {
      return {
        ...currentState,
        gameCurrentLevel: currentState.gameCurrentLevel + 1,
      };
    });
  }

  return (
    <div className="App">
      <div className="app-background vh-100 vw-100 d-flex flex-row bg-primary justify-content-center align-items-center">
        <div
          className="welcome welcomeDisplay bg-light w-50 h-50 p-3 flex-column justify-content-around align-items-center rounded"
          style={{ display: appStates.welcomeDisplay ? "flex" : "none" }}
        >
          <h1>Guess The Poster!</h1>
          <p className="welcome-text w-75">
            A movie poster guessing game. Guess the title form the blurred movie
            poster!
          </p>
          <button
            onClick={() => {
              ToggleState(["welcomeDisplay", "gameCanvasDisplay"]);
              IncrementLevel();
            }}
            className="get-started-btn btn btn-primary btn-lg"
          >
            Get Started
          </button>
        </div>
        <div
          className="game-canvas gameCanvasDisplay bg-light w-100 h-100 m-4 p-3 flex-column justify-content-around align-items-center rounded"
          style={{ display: appStates.gameCanvasDisplay ? "flex" : "none" }}
        >
          <div className="game-level gameLevelDisplay w-100 h-100 p-2 d-flex flex-column justify-content-around align-items-center">
            <span className="round-identifier p-2">
              Round {appStates.gameCurrentLevel}/10
            </span>
            <div className="poster-container h-75 overflow-hidden shadow">
              <img
                className="poster w-100 h-100"
                src={appStates.levelImgSrc}
                alt={appStates.levelImgAlt}
              ></img>
            </div>
            <div className="game-answers d-flex w-100 h-50 p-sm-3 p-lg-5 flex-column justify-content-around align-items-center">
              <div className="game-answers-row-1 w-100 h-100 d-flex flex-row justify-content-around align-items-center">
                <button className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50">
                  Shrek
                </button>
                <button className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50">
                  Shrek 2
                </button>
              </div>
              <div className="game-answers-row-2 w-100 h-100 d-flex flex-row justify-content-around align-items-center">
                <button className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50">
                  Shrek 3
                </button>
                <button className="game-answer button btn btn-lg btn-primary m-1 h-75 w-50">
                  Shrek 4
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
