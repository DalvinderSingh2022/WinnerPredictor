import { Users } from "./data.js";
import { currentUser } from "./index.js";

const votersEl = document.querySelector(".voters");
const Voters = [];

Users.forEach(voter => {
    if (voter.Voted.length) {
        Voters.push(voter);
    }
});

Voters.sort((a, b) => { return a.pointsDetails().matches - b.pointsDetails().matches })
    .sort((a, b) => { return a.pointsDetails().won - b.pointsDetails().won })
    .sort((a, b) => { return b.pointsDetails().points - a.pointsDetails().points });

Voters.forEach((user, index) => {
    const voterEl = document.createElement("div");
    voterEl.innerHTML = `
        <span class="position">${index + 1}</span>
        <div class="flex inner section nowrap">
            <img src="${user.Avatar}" alt="${user.Name}">
            <span>${user.Name}</span>
        </div>
        <div class="flex inner section nowrap">
            <span>${user.pointsDetails().matches}</span>
        </div>
        <div class="flex inner section nowrap">
            <span>${user.pointsDetails().won}</span>
        </div>
        <div class="flex inner section nowrap">
            <span>${user.pointsDetails().points}</span>
        </div>`;
    voterEl.classList = `flex row j-between nowrap voter ${currentUser() && (user.Id == currentUser().Id) ? "you" : ""}`;
    votersEl.append(voterEl);
});