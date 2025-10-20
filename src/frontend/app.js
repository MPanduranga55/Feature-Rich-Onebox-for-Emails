const API_URL = "http://localhost:5000/api";
const socket = io("http://localhost:5000");

const emailList = document.getElementById("emailList");
const emailViewer = document.getElementById("emailViewer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const composeModal = document.getElementById("composeModal");
const composeBtn = document.getElementById("composeBtn");
const closeModal = document.getElementById("closeModal");
const sendEmailBtn = document.getElementById("sendEmailBtn");

async function loadEmails(query = "") {
  const res = await fetch(`${API_URL}/emails?search=${query}`);
  const data = await res.json();
  renderEmailList(data);
}

function renderEmailList(emails) {
  emailList.innerHTML = emails.map(e => `
    <div class="email-item" data-id="${e.id}">
      <strong>${e.from}</strong> - ${e.subject}
      <p>${e.snippet}</p>
    </div>
  `).join("");

  document.querySelectorAll(".email-item").forEach(item =>
    item.addEventListener("click", () => viewEmail(item.dataset.id))
  );
}

async function viewEmail(id) {
  const res = await fetch(`${API_URL}/emails/${id}`);
  const email = await res.json();
  emailViewer.innerHTML = `
    <h2>${email.subject}</h2>
    <p><b>From:</b> ${email.from}</p>
    <p><b>To:</b> ${email.to}</p>
    <p>${email.body}</p>
  `;
  emailViewer.classList.remove("hidden");
}

searchBtn.addEventListener("click", () => loadEmails(searchInput.value));
composeBtn.onclick = () => composeModal.classList.remove("hidden");
closeModal.onclick = () => composeModal.classList.add("hidden");

sendEmailBtn.onclick = async () => {
  const to = document.getElementById("to").value;
  const subject = document.getElementById("subject").value;
  const body = document.getElementById("body").value;

  const res = await fetch(`${API_URL}/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, body })
  });

  if (res.ok) {
    alert("Email sent!");
    composeModal.classList.add("hidden");
    loadEmails();
  } else {
    alert("Failed to send email");
  }
};

socket.on("new_email", (email) => {
  const item = document.createElement("div");
  item.className = "email-item";
  item.innerHTML = `<strong>${email.from}</strong> - ${email.subject}`;
  emailList.prepend(item);
});

loadEmails();
