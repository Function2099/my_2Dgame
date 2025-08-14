
document.getElementById("show-register").addEventListener("click", () => {
  document.getElementById("register-modal").classList.remove("hidden");
});

document.getElementById("close-register").addEventListener("click", () => {
  document.getElementById("register-modal").classList.add("hidden");
});

document.getElementById("show-login").addEventListener("click", () => {
  document.getElementById("login-modal").classList.remove("hidden");
});

document.getElementById("close-login").addEventListener("click", () => {
  document.getElementById("login-modal").classList.add("hidden");
});

function showTab(tabNumber) {
  const info = document.getElementById("game-info");
  const controls = document.getElementById("game-controls");

  if (tabNumber === 1) {
    info.style.display = "block";
    controls.style.display = "none";
  } else if (tabNumber === 2) {
    info.style.display = "none";
    controls.style.display = "block";
  }
}