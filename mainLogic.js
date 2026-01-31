let toastBody = document.getElementById("toast-body");
let buttonSection = document.getElementById("buttons-content");
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let theId = window.localStorage.getItem("currntPost");
let content = document.getElementById("conteniner");
let commentInput = document.getElementById("comment-input");
let commentButton = document.getElementById("comment-button");
let ofcanvas = document.getElementById("offcanvas-body");
const sectionOfPosts = document.getElementById("section_of_posts");
const newPostSection = document.querySelector(".newPost");
const url = "https://tarmeezacademy.com/api/v1";

window.addEventListener("scroll", () => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
    if (nearBottom) {
        showPosts();
    }
});

function showPosts() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    axios.get(`${url}/posts?page=${currentPage}`)
    .then(function (response) {
        let allPosts = response.data.data;
        if (allPosts.length === 0) {
            hasMore = false;
            return;
        }
        allPosts.forEach(element => {
            let avatar;
            if (!element.author.profile_image || typeof element.author.profile_image !== "string") {
                avatar = `<i class="hgi hgi-stroke hgi-user text-secondary"></i>`;
            } else {
                avatar = `<img src="${element.author.profile_image}" alt="" />`;
            }
            let card = document.createElement("div");
            card.className = "card rounded-3 shadow-sm my-3 border-0";
            card.dataset.id = element.id;
            card.innerHTML = `
                <ul class="list-group list-group-flush rounded-3">
                    <li class="list-group-item card-header d-flex align-items-center">
                        <div id="img_profile" class="profile border d-flex align-items-center justify-content-center rounded-circle bg-secondary-subtle">${avatar}</div>
                        <p class="mb-0 ms-2 fw-bold">${element.author.name}</p>
                    </li>
                    <li class="list-group-item">
                        <div class="text mb-3">${element.body}</div>
                        ${
                            element.image
                            ? `<div class="image w-100 d-flex justify-content-center mb-2">
                                    <img class="w-100 rounded-3" src="${element.image}" alt="" />
                                </div>`
                            : ""
                        }
                        <div class="date text-secondary">
                            <span class="badge bg-secondary-subtle text-black">${element.created_at}</span>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <button type="button" class="btn btn-outline-primary btn-sm d-flex">
                            <i class="hgi hgi-stroke hgi-comment-01"></i>
                            <p class="m-0 ms-2">(${element.comments_count}) comment</p>
                        </button>
                    </li>
                </ul>
            `;
            if (sectionOfPosts !== null) {
                sectionOfPosts.appendChild(card);
            }
        });
        currentPage++;
        isLoading = false;
        let card = document.querySelectorAll(".card");
        card.forEach((el) => {
            el.addEventListener("click", function () {
                window.localStorage.setItem("currntPost", el.dataset.id);
                window.location.href = "./post.html";
            })
        })
    })
    .catch(function (error) {
        isLoading = false;
        alert(error);
    });
}

function loginBtnClecked() {
    let username = document.getElementById("username-input").value;
    let password = document.getElementById("password-input").value;
    axios.post(`${url}/login`, {
        username: username,
        password: password
    })
        .then(function (response) {
            showAlart("Login successful", "loginModal")
            window.localStorage.setItem("token", response.data.token)
            window.localStorage.setItem("tarmmezUser", JSON.stringify(response.data.user))
            window.location.reload();
            changeUI();
        })
        .catch(function (error) {
            showAlart(`Error: ${error.response.data.message}`, "loginModal")
        })
}

function changeUI() {
    let token = window.localStorage.getItem("token");
    if (token == null) {
        buttonSection.innerHTML = `
            <button id="login" type="button" class="d-flex btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-whatever="@mdo"><i class="hgi hgi-stroke hgi-login-01 me-2"></i> LogIn</button>
            <button id="register" type="button" class="d-flex btn btn-outline-primary btn-sm ms-2" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-whatever="@mdo"><i class="hgi hgi-stroke hgi-user-add-02 me-2"></i> Register</button>
        `;
        if (newPostSection !== null) {
            newPostSection.innerHTML = "";
        }
    } else {
        buttonSection.innerHTML = `<button id="logout" onclick="logOut()" type="button" class="btn btn-danger btn-sm ms-2 d-flex"><i class="hgi hgi-stroke hgi-logout-01 me-2"></i> Log out</button>`;
        if (newPostSection !== null) {
            newPostSection.innerHTML = `<button id="btnNewPost" type="button" class="shadow-lg d-flex btn btn-primary" data-bs-toggle="modal" data-bs-target="#addNewPost" data-bs-whatever="@mdo"><i class="hgi hgi-stroke hgi-add-circle-half-dot me-2"></i> New Post</button>`;
        }
    }
}

function logOut() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("tarmmezUser");
    changeUI();
    const toastEl = document.getElementById('liveToast')
    const toast = new bootstrap.Toast(toastEl)
    toastBody.innerHTML = "Logout successful";
    window.location.reload();
    setTimeout(() => {
        toast.show()
    }, 300);
}

function registerClcked() {
    let username = document.getElementById("username-input-registar").value;
    let password = document.getElementById("password-input-registar").value;
    let email = document.getElementById("email-input").value;
    let name = document.getElementById("name-input").value;
    let image = document.getElementById("image-input");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("name", name);

    if (image.files.length > 0) {
        const postImg = image.files[0];
        formData.append("image", postImg, postImg.name);
    }

    axios.post(`${url}/register`, formData)
        .then((response) => {
            showAlart("Register is successful", "registerModal");
            window.localStorage.setItem("token", response.data.token)
            window.localStorage.setItem("tarmmezUser", JSON.stringify(response.data.user))
            changeUI();
        })
        .catch((error) => {
            showAlart(`Error: ${error.response.data.message}`, "registerModal");
        })
}

function addNewPost() {
    let bodyTxt = document.getElementById("bodyText").value;
    let imageInput = document.getElementById("create-post-image-input");
    let token = window.localStorage.getItem("token");

    const formData = new FormData();
    formData.append("body", bodyTxt);

    if (imageInput.files.length > 0) {
        const postImg = imageInput.files[0];
        formData.append("image", postImg, postImg.name);
    }

    axios.post(`${url}/posts`, formData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then((response) => {
            showAlart("Your Post is Created", "addNewPost");
            showPosts();
        })
        .catch((error) => {
            showAlart(`Error: ${error.response.data.message}}`, "addNewPost");
        })
}

function showAlart(txt, el) {
    const loginModal = bootstrap.Modal.getInstance(
        document.getElementById(el)
    )
    loginModal.hide()
    const toastEl = document.getElementById('liveToast')
    const toast = new bootstrap.Toast(toastEl)
    toastBody.innerHTML = txt;
    setTimeout(() => {
        toast.show()
    }, 300)
}

function showCurrentPost() {
    axios.get(`${url}/posts/${theId}`)
    .then((response) => {
        let data = response.data.data;
        // Header Of Post
        let headerOfPost = document.createElement("div");
        let avatar;
        if (!data.author.profile_image || typeof data.author.profile_image !== "string") {
            avatar = `<i class="hgi hgi-stroke hgi-user text-secondary"></i>`;
        } else {
            avatar = `<img src="${data.author.profile_image}" alt="" />`;
        }

        headerOfPost.className = "header d-flex align-items-center mb-3";
        headerOfPost.innerHTML = `
            <div class="profile border d-flex align-items-center justify-content-center rounded-circle bg-secondary-subtle">${avatar}</div>
            <h3 class="ms-2 fw-bold mb-0">${data.author.name}</h3>
        `;

        // Section Of Post
        let postSection = document.createElement("div");
        postSection.className = "postSectoin bg-body rounded-3 shadow-sm p-3 mb-3";
        postSection.innerHTML = `
            <div class="body mb-2">${data.body}</div>
            ${
                data.image
                ? `<div class="image w-100 d-flex justify-content-center mb-2">
                        <img class="w-25 rounded-3" src="${data.image}" alt="" />
                    </div>`
                : ""
            }
            <div class="date">
                <span class="badge bg-secondary-subtle text-black">${data.created_at}</span>
            </div>
        `;

        // Replay Of Post
        let cardOfReplay = document.querySelector(".replyse");
        let h2 = document.createElement("h2")
        h2.className = "mb-2";
        h2.textContent = "Comment";
        cardOfReplay.appendChild(h2);
        data.comments.forEach((el) => {
            let replayBox = document.createElement("div");
            replayBox.className = "card-comment py-2 border-top";
            let avatarReplay;
            if (!el.author.profile_image || typeof el.author.profile_image !== "string") {
                avatarReplay = `<i class="hgi hgi-stroke hgi-user text-secondary"></i>`;
            } else {
                avatarReplay = `<img src="${el.author.profile_image}" alt="" />`;
            }
            replayBox.innerHTML = `
                <div class="header d-flex align-items-center mb-2 pt-1">
                    <div class="profile border d-flex align-items-center justify-content-center rounded-circle bg-secondary-subtle">${avatarReplay}</div>
                    <h6 class="ms-2 mb-0">${el.author.name}</h6>
                </div>
                <div class="body-comment text-secondary">${el.body}</div>
            `;
            cardOfReplay.appendChild(replayBox);
        });
        
        content.appendChild(headerOfPost);
        content.appendChild(postSection);
        content.appendChild(cardOfReplay);
    })
}

function addCommentToPost() {
    let token = window.localStorage.getItem("token");

    if (commentInput.value !== "") {
        axios.post(`${url}/posts/${theId}/comments`, {
            "body": commentInput.value
        }, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
        })
        .then((response) => {
            window.location.reload();
        })
        .catch((error) => {
            
        })
    }
}

function showProfileInformation(user) {
    axios.get(`${url}/users/${user}`)
        .then((response) => {
            let data = response.data.data;

            let avatar;
            if (!data.profile_image || typeof data.profile_image !== "string") {
                avatar = `<i class="hgi hgi-stroke hgi-user text-secondary"></i>`;
            } else {
                avatar = `<img src="${data.profile_image}" alt="" />`;
            }
            ofcanvas.innerHTML = `
                <div class="profile-ofcanvas d-flex align-items-center mb-3">
                    <div id="img_profile" class="profile border d-flex align-items-center justify-content-center rounded-circle bg-secondary-subtle">${avatar}</div>
                    <div class="text ms-2">
                    <p class="fw-bold mb-0">${data.name}</p>
                    <p class="mb-0 text-secondary">@${data.username}</p>
                    </div>
                </div>
                <div class="card mb-3">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Email: ${data.email}</li>
                        <li class="list-group-item">Post Count: ${data.posts_count}</li>
                    </ul>
                </div>
                <h5>Post ${data.name} Created</h5>
                <div id="postsOfUser"></div>
            `;
            let postOfUser = document.getElementById("postsOfUser");
            axios.get(`${url}/users/${user}/posts`)
            .then((response) => {
                let data = response.data.data;
                data.forEach((el) => {
                        let card = document.createElement("div");
                        card.className = "card mb-4";
                        card.innerHTML = `
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex align-items-center justify-content-between">
                                    <button data-id="${el.id}" data-body="${el.body}" type="button" class="btn btn-secondary btn-sm" onclick="openEditPostModal(this)">Edit Post</button>
                                    <button data-id="${el.id}" type="button" class="btn btn-danger btn-sm" onclick="deletePost(this)">Delete Post</button>
                                </li>
                                <li class="list-group-item">${el.body}</li>
                                <li class="list-group-item text-body-secondary fs-6">${el.comments_count} comment</li>
                            </ul>
                        `;
                        postOfUser.appendChild(card);
                    })
                })
        })
}


function deletePost(btn) {
    let postId = btn.dataset.id;
    const token = localStorage.getItem("token");
    axios.delete(`${url}/posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then((response) => {
        let user = response.data.data.author.id;
        showProfileInformation(user)
    })
    .catch((error) => {
        return error;
    })
}

function deletePost(btn) {
    let postId = btn.dataset.id;
    const token = localStorage.getItem("token");
    axios.delete(`${url}/posts/${postId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then((response) => {
        let user = response.data.data.author.id;
        showProfileInformation(user)
    })
    .catch((error) => {
        return error
    })
}

document.getElementById("addNewPost").addEventListener("hidden.bs.modal", () => {
    document.getElementById("bodyText").value = "";
    document.getElementById("create-post-image-input").value = "";

    const modalFooterBtn = document.querySelector("#addNewPost .btn-primary");
    modalFooterBtn.innerText = "Create";
    modalFooterBtn.setAttribute("onclick", "addNewPost()");

    document.getElementById("exampleModalLabel").innerText = "Add New Post";
});

function openEditPostModal(btn) {
    const postId = btn.dataset.id;
    const postBody = btn.dataset.body;

    localStorage.setItem("editPostId", postId);

    document.getElementById("bodyText").value = postBody;

    document.getElementById("exampleModalLabel").innerText = "Edit Post";

    const modalFooterBtn = document.querySelector("#addNewPost .btn-primary");
    modalFooterBtn.innerText = "Update";
    modalFooterBtn.setAttribute("onclick", "updatePost()");

    const modal = new bootstrap.Modal(
        document.getElementById("addNewPost")
    );
    modal.show();
}

function updatePost() {
    const postId = localStorage.getItem("editPostId");
    const bodyTxt = document.getElementById("bodyText").value;
    const imageInput = document.getElementById("create-post-image-input");
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("_method", "put");
    formData.append("body", bodyTxt);

    if (imageInput.files.length > 0) {
        const postImg = imageInput.files[0];
        formData.append("image", postImg, postImg.name);
    }

    axios.post(`${url}/posts/${postId}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(() => {
        showAlart("Post Updated Successfully", "addNewPost");
        localStorage.removeItem("editPostId");
        window.location.reload();
    })
    .catch((error) => {
        showAlart(`Error: ${error.response.data.message}`, "addNewPost");
    });
}

