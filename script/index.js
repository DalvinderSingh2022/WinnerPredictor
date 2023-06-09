import { Schedule, Users } from "./data.js";

export function LoadMatches(list) {
    document.querySelector(".matches").innerHTML = "";
    for (const key in list) {
        const MatchEl = document.createElement("div");
        const Match = list[key];
        MatchEl.innerHTML = `
        <div class="flex inner status">
            <div class="flex inner pri">${Match.name} | ${Match.status().toUpperCase()}</div>
        </div>
        <div class="flex inner section j-between nowrap">
            <div class="flex inner j-between col team">
                <img src="${teamImage(Match.firstTeam)}" alt="${(Match.firstTeam).teamName}">
                <span>${(Match.firstTeam).teamName}</span>
            </div>
            <p class="flex inner pri">vs</p>
            <div class="flex inner j-between col team">
                <img src="${teamImage(Match.secondTeam)}" alt="${(Match.secondTeam).teamName}">
                <span>${(Match.secondTeam).teamName}</span>
            </div>
        </div>
        <div class="flex inner section j-evenly col nowrap">
            <span>${new Date(Match.startDate).toDateString() + " at " + new Date(Match.startDate).toLocaleTimeString()}</span>
            <span>Venue: ${Match.stadium}</span>
        </div>`;
        if (Match.status() == "Upcoming") {
            Timer(Match, MatchEl);
        } else {
            MatchEl.innerHTML += `
            <div class="flex inner section j-evenly col nowrap">
                <button class="pri">Match Center</button>
            </div>`;
            MatchEl.querySelector("button").onclick = () => {
                if (Match.Id == Schedule[nextGameIndex()].Id) {
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
    Parent.innerHTML = `<h3>${Game.name} | ${Game.status().toUpperCase()}</h3>`;
    if (Game.status() != "Live" && Game.status() != "Completed") {
        Timer(Game, Parent);
    };
    Parent.innerHTML += `
    <div class="flex inner container nowrap">
        <div class="flex col home team home">
            <img src="${teamImage(Game.firstTeam)}">
            <div class="flex box inner col">
                <span>${(Game.firstTeam).teamName}</span>
                <button class="vote pri" data-teamType="firstTeam" data-team=${Game.firstTeam.teamSName}>Vote</button>
            </div>
        </div>
        <span class="flex inner between pri">vs</span>
        <div class="flex col away team away">
            <img src="${teamImage(Game.secondTeam)}">
            <div class="flex box inner col">
                <span>${(Game.secondTeam).teamName}</span>
                <button class="vote pri" data-teamType="secondTeam" data-team=${Game.secondTeam.teamSName}>Vote</button>
            </div>
        </div>
    </div>
    <div class="flex progress-box inner">
        <div class="progress-bar home"><span class="percent inner flex"></span></div>
        <div class="progress-bar away"><span class="percent inner flex"></span></div>
    </div>`;
    Parent.querySelectorAll(".vote").forEach((btn) => {
        if (!currentUser() || Game.status() == "Live" || Game.status() == "Completed") {
            btn.setAttribute("disabled", true);
            btn.classList.add("disabled");
        }

        //completed game
        if (Game.status() == "Completed") {
            const team1Score = Game.firstTeam.inngs1 || { runs: 0, wickets: 0, overs: 0 };
            const team2Score = Game.secondTeam.inngs1 || { runs: 0, wickets: 0, overs: 0 };

            btn.innerText = (Game.firstTeam.teamSName == btn.getAttribute("data-team")) ?
                `${team1Score.runs}/${team1Score.wickets} (${team1Score.overs})` :
                `${team2Score.runs}/${team2Score.wickets} (${team2Score.overs})`;
            return;
        }

        //Signed and notVoted
        if (!Game.IsVoted()) {
            btn.onclick = () => Game.vote(btn.getAttribute("data-teamType"));
            return;
        }

        //Signed and Voted and match is live
        if (Game.IsVoted() && Game.status() == "Live") {
            if (btn.getAttribute("data-teamType") == Game.IsVoted().teamType)
                btn.innerText = "Voted";
            return;
        }

        // Signed and Voted and match is not live
        if (Game.IsVoted()) {
            if (btn.getAttribute("data-teamType") == Game.IsVoted().teamType) {
                btn.innerText = "Voted";
                btn.setAttribute("disabled", true);
                btn.classList.add("disabled");
            } else {
                btn.innerText = "Revote";
                btn.onclick = () => Game.revote(btn.getAttribute("data-teamType"));
            }
            return;
        }
    });
    changeVotes(Game.voters(Game.firstTeam).length, Game.voters(Game.secondTeam).length, Parent);
}

function Timer(Match, Parent) {
    Parent.innerHTML += `
    <div class="flex section nowrap table inner">
        <div class="flex inner col">
            <span class="value days">${Match.timeGap()[0] >= 10 ? Match.timeGap()[0] : "0" + Match.timeGap()[0]}</span>
            <button>DAYS<buttonn>
        </div>    
        <div class="flex inner col">
            <span class="value hours">${Match.timeGap()[1] >= 10 ? Match.timeGap()[1] : "0" + Match.timeGap()[1]}</span>
            <button>HRS</button>
        </div>    
        <div class="flex inner col">
            <span class="value minutes">${Match.timeGap()[2] >= 10 ? Match.timeGap()[2] : "0" + Match.timeGap()[2]}</span>
            <button>MIN</button>
        </div>    
        <div class="flex inner col">
            <span class="value seconds">${Match.timeGap()[3] >= 10 ? Match.timeGap()[3] : "0" + Match.timeGap()[3]}</span>
            <button>SEC</button>
        </div>
    </div>`;
    setInterval(() => {
        const timeGap = Match.timeGap();
        Parent.querySelector(".days").innerText = timeGap[0] >= 10 ? timeGap[0] : "0" + timeGap[0];
        Parent.querySelector(".hours").innerText = timeGap[1] >= 10 ? timeGap[1] : "0" + timeGap[1];
        Parent.querySelector(".minutes").innerText = timeGap[2] >= 10 ? timeGap[2] : "0" + timeGap[2];
        Parent.querySelector(".seconds").innerText = timeGap[3] >= 10 ? timeGap[3] : "0" + timeGap[3];
    }, 1000);
}

function changeVotes(home, away, GameEl) {
    const homePercent = Math.floor((home / (Number(home) + Number(away))) * 100);
    const awayPercent = 100 - homePercent;

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
        const hrs = user.voteByMatch(Game).time[1] < 10 ? "0" + user.voteByMatch(Game).time[1] : user.voteByMatch(Game).time[1];
        const mins = user.voteByMatch(Game).time[2] < 10 ? "0" + user.voteByMatch(Game).time[2] : user.voteByMatch(Game).time[2];
        const secs = user.voteByMatch(Game).time[3] < 10 ? "0" + user.voteByMatch(Game).time[3] : user.voteByMatch(Game).time[3];

        voterEl.innerHTML = `
            <div class="flex inner section nowrap j-start">
                <img src="${user.Avatar}" alt="${user.Name}">
                <span>${user.Name}</span>
            </div>
            <div class="flex inner section nowrap">
                <span>${user.voteByMatch(Game).team.teamName}</span>
            </div>
            <div class="flex inner section nowrap">
                <span>${hrs} Hrs  ${mins} Min ${secs} Sec</span>
            </div>`;
        voterEl.classList = "flex row voter j-between nowrap";
        if (currentUser() && (user.Id == currentUser().Id)) {
            voterEl.classList.add("you");
        }
        Parent.append(voterEl);
    }
}

export function nextGameIndex() {
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

function teamImage(team) {
    switch (team.teamSName.toLowerCase()) {
        case "csk":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CSK/logos/Roundbig/CSKroundbig.png";
        case "srh":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Roundbig/SRHroundbig.png";
        case "kkr":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/Roundbig/KKRroundbig.png";
        case "rr":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Roundbig/RRroundbig.png";
        case "mi":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/Roundbig/MIroundbig.png";
        case "pbks":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/PBKS/Logos/Roundbig/PBKSroundbig.png";
        case "rcb":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Roundbig/RCBroundbig.png";
        case "dc":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/DC/Logos/Roundbig/DCroundbig.png";
        case "gt":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/Roundbig/GTroundbig.png";
        case "lsg":
            return "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/LSG/Logos/Roundbig/LSGroundbig.png";
        default:
            return "https://scores.iplt20.com/ipl/teamlogos/default-team-logo.png?v=4";
    }
}

export function currentUser() {
    for (const key in Users) {
        if (Users[key].Signined) {
            return Users[key];
        }
    }
}

export function alertBox(msg) {
    const box = document.createElement("div");
    box.classList = "flex inner alertbox";
    box.innerHTML = `<div class="flex">${msg.toUpperCase()}</div>`;
    document.body.appendChild(box);
    setTimeout(() => document.body.removeChild(box), 2500);
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
    userImg.src = currentUser() ? currentUser().Avatar : "https://media.istockphoto.com/id/1305665777/vector/user-vector-icon-glyph-style-stock-illustration.jpg?s=612x612&w=0&k=20&c=3VFdegIWlVnAcin_lGl-hy0McBL96uiwAmz74EnQErc=";
})();

(() => {
    const loader = document.createElement("div");
    loader.classList = "flex loader inner";
    loader.innerHTML = `<span></span>`;
    document.body.appendChild(loader);
    window.addEventListener("load", () => {
        loader.classList.add("finish");
        setTimeout(() => document.body.removeChild(loader), 750);
    });
})();