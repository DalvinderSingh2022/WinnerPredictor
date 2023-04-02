import { Schedule } from "./data.js";
import { LoadMatchVoters, LoadMatches, LoadMatchToVote, nextGameIndex } from "./index.js";

const Game = Schedule[nextGameIndex()];
const GameEl = document.querySelector(".game");
const votersEl = document.querySelector(".voters");

var nextMatches = [];
for (let i = 1; i < 5; i++) {
    nextMatches.push(Schedule[Number(nextGameIndex()) + i]);
}

LoadMatches(nextMatches);
LoadMatchToVote(Game, GameEl);
LoadMatchVoters(Game, votersEl);