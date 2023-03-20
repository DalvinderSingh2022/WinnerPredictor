import { NewUser } from "./data.js";
import { UserFrom, LoadMatches, currentUser } from "./index.js";

var state = currentUser() ? "signout" : "signup";
const container = document.querySelector(".container");

const Load = {
    SignUp: function () {
        container.innerHTML = `
        <form class="flex col w-100 inner">
            <div class="flex inner w-100">
                <div class="flex col inner sub w-100">
                    <div class="flex inner group col w-100">
                        <label for="name">Name</label>
                        <input type="text" id="name" class="name">
                    </div>
                    <div class="flex inner group col w-100">
                        <label for="email">Email</label>
                        <input type="email" id="email" class="email">
                    </div>
                    <div class="flex inner group col w-100">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="password">
                    </div>
                </div>
                <div class="flex col sub w-100 inner avatars">
                    <img src="https://media.istockphoto.com/id/1330099621/vector/african-man-avatar-portrait-of-a-young-african-man-in-retro-style-portrait-of-a-man.jpg?s=612x612&w=0&k=20&c=ej4BaE9xslGSawH2QMnrjlbHyLgvQW5IlzdpoQCMSO0="
                        class="selected">
                    <label for="avatar" class="flex inner w-100">Avatar</label>
                    <div class="flex inner images">
                        <img src="https://media.istockphoto.com/id/1330099621/vector/african-man-avatar-portrait-of-a-young-african-man-in-retro-style-portrait-of-a-man.jpg?s=612x612&w=0&k=20&c=ej4BaE9xslGSawH2QMnrjlbHyLgvQW5IlzdpoQCMSO0="
                            alt="avatar">
                        <img src="https://media.istockphoto.com/id/682532778/vector/avatar-men-design.jpg?s=612x612&w=0&k=20&c=9ugn-kvMHEFPFJMUJkj-_r1cvvvPDrX5HY0_LiBZ4zc="
                            alt="avatar">
                        <img src="https://media.istockphoto.com/id/1412003809/vector/flat-simple-cartoon-portrait-of-handsome-men-with-curly-hair-and-beard-isolated.jpg?s=612x612&w=0&k=20&c=jtDBMmCUdqpSuNAH8Vkm3t2o9wibbHnFBGkOB8QnkIg="
                            alt="avatar">
                        <img src="https://media.istockphoto.com/id/1143507861/vector/man-avatar-in-circle-cartoon-guy-with-black-hair-beard-and-glasses.jpg?s=612x612&w=0&k=20&c=xx5Alt1KG4X3vZrq9S3DJi9HmAbqS-8lEPBU00ZwBR0="
                            alt="avatar">
                        <img src="https://media.istockphoto.com/id/1165659250/vector/girl.jpg?s=612x612&w=0&k=20&c=PKP1DIC875yXlAL-n_t9cWG315T6Ta8hwNodwz-PAGY="
                            alt="avatar">
                        <img src="https://media.istockphoto.com/id/837117746/vector/girl-in-headphones-listening-music-and-smiling-vector-illustration-flat-cartoon-young-happy.jpg?s=612x612&w=0&k=20&c=Wq1Jf1Et19GvF76FFZGR--eDuYgabcnH9skq6pM1n8g="
                            alt="avatar">
                        <img src="https://media.istockphoto.com/id/1341252730/vector/male-profile-avatar-cartoon-style-icon-colorful-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=2BcsyI4RT8F0cSfQCZJ_lulFjVxShF1jrPL_WKOxLfc="
                            alt="avatar">
                        <img src="https://media.istockphoto.com/id/1385793615/vector/cute-girl-avatar-flat-style.jpg?s=612x612&w=0&k=20&c=QI2CmpwUFletocojZwnbn0nVmYVEQdG8BENEalLvvUU="
                            alt="avatar">
                    </div>
                </div>
            </div>
            <div class="flex inner group nowrap">
                <input class="pri" type="submit" value="SignUp">
                <input class="pri" type="reset" value="Reset">
            </div>
            <div class="flex inner group">
                <a class="link">SignIn to existing account</a>
            </div>
        </form>`;
        const SelectedImage = container.querySelector(".selected");
        const Avatars = container.querySelector(".images");
        const link = container.querySelector(".link");
        Avatars.querySelectorAll("img").forEach((img) => {
            img.addEventListener("click", (e) => {
                const image = e.target;
                SelectedImage.src = image.src;
            })
        });
        link.addEventListener("click", () => {
            state = "signin";
            render();
        });
        container.querySelector("form").onsubmit = (e) => {
            e.preventDefault();
            const name = container.querySelector("#name").value;
            const email = container.querySelector("#email").value;
            const password = container.querySelector("#password").value;
            const avtar = container.querySelector(".selected").src;
            const user = new NewUser(name, email, password, avtar);

            if (!name || !email || !password) {
                alert("complete form");
                return;
            } else {
                if (UserFrom(user.Email) || UserFrom(user.Name)) {
                    alert("same");
                } else {
                    user.addUser();
                    user.changeCurrentUser();
                    window.location.reload();
                }
            }
        }
    },
    SignIn: function () {
        container.classList.add("signin");
        container.innerHTML = `
        <form class="flex col w-100 inner">
            <div class="flex inner w-100">
                <div class="flex inner group col w-100">
                    <label for="name">Name</label>
                    <input type="text" id="name" class="name">
                </div>
                <div class="flex inner group col w-100">
                    <label for="email">Email</label>
                    <input type="email" id="email" class="email">
                </div>
                <div class="flex inner group col w-100">
                    <label for="password">Password</label>
                    <input type="password" id="password" class="password">
                </div>
            </div>
            <div class="flex inner group nowrap">
                <input class="pri" type="submit" value="SignIn">
                <input class="pri" type="reset" value="Reset">
            </div>
            <div class="flex inner group">
                <a class="link">Create another account</a>
            </div>
        </form>`;
        const link = container.querySelector(".link");
        link.addEventListener("click", () => {
            state = "signup";
            render();
        });
        container.querySelector("form").onsubmit = (e) => {
            e.preventDefault();
            const name = container.querySelector("#name").value;
            const email = container.querySelector("#email").value;
            const password = container.querySelector("#password").value;
            const userId = (name + email + password).toString().replaceAll(" ", "");
            const user = UserFrom(userId);

            if (!name || !email || !password) {
                alert("complete form");
                return;
            } else {
                if (UserFrom(user.Id)) {
                    user.changeCurrentUser();
                    window.location.reload();
                } else {
                    alert("not found");
                };
            }
        }
    },
    SignOut: function () {
        container.innerHTML = `
        <form class="flex col w-100 inner">
            <div class="flex inner w-100">
                <div class="flex col inner sub w-100">
                    <div class="flex inner group col w-100">
                        <label for="name">Name</label>
                        <input type="text" id="name" class="name" disabled>
                    </div>
                    <div class="flex inner group col w-100">
                        <label for="email">Email</label>
                        <input type="email" id="email" class="email" disabled>
                    </div>
                </div>
                <div class="flex col sub w-100 inner avatars">
                    <img src="https://media.istockphoto.com/id/1330099621/vector/african-man-avatar-portrait-of-a-young-african-man-in-retro-style-portrait-of-a-man.jpg?s=612x612&w=0&k=20&c=ej4BaE9xslGSawH2QMnrjlbHyLgvQW5IlzdpoQCMSO0="
                        class="selected">
                    <label for="avatar" class="flex inner w-100">Avatar</label>
                </div>
            </div>
            <div class="flex group nowrap inner">
                <input class="pri" type="submit" value="SignOut">
            </div>
        </form>`;
        container.querySelector("#name").value = currentUser().Name;
        container.querySelector("#email").value = currentUser().Email;
        container.querySelector(".selected").src = currentUser().Avatar;

        LoadMatches((currentUser()).VotedMatches());
        document.querySelector(".head").classList.remove("hide");

        container.querySelector("form").onsubmit = (e) => {
            e.preventDefault();
            const user = currentUser();
            user.Signined = false;
            user.updateUser();
            window.location.reload();
        }
    }
}

function render() {
    if (state == "signup") Load.SignUp();
    if (state == "signin") Load.SignIn();
    if (state == "signout") Load.SignOut();
}
render();