import { defaultProfile, Schedule, Users, Teams } from "./data.js";

export function LoadMatches(list) {
    document.querySelector(".matches").innerHTML = "";
    for (const key in list) {
        const MatchEl = document.createElement("div");
        const Match = list[key];
        MatchEl.innerHTML = `
        <div class="flex inner status">
            <div class="flex inner pri">${Match.format()} | ${Match.status().toUpperCase()}</div>
        </div>
        <div class="flex inner section j-between nowrap">
            <div class="flex inner j-between col team">
                <img src="${(Match.homeTeam).Image}" alt="${(Match.homeTeam).Team()}">
                <span>${(Match.homeTeam).Team()}</span>
            </div>
            <p class="flex inner pri">vs</p>
            <div class="flex inner j-between col team">
                <img src="${(Match.awayTeam).Image}" alt="${(Match.awayTeam).Team()}">
                <span>${(Match.awayTeam).Team()}</span>
            </div>
        </div>
        <div class="flex inner section j-evenly col nowrap">
            <span>${Match.date} at ${Match.time}</span>
            <span>Venue: ${Match.stadium}</span>
        </div>`;
        if (Match.status() == "Upcoming" || Match.status() == "Today") {
            Timer(Match, MatchEl);
        } else {
            MatchEl.innerHTML += `
            <div class="flex inner section j-evenly col nowrap">
                <button class="pri">Match Center</button>
            </div>`;
            MatchEl.querySelector("button").onclick = () => {
                if (Match.status() == "Live") {
                    window.location.pathname = "home.html"
                } else {
                    localStorage.setItem("match", JSON.stringify(Match.Id));
                    window.location.pathname = "matchcenter.html"
                }
            }
        }
        MatchEl.classList = `flex row nowrap j-between ${Match.status().toLowerCase()}`;
        document.querySelector(".matches").appendChild(MatchEl);
    }
}

export function LoadMatchToVote(Game, Parent) {
    Parent.innerHTML = `<h3>${Game.format()} | ${Game.status().toUpperCase()}</h3>`;
    if (Game.status() != "Live" && Game.status() != "Completed") {
        Timer(Game, Parent);
    };
    Parent.innerHTML += `
    <div class="flex inner container nowrap">
        <div class="flex col home team home">
            <img src="${(Game.homeTeam).Image}">
            <div class="flex box inner col">
                <span>${(Game.homeTeam).Team()}</span>
                <button class="vote pri" data-team="homeTeam">Vote</button>
            </div>
        </div>
        <span class="flex inner between pri">vs</span>
        <div class="flex col away team away">
            <img src="${(Game.awayTeam).Image}">
            <div class="flex box inner col">
                <span>${(Game.awayTeam).Team()}</span>
                <button class="vote pri" data-team="awayTeam">Vote</button>
            </div>
        </div>
    </div>
    <div class="flex progress-box inner">
        <div class="progress-bar home"><span class="percent inner flex"></span></div>
        <div class="progress-bar away"><span class="percent inner flex"></span></div>
    </div>`;
    Parent.querySelectorAll(".vote").forEach((btn) => {
        if (Game.IsVoted()) {
            const votedTeam = Game.IsVoted().teamType;
            const secondTeam = (votedTeam == "homeTeam") ? "awayTeam" : "homeTeam";

            document.querySelector(`button[data-team='${votedTeam}']`).innerText = "Voted";
            document.querySelector(`button[data-team='${secondTeam}']`).innerText = "Revote";
            document.querySelector(`button[data-team='${secondTeam}']`).onclick = () =>
                Game.revote(document.querySelector(`button[data-team='${secondTeam}']`).getAttribute("data-team"));
        }
        else if (Game.IsVoted() && (Game.status() == "Completed" || Game.status() == "Live")) {
            btn.setAttribute("disabled", "true");
            btn.classList.add("disabled");
            document.querySelector(`button[data-team='${Game.IsVoted().teamType}']`).innerText = "Voted";
        }
        else if (!currentUser() || Game.status() == "Live") {
            btn.setAttribute("disabled", "true");
            btn.classList.add("disabled");
        } else if (Game.status() == "Completed") {
            btn.setAttribute("disabled", "true");
            btn.classList.add("disabled");
            
            const winnerTeam = (Game.Winner.Logo === Game.awayTeam.Logo) ? "awayTeam" : "homeTeam";
            const loserTeam = (Game.Winner.Logo === Game.homeTeam.Logo) ? "awayTeam" : "homeTeam";

            document.querySelector(`button[data-team='${winnerTeam}']`).innerText = "Winner";
            document.querySelector(`button[data-team='${loserTeam}']`).innerText = "Loser";
        } else {
            btn.onclick = () => Game.vote(btn.getAttribute("data-team"));
        }
    });
    changeVotes(Game.homeTeamVoters.length, Game.awayTeamVoters.length, Parent);
}

function Timer(Match, Parent) {
    Parent.innerHTML += `
    <div class="flex section nowrap table inner">
        <div class="flex inner col">
            <span class="value days">${Match.timeGap()[0]}</span>
            <button>DAYS<buttonn>
        </div>    
        <div class="flex inner col">
            <span class="value hours">${Match.timeGap()[1]}</span>
            <button>HRS</button>
        </div>    
        <div class="flex inner col">
            <span class="value minutes">${Match.timeGap()[2]}</span>
            <button>MIN</button>
        </div>    
        <div class="flex inner col">
            <span class="value seconds">${Match.timeGap()[3]}</span>
            <button>SEC</button>
        </div>
    </div>`;
    setInterval(() => {
        const timeGap = Match.timeGap()
        Parent.querySelector(".days").innerText = timeGap[0] >= 10 ? timeGap[0] : "0" + timeGap[0];
        Parent.querySelector(".hours").innerText = timeGap[1] >= 10 ? timeGap[1] : "0" + timeGap[1];
        Parent.querySelector(".minutes").innerText = timeGap[2] >= 10 ? timeGap[2] : "0" + timeGap[2];
        Parent.querySelector(".seconds").innerText = timeGap[3] >= 10 ? timeGap[3] : "0" + timeGap[3];
    }, 1000);
}

function changeVotes(home, away, GameEl) {
    const homePercent = ((home / (Number(home) + Number(away))) * 100).toFixed(0);
    const awayPercent = ((away / (Number(home) + Number(away))) * 100).toFixed(0);

    GameEl.querySelector(".progress-bar.home").style.width = `${homePercent}%`;
    GameEl.querySelector(".home .percent").innerText = `${homePercent}%`;
    GameEl.querySelector(".progress-bar.away").style.width = `${awayPercent}%`;
    GameEl.querySelector(".away .percent").innerText = `${awayPercent}%`;

    GameEl.querySelector(".home .percent").classList.remove("hide");
    GameEl.querySelector(".away .percent").classList.remove("hide");
    GameEl.querySelector(".progress-bar.home").classList.remove("full");
    GameEl.querySelector(".progress-bar.away").classList.remove("full");

    if (awayPercent == 0) {
        GameEl.querySelector(".away .percent").classList.add("hide");
        GameEl.querySelector(".progress-bar.home").classList.add("full");
    } else if (homePercent == 0) {
        GameEl.querySelector(".home .percent").classList.add("hide");
        GameEl.querySelector(".progress-bar.away").classList.add("full");
    } else if (home == 0 && away == 0) {
        GameEl.querySelector(".progress-bar.home").style.width = `0%`;
        GameEl.querySelector(".home .percent").innerText = `0%`;
        GameEl.querySelector(".progress-bar.away").style.width = `0%`;
        GameEl.querySelector(".away .percent").innerText = `0%`;
    }
}

export function LoadMatchVoters(Game, Parent) {
    Parent.innerHTML = `
        <div class="flex row voter j-between nowrap heading">
            <div class="flex inner section nowrap ">
                <span>Name</span>
            </div>
            <div class="flex inner section nowrap ">
                <span>Team Voted</span>
            </div>
            <div class="flex inner section nowrap ">
                <span>Time</span>
            </div>
        </div>`;
    for (const key in Game.voters()) {
        const user = Game.voters()[key];
        const voterEl = document.createElement("div");
        voterEl.innerHTML = `
            <div class="flex inner section nowrap j-start">
                <img src="${user.Avatar}" alt="${user.Name}">
                <span>${user.Name}</span>
            </div>
            <div class="flex inner section nowrap">
                <span>${Game.homeTeamVoters.filter(a => { return a.Id == user.Id }).length ? Game.homeTeam.Team() : Game.awayTeam.Team()}</span>
            </div>`;
        if (Game.status() == "Completed") {
            voterEl.innerHTML += `
                <div class="flex inner section nowrap">
                    <span>${user.voteByMatch(Game).points}</span>
                </div>`;
        } else {
            voterEl.innerHTML += `
                <div class="flex inner section nowrap">
                    <span>${user.voteByMatch(Game).time[0]} Days  ${user.voteByMatch(Game).time[1]} Hrs  ${user.voteByMatch(Game).time[2]} Min</span>
                </div>`;
        }
        voterEl.classList = `flex row voter j-between nowrap ${currentUser() && (user.Id == currentUser().Id) ? "you" : ""}`;
        Parent.append(voterEl);
    }
}

export function nextGameId() {
    for (const key in Schedule) {
        if (Schedule[key].status() != "Completed") {
            return key;
        }
    }
}

export function UserFrom(value) {
    for (const key in Users) {
        if (Users[key].Id == value || Users[key].Name == value || Users[key].Email == value) {
            return Users[key];
        }
    }
}

export function MatchFromId(Id) {
    for (const key in Schedule) {
        const matchId = Schedule[key].Id;
        if (matchId == Id) {
            return Schedule[key];
        }
    }
}

export function TeamByLogo(Logo) {
    for (const key in Teams) {
        if (Teams[key]["Logo"] == Logo) {
            return Teams[key];
        }
    }
}

export function currentUser() {
    for (const key in Users) {
        if (Users[key].Signined) {
            return Users[key];
        }
    }
}

(() => {
    const themeBtn = document.querySelector(".theme");
    const changeTheme = () => {
        if (!localStorage.getItem("dark-theme")) {
            document.querySelector("body").classList.add("dark");
            themeBtn.querySelector("i").classList.remove("fa-moon");
            themeBtn.querySelector("i").classList.add("fa-sun");
        } else {
            document.querySelector("body").classList.remove("dark");
            themeBtn.querySelector("i").classList.add("fa-moon");
            themeBtn.querySelector("i").classList.remove("fa-sun");
        }
    }
    themeBtn.onclick = () => {
        !localStorage.getItem("dark-theme") ?
            localStorage.setItem("dark-theme", true) :
            localStorage.removeItem("dark-theme");
        changeTheme();
    };
    changeTheme();
})();

(() => {
    const menuBtn = document.querySelector(".menu");
    menuBtn.onclick = () => {
        document.querySelector("nav").classList.toggle("active");
        menuBtn.querySelector("i").classList.toggle("fa-bars");
        menuBtn.querySelector("i").classList.toggle("fa-xmark");
    }
})();

(() => {
    const userImg = document.querySelector(".profile img");
    userImg.src = currentUser() ? currentUser().Avatar : defaultProfile;
})();
