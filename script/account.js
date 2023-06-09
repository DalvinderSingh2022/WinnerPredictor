import { NewUser } from "./data.js";
import { UserFrom, alertBox, currentUser } from "./index.js";

if (currentUser()) window.location.pathname = "profile.html";

const SelectedImage = document.querySelector(".signup .selected");
const Avatars = document.querySelector(".signup .images");
const Links = document.querySelectorAll(".link");

Avatars.querySelectorAll("img").forEach((img) => {
    img.addEventListener("click", (e) => {
        const image = e.target;
        SelectedImage.src = image.src;
    })
});

Links.forEach(link => {
    link.onclick = () => {
        document.querySelector(".signup.container").classList.toggle("active");
        document.querySelector(".signin.container").classList.toggle("active");
        link.parentElement.parentElement.querySelector("input[type='reset']").click();
    }
})

document.querySelector(".signup form").onsubmit = (e) => {
    e.preventDefault();
    const container = document.querySelector(".signup");
    const userinfo = {
        Name: container.querySelector("#name").value,
        Email: container.querySelector("#email").value,
        Password: container.querySelector("#password").value,
        Avatar: container.querySelector(".selected").src,
        Voted: [],
        Signined: false
    }
    const user = new NewUser(userinfo);

    if (!userinfo.Name || !userinfo.Email || !userinfo.Password) {
        alertBox("complete form all fields are required");
        return;
    } else {
        if (UserFrom(user.Email)) {
            alertBox("Account exist with same email");
        } else if (UserFrom(user.Name)) {
            alertBox("Username not Available");
        } else {
            user.addUser();
            user.changeCurrentUser();
            window.location.reload();
        }
    }
}

document.querySelector(".signin form").onsubmit = (e) => {
    e.preventDefault();
    const container = document.querySelector(".signin");
    const name = container.querySelector("#name").value;
    const email = container.querySelector("#email").value;
    const password = container.querySelector("#password").value;
    const userId = (name + email + password).toString().replaceAll(" ", "");
    const user = UserFrom(userId);

    if (!name || !email || !password) {
        alertBox("complete form all fields are required");
    } else {
        if (UserFrom(userId)) {
            user.changeCurrentUser();
            window.location.reload();
        } else {
            alertBox("Account does not exist");
        };
    }
}