import { LoadMatches, currentUser } from "./index.js";

if (!currentUser()) window.location.pathname = "/account.html";

const container = document.querySelector(".container");
container.innerHTML = `
<form class="flex col w-100 inner">
    <div class="flex inner w-100">
        <div class="flex col inner sub w-100">
            <div class="flex inner group col w-100">
                <label for="name">Name</label>
                <input type="text" id="name" value=${currentUser().Name} disabled>
            </div>
            <div class="flex inner group col w-100">
                <label for="email">Email</label>
                <input type="email" id="email" value=${currentUser().Email} disabled>
            </div>
        </div>
        <div class="flex col sub w-100 inner avatars">
            <img class="selected" src=${currentUser().Avatar}>
            <label for="avatar" class="flex inner w-100">Avatar</label>
        </div>
    </div>
    <div class="flex group nowrap inner">
        <input class="pri" type="submit" value="SignOut">
    </div>
</form>`;

container.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const user = currentUser();
    user.Signined = false;
    user.updateUser();
    window.location.reload();
}

if ((currentUser()).VotedMatches()) {
    LoadMatches((currentUser()).VotedMatches());
    document.querySelector(".head").classList.remove("hide");
}