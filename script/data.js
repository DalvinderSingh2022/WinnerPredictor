import { TeamByLogo, MatchFromId, currentUser } from "./index.js";

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
    points = function () {
        var point = 0;
        for (let index = 0; index < this.Voted.length; index++) {
            const vote = this.Voted[index];
            const match = MatchFromId(this.Voted[index].matchId);
            if (match.Winner && (vote.teamLogo == match.Winner.Logo)) {
                point += Number((vote.time[1] + vote.time[2] * (0.1)).toFixed(0));
            };
        }
        return point;
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

export var Teams = [];
class NewTeam {
    constructor(Logo, image) {
        this.Logo = Logo;
        this.Image = image;
    }
    Team = function () {
        switch (this.Logo) {
            case "csk":
                return "Chennai Super Kings";
            case "srh":
                return "Sunrisers Hyderabad";
            case "kkr":
                return "Kolkata Knight Riders";
            case "rr":
                return "Rajasthan Royals";
            case "mi":
                return "Mumbai Indians";
            case "pk":
                return "Punjab Kings";
            case "rcb":
                return "Royal Challengers Bangalore";
            case "dc":
                return "Delhi Capitals";
            case "gt":
                return "Gujrat Titans";
            case "lsg":
                return "Lucknow Super Giants";
        }
    }
}
Teams.push(new NewTeam("csk", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CSK/logos/Roundbig/CSKroundbig.png"));
Teams.push(new NewTeam("dc", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/DC/Logos/Roundbig/DCroundbig.png"));
Teams.push(new NewTeam("gt", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/GT/Logos/Roundbig/GTroundbig.png"));
Teams.push(new NewTeam("kkr", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/KKR/Logos/Roundbig/KKRroundbig.png"));
Teams.push(new NewTeam("lsg", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/LSG/Logos/Roundbig/LSGroundbig.png"));
Teams.push(new NewTeam("mi", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/MI/Logos/Roundbig/MIroundbig.png"));
Teams.push(new NewTeam("pk", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/PBKS/Logos/Roundbig/PBKSroundbig.png"));
Teams.push(new NewTeam("rr", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Roundbig/RRroundbig.png"));
Teams.push(new NewTeam("rcb", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Roundbig/RCBroundbig.png"));
Teams.push(new NewTeam("srh", "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/SRH/Logos/Roundbig/SRHroundbig.png"));

export var Schedule = [];
class NewSchedule {
    constructor(homeTeam, awayTeam, date, time, stadium, winner) {
        this.homeTeam = TeamByLogo(homeTeam);
        this.awayTeam = TeamByLogo(awayTeam);
        this.stadium = stadium;
        this.date = date;
        this.time = time;
        this.Id = (this.homeTeam.Logo + this.awayTeam.Logo + this.date + this.stadium).replaceAll("-", "").replaceAll(" ", "");
        this.Winner = TeamByLogo(winner);
        this.homeTeamVoters = this.voters(this.homeTeam);
        this.awayTeamVoters = this.voters(this.awayTeam);
    }
    vote(teamType) {
        currentUser().Voted.push({
            teamType: teamType,
            matchId: this.Id,
            teamLogo: this[teamType].Logo,
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
        var time = this.time.replace("pm", ":0").split(":");
        time = (Number(time[0]) + 12) + ":" + time[1] + ":" + time[2];

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
                if ((Users[key].Voted)[i].matchId == this.Id && (!team || (Users[key].Voted)[i].teamLogo == team.Logo)) {
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
Schedule.push(new NewSchedule("gt", "csk", "31-3-2023", "1:20pm", "Narendra Modi Stadium", "gt"));
Schedule.push(new NewSchedule("pk", "kkr", "1-4-2023", "3:30pm", "IS Bindra Stadium", "pk"));
Schedule.push(new NewSchedule("lsg", "dc", "1-4-2023", "7:30pm", "Ekana Cricket Stadium", "lsg"));
Schedule.push(new NewSchedule("srh", "rr", "2-4-2023", "3:30pm", "Rajiv Gandhi International Stadium"));
Schedule.push(new NewSchedule("rcb", "mi", "2-4-2023", "7:30pm", "M Chinnaswamy Stadium"));
Schedule.push(new NewSchedule("csk", "lsg", "3-4-2023", "7:30pm", "MA Chidambaram Stadium"));
Schedule.push(new NewSchedule("dc", "gt", "4-4-2023", "7:30pm", "Arun Jaitley Stadium"));
Schedule.push(new NewSchedule("rr", "srh", "5-4-2023", "7:30pm", "Barsapara Cricket Stadium"));
Schedule.push(new NewSchedule("kkr", "rcb", "6-4-2023", "7:30pm", "Eden Gardens"));
Schedule.push(new NewSchedule("lsg", "srh", "7-4-2023", "7:30pm", "Ekana Cricket Stadium"));
Schedule.push(new NewSchedule("rr", "dc", "8-4-2023", "3:30pm", "Barsapara Cricket Stadium"));
Schedule.push(new NewSchedule("mi", "csk", "8-4-2023", "7:30pm", "Wankhede Stadium"));
Schedule.push(new NewSchedule("gt", "kkr", "9-4-2023", "3:30pm", "Narendra Modi Stadium"));
Schedule.push(new NewSchedule("srh", "pk", "9-4-2023", "7:30pm", "Rajiv Gandhi International Stadium"));
Schedule.push(new NewSchedule("rcb", "lsg", "10-4-2023", "7:30pm", "M Chinnaswamy Stadium"));
Schedule.push(new NewSchedule("dc", "mi", "11-4-2023", "7:30pm", "Arun Jaitley Stadium"));
Schedule.push(new NewSchedule("csk", "rr", "12-4-2023", "7:30pm", "MA Chidambaram Stadium"));
Schedule.push(new NewSchedule("pk", "gt", "13-4-2023", "7:30pm", "IS Bindra Stadium"));
Schedule.push(new NewSchedule("kkr", "srh", "14-4-2023", "7:30pm", "Eden Gardens"));
Schedule.push(new NewSchedule("rcb", "dc", "15-4-2023", "3:30pm", "M Chinnaswamy Stadium"));
Schedule.push(new NewSchedule("lsg", "pk", "15-4-2023", "7:30pm", "Ekana Cricket Stadium"));
Schedule.push(new NewSchedule("mi", "kkr", "16-4-2023", "3:30pm", "Wankhede Stadium"));
Schedule.push(new NewSchedule("gt", "rr", "16-4-2023", "7:30pm", "Narendra Modi Stadium"));
Schedule.push(new NewSchedule("rcb", "csk", "17-4-2023", "7:30pm", "M Chinnaswamy Stadium"));
Schedule.push(new NewSchedule("srh", "mi", "18-4-2023", "7:30pm", "Rajiv Gandhi International Stadium"));
Schedule.push(new NewSchedule("rr", "lsg", "19-4-2023", "7:30pm", "Sawai Mansingh Stadium"));
Schedule.push(new NewSchedule("pk", "rcb", "20-4-2023", "3:30pm", "IS Bindra Stadium"));
Schedule.push(new NewSchedule("dc", "kkr", "20-4-2023", "7:30pm", "Arun Jaitley Stadium"));
Schedule.push(new NewSchedule("csk", "srh", "21-4-2023", "7:30pm", "MA Chidambaram Stadium"));
Schedule.push(new NewSchedule("lsg", "gt", "22-4-2023", "3:30pm", "Ekana Cricket Stadium"));
Schedule.push(new NewSchedule("mi", "pk", "22-4-2023", "7:30pm", "Wankhede Stadium"));
Schedule.push(new NewSchedule("rcb", "rr", "23-4-2023", "3:30pm", "M Chinnaswamy Stadium"));
Schedule.push(new NewSchedule("rcb", "csk", "23-4-2023", "7:30pm", "M Chinnaswamy Stadium"));
Schedule.push(new NewSchedule("srh", "dc", "24-4-2023", "7:30pm", "Rajiv Gandhi International Stadium"));
Schedule.push(new NewSchedule("gt", "mi", "25-4-2023", "7:30pm", "Narendra Modi Stadium"));
Schedule.push(new NewSchedule("rcb", "kkr", "26-4-2023", "7:30pm", "M Chinnaswamy Stadium"));
Schedule.push(new NewSchedule("rr", "csk", "27-4-2023", "7:30pm", "Sawai Mansingh Stadium"));
Schedule.push(new NewSchedule("pk", "lsg", "28-4-2023", "7:30pm", "IS Bindra Stadium"));
Schedule.push(new NewSchedule("kkr", "gt", "29-4-2023", "3:30pm", "Eden Gardens"));
Schedule.push(new NewSchedule("dc", "srh", "29-4-2023", "7:30pm", "Arun Jaitley Stadium"));
Schedule.push(new NewSchedule("csk", "pk", "30-4-2023", "3:30pm", "MA Chidambaram Stadium"));
Schedule.push(new NewSchedule("mi", "rr", "30-4-2023", "7:30pm", "Wankhede Stadium"));
Schedule.push(new NewSchedule("rr", "csk", "1-5-2023", "7:30pm", "Sawai Mansingh Stadium"));
Schedule.push(new NewSchedule("gt", "dc", "2-5-2023", "7:30pm", "Narendra Modi Stadium"));
Schedule.push(new NewSchedule("pk", "mi", "3-5-2023", "7:30pm", "IS Bindra Stadium"));
Schedule.push(new NewSchedule("lsg", "csk", "4-5-2023", "3:30pm", "Ekana Cricket Stadium"));
Schedule.push(new NewSchedule("srh", "kkr", "4-5-2023", "7:30pm", "Rajiv Gandhi International Stadium"));
Schedule.push(new NewSchedule("rr", "gt", "5-5-2023", "7:30pm", "Sawai Mansingh Stadium"));
Schedule.push(new NewSchedule("csk", "mi", "6-5-2023", "3:30pm", "MA Chidambaram Stadium"));
Schedule.push(new NewSchedule("dc", "rcb", "6-5-2023", "7:30pm", "Arun Jaitley Stadium"));
Schedule.push(new NewSchedule("gt", "lsg", "7-5-2023", "3:30pm", "Narendra Modi Stadium"));
Schedule.push(new NewSchedule("rr", "srh", "7-5-2023", "7:30pm", "Sawai Mansingh Stadium"));
Schedule.push(new NewSchedule("kkr", "pk", "8-5-2023", "7:30pm", "Eden Gardens"));
Schedule.push(new NewSchedule("mi", "rcb", "9-5-2023", "7:30pm", "Wankhede Stadium"));
Schedule.push(new NewSchedule("csk", "dc", "10-5-2023", "7:30pm", "MA Chidambaram Stadium"));
Schedule.push(new NewSchedule("kkr", "rr", "11-5-2023", "7:30pm", "Eden Gardens"));
Schedule.push(new NewSchedule("mi", "gt", "12-5-2023", "7:30pm", "Wankhede Stadium"));
Schedule.push(new NewSchedule("srh", "lsg", "13-5-2023", "3:30pm", "Rajiv Gandhi International Stadium"));
Schedule.push(new NewSchedule("dc", "pk", "13-5-2023", "7:30pm", "Arun Jaitley Stadium"));
Schedule.push(new NewSchedule("rr", "rcb", "14-5-2023", "3:30pm", "Sawai Mansingh Stadium"));
Schedule.push(new NewSchedule("csk", "kkr", "14-5-2023", "7:30pm", "MA Chidambaram Stadium"));
Schedule.push(new NewSchedule("gt", "srh", "15-5-2023", "7:30pm", "Narendra Modi Stadium"));
Schedule.push(new NewSchedule("lsg", "mi", "16-5-2023", "7:30pm", "Ekana Cricket Stadium"));
Schedule.push(new NewSchedule("pk", "dc", "17-5-2023", "7:30pm", "Himachal Pradesh Cricket Association Stadium"));
Schedule.push(new NewSchedule("srh", "rcb", "18-5-2023", "7:30pm", "Rajiv Gandhi International Stadium"));
Schedule.push(new NewSchedule("pk", "rr", "19-5-2023", "7:30pm", "Himachal Pradesh Cricket Association Stadium"));
Schedule.push(new NewSchedule("dc", "csk", "20-5-2023", "3:30pm", "Arun Jaitley Stadium"));
Schedule.push(new NewSchedule("kkr", "lsg", "20-5-2023", "7:30pm", "Eden Gardens"));
Schedule.push(new NewSchedule("mi", "srh", "21-5-2023", "3:30pm", "Wankhede Stadium"));
Schedule.push(new NewSchedule("rcb", "gt", "21-5-2023", "7:30pm", "M Chinnaswamy Stadium"));