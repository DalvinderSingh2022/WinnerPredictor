import { MatchFromId, currentUser, nextGameIndex } from "./index.js";

export const Users = [];
export class NewUser {
    constructor({ Name, Email, Password, Avatar, Voted, Signined }) {
        this.Name = Name;
        this.Email = Email;
        this.Password = Password;
        this.Avatar = Avatar;
        this.Id = (Name + Email + Password).toString().replaceAll(" ", "");
        this.Voted = Voted || [];
        this.Signined = Signined;
    }
    addUser() {
        Users.push(this);
        localStorage.setItem("Users", JSON.stringify(Users));
    }
    changeCurrentUser() {
        if (currentUser()) {
            const user = currentUser();
            user.Signined = false;
            user.updateUser();
        }
        this.Signined = true;
        this.updateUser();
    }
    VotedMatches() {
        var matches = []
        for (const key in Schedule) {
            for (const i in this.Voted) {
                if (Schedule[key].Id == (this.Voted)[i].matchId) {
                    matches.push(Schedule[key])
                }
            }
        }
        return matches;
    }
    updateUser() {
        var index = Users.length - 1;
        for (const key in Users) {
            if (Users[key].Id == this.Id) {
                index = key;
            }
        }
        Users.splice(index, 1, this);
        localStorage.setItem("Users", JSON.stringify(Users));
    }
    pointsDetails() {
        var points = 0;
        var matches = 0;
        var won = 0;
        for (let index = 0; index < this.Voted.length; index++) {
            const vote = this.Voted[index];
            const match = MatchFromId(this.Voted[index].matchId);
            if (match.Winner) {
                matches++;
                if (vote.team.teamSName.toLowerCase() == match.Winner.teamSName.toLowerCase()) {
                    points += Number((vote.time[1] + vote.time[2] * (0.1)).toFixed(0));
                    won++;
                };
            }
        }
        return { points, matches, won };
    }
    voteByMatch(Game) {
        for (let index = 0; index < this.Voted.length; index++) {
            if (this.Voted[index].matchId == Game.Id) {
                return this.Voted[index];
            }
        }
    }
}
(JSON.parse(localStorage.getItem("Users")) || []).forEach(user => Users.push(new NewUser(user)));

export var Schedule = [];
class NewSchedule {
    constructor({ firstTeam, secondTeam, startDate, endDate, stadium, winner, name }) {
        this.firstTeam = firstTeam;
        this.secondTeam = secondTeam;
        this.stadium = stadium;
        this.startDate = startDate;
        this.endDate = endDate;
        this.Winner = winner();
        this.name = name;
        this.Id = (this.name.toLowerCase() + this.startDate + this.stadium).replaceAll("-", "").replaceAll(" ", "");
    }
    vote(teamType) {
        currentUser().Voted.push({
            teamType: teamType,
            matchId: this.Id,
            team: this[teamType],
            time: this.timeGap(),
        });
        currentUser().updateUser();
        window.location.reload();
    }
    revote(teamType) {
        const vote = currentUser().voteByMatch(this);
        vote.teamType = teamType;
        vote.team = this[teamType];
        vote.time = this.timeGap();
        currentUser().updateUser();
        window.location.reload();
    }
    timeGap() {
        const gapInMilli = ((new Date(this.startDate)).getTime() - (new Date()).getTime());
        const seconds = Math.floor((gapInMilli / 1000) % 60);
        const minutes = Math.floor((gapInMilli / 1000 / 60) % 60);
        const hours = Math.floor((gapInMilli / 1000 / 60 / 60) % 24);
        const days = Math.floor((gapInMilli / 1000 / 60 / 60 / 24));
        return [days, hours, minutes, seconds];
    }
    voters(team = "") {
        var voters = [];
        for (const key in Users) {
            for (let i = 0; i < Users[key].Voted.length; i++) {
                if ((Users[key].Voted)[i].matchId == this.Id && (!team || (Users[key].Voted)[i].team.teamSName.toLowerCase() == team.teamSName.toLowerCase())) {
                    voters.push(Users[key]);
                }
            }
        }
        return voters;
    }
    status() {
        if (this.startDate - new Date().getTime() > 24 * 60 * 60 * 1000) {
            return "Upcoming";
        }
        if (this.startDate - new Date().getTime() < 24 * 60 * 60 * 1000 && this.startDate - new Date().getTime() >= 0) {
            return "Today";
        }
        if (this.startDate - new Date().getTime() < 0 && !this.Winner) {
            return "Live";
        }
        if (this.Winner) {
            return "Completed";
        }
    }
    IsVoted() {
        return currentUser() ? currentUser().voteByMatch(this) : false;
    }
}

(JSON.parse(localStorage.getItem("matches")) || []).forEach((match) => {
    const matchInfo = {
        firstTeam: match.matchInfo.team1,
        secondTeam: match.matchInfo.team2,
        startDate: Number(match.matchInfo.startDate),
        endDate: Number(match.matchInfo.endDate),
        stadium: match.matchInfo.venueInfo.ground + " , " + match.matchInfo.venueInfo.city,
        winner: function () {
            if (match.matchInfo.state == "Complete") {
                return match.matchInfo.status.includes(match.matchInfo.team1.teamName) ? match.matchInfo.team1 : match.matchInfo.team2;
            }
        },
        name: match.matchInfo.matchDesc
    };
    if (match.matchScore) {
        matchInfo.firstTeam = { ...match.matchScore.team1Score, ...matchInfo.firstTeam };
        matchInfo.secondTeam = { ...match.matchScore.team2Score, ...matchInfo.secondTeam };
    }
    Schedule.push(new NewSchedule(matchInfo));
});

if (!localStorage.getItem("matches") || Schedule[nextGameIndex()].endDate - new Date().getTime() < 2 * 60 * 60 * 1000) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '468381f4fcmsh34b3449547a652dp14453cjsna2bb93345db8',
            'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
        }
    };
    try {
        const response = await fetch('https://cricbuzz-cricket.p.rapidapi.com/series/v1/5945', options);
        const result = await response.json();
        const matches = [];
        result.matchDetails.forEach(day => {
            if ((day.matchDetailsMap)) {
                (day.matchDetailsMap.match).forEach(match => {
                    matches.push(match)
                })
            }
        });
        localStorage.setItem("matches", JSON.stringify(matches));
    } catch (error) {
        console.error(error);
    }
    window.location.reload();
}