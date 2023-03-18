import { LoadMatchVoters, LoadMatchToVote, MatchFromId } from "./index.js";

const Game = MatchFromId(JSON.parse(localStorage.getItem("match")));
const GameEl = document.querySelector(".game");
const votersEl = document.querySelector(".voters");

LoadMatchToVote(Game, GameEl);
LoadMatchVoters(Game, votersEl);