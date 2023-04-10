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
    pointsAndMatches() {
        var points = 0;
        var matches = 0;
        for (let index = 0; index < this.Voted.length; index++) {
            const vote = this.Voted[index];
            const match = MatchFromId(this.Voted[index].matchId);
            if (match.Winner) {
                matches++;
                if (vote.teamLogo == match.Winner.shortname.toLowerCase()) {
                    points += Number((vote.time[1] + vote.time[2] * (0.1)).toFixed(0));
                };
            }
        }
        return { points, matches };
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
    constructor({ homeTeam, awayTeam, date, time, stadium, winner }) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.stadium = stadium;
        this.date = date;
        this.time = time;
        this.Id = (this.homeTeam.shortname.toLowerCase() + this.awayTeam.shortname.toLowerCase() + this.date + this.stadium).replaceAll("-", "").replaceAll(" ", "");
        this.Winner = winner();
        this.homeTeamVoters = this.voters(this.homeTeam);
        this.awayTeamVoters = this.voters(this.awayTeam);
    }
    vote(teamType) {
        currentUser().Voted.push({
            teamType: teamType,
            matchId: this.Id,
            teamLogo: this[teamType].shortname.toLowerCase(),
            time: this.timeGap(),
        });
        currentUser().updateUser();
        window.location.reload();
    }
    revote(teamType) {
        const vote = currentUser().voteByMatch(this);
        vote.teamType = teamType;
        vote.teamLogo = this[teamType].Logo;
        vote.time = this.timeGap(),
            currentUser().updateUser();
        window.location.reload();
    }
    timeGap() {
        var date = this.date.split("-").reverse().toString().replaceAll(",", "-");
        var time = this.time;
        const MatchDay = date + "," + time;
        const MatchDate = new Date(MatchDay);
        const Today = new Date();
        const gapInMilli = (MatchDate.getTime() - Today.getTime());

        var seconds = Math.floor((gapInMilli / 1000) % 60);
        var minutes = Math.floor((gapInMilli / 1000 / 60) % 60);
        var hours = Math.floor((gapInMilli / 1000 / 60 / 60) % 24);
        var days = Math.floor((gapInMilli / 1000 / 60 / 60 / 24));
        return [days, hours, minutes, seconds];
    }
    format() {
        for (const key in Schedule) {
            if (Schedule[key].Id == this.Id) {
                var index = key;
            }
        }
        const LeagueStage = 70;
        const PlayOffs = ["Qualifier-1", "Eliminator", "Qualifier-2", "Final"];
        if (Number(index) + 1 <= LeagueStage) {
            return `MATCH - ${Number(index) + 1}`;
        } else {
            return PlayOffs[(Number(index)) - LeagueStage];
        }
    }
    voters(team = "") {
        var voters = [];
        for (const key in Users) {
            for (let i = 0; i < Users[key].Voted.length; i++) {
                if ((Users[key].Voted)[i].matchId == this.Id && (!team || (Users[key].Voted)[i].teamLogo == team.shortname.toLowerCase())) {
                    voters.push(Users[key]);
                }
            }
        }
        return voters;
    }
    status() {
        const TimeGap = this.timeGap();
        if (TimeGap[0] > 0 || (TimeGap[0] < 0 && TimeGap[1] > 0) || (TimeGap[0] < 0 && TimeGap[1] < 0 && TimeGap[2] > 0) || (TimeGap[0] < 0 && TimeGap[1] < 0 && TimeGap[2] < 0 && TimeGap[3] > 0)) {
            return "Upcoming";
        }
        if ((TimeGap[0] < 0 && TimeGap[1] < 0 && TimeGap[2] < 0 && TimeGap[3] < 0) && this.Winner) {
            return "Completed";
        }
        if ((TimeGap[0] < 0 && TimeGap[1] < 0 && TimeGap[2] < 0 && TimeGap[3] < 0) && !this.Winner) {
            return "Live";
        }
        if (TimeGap[0] <= 0 && TimeGap[1] < 24) {
            return "Today";
        }
    }
    IsVoted() {
        return currentUser() ? currentUser().voteByMatch(this) : false;
    }
}

(JSON.parse(localStorage.getItem("api")) || []).forEach((match) => {
    const matchInfo = {
        homeTeam: match.teamInfo[0],
        awayTeam: match.teamInfo[1],
        date: match.date.split("-").reverse().toString().replaceAll(",", "-"),
        time: new Date(new Date(match.dateTimeGMT).getTime() + 5.5 * 60 * 60000).toLocaleString().split(",")[1],
        stadium: match.venue,
        winner: function () {
            if (match.matchEnded) {
                return match.status.includes(match.teamInfo[0].name) ? match.teamInfo[0] : match.teamInfo[1]
            }
        }
    };
    Schedule.push(new NewSchedule(matchInfo));
});

Schedule.sort((a, b) => { return a.date.split("-")[0] - b.date.split("-")[0] })
    .sort((a, b) => { return a.date.split("-")[1] - b.date.split("-")[1] })
    .sort((a, b) => { return a.date.split("-")[2] - b.date.split("-")[2] });

if (!localStorage.getItem("api") || Schedule[nextGameIndex()].timeGap()[1] <= -5 || Schedule[nextGameIndex()].timeGap()[0] < 0 || nextGameIndex() == Schedule.length - 1) {
    try {
        const response = await fetch('https://api.cricapi.com/v1/series_info?apikey=ce17e445-8670-4cd6-aed1-d94e863fe558&id=c75f8952-74d4-416f-b7b4-7da4b4e3ae6e');
        const data = await response.json();
        if (data.status == "success") {
            localStorage.setItem("api", JSON.stringify(data.data.matchList));
            window.location.reload();
        }
    } catch (error) {
        throw new TypeError(error);
    }
}