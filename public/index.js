const loginModal = new bootstrap.Modal(document.getElementById("login-modal"), {
  backdrop: "static",
  keyboard: false,
});

loginModal.show();

document.getElementById("join-form").addEventListener("submit", (e) => {
  e.preventDefault();

  loginModal.hide();

  const nickname = document.getElementById("nickname").value || "user";

  const socket = io({
    query: { nickname },
  });

  const onlineUsers = document.getElementById("online-users");
  const messages = document.getElementById("messages");
  const messageForm = document.getElementById("message-form");
  const input = document.getElementById("input");

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value) {
      socket.emit("chat message", input.value);
      appendMessage(nickname, input.value);
      input.value = "";
    }
  });

  socket.on("connection established", (users) => {
    users.forEach((user) => {
      const item = document.createElement("li");
      item.classList.add("list-group-item");
      item.textContent = user.nickname;
      item.dataset.id = user.id;

      onlineUsers.appendChild(item);
    });
  });

  socket.on("chat message", ({ nickname, msg }) => {
    appendMessage(nickname, msg);
  });

  socket.on("user connected", ({ id, nickname }) => {
    const item = document.createElement("li");
    item.classList.add("list-group-item");
    item.textContent = nickname;
    item.dataset.id = id;
    onlineUsers.appendChild(item);
  });

  socket.on("user disconnected", ({ id, nickname }) => {
    document.querySelector(`#online-users>li[data-id='${id}']`).remove();
  });

  function appendMessage(nickname2, msg) {
    const item = document.createElement("li");
    item.classList.add("list-group-item");

    if (nickname === nickname2) {
      item.classList.add("text-end");
    }
    item.textContent = `${nickname2}: ${msg}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }
});
