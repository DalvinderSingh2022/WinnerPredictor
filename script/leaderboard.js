import { Schedule } from "./data.js";

const votersEl = document.querySelector(".voters");
const AllVoters = [];

for (const key in Schedule) {
    if (Schedule[key].voters().length) {
        AllVoters.push(Schedule[key].voters());
    }
}


if (AllVoters[0]) {
    AllVoters[0].sort((a, b) => { return a.Voted.length - b.Voted.length })
        .sort((a, b) => { return b.points() - a.points() });
    for (let i = 0; i < AllVoters[0].length; i++) {
        const user = AllVoters[0][i];
        const voterEl = document.createElement("div");
        voterEl.innerHTML = `
        <span class="position">${i + 1}</span>
        <div class="flex inner section nowrap">
            <img src="${user.Avatar}" alt="${user.Name}">
            <span>${user.Name}</span>
        </div>
        <div class="flex inner section nowrap">
            <span>${user.Voted.length}</span>
        </div>
        <div class="flex inner section nowrap">
            <span>${user.points()}</span>
        </div>`;
        voterEl.classList = "flex row j-between nowrap voter";
        votersEl.append(voterEl);
    }
}