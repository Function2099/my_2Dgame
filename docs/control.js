
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
  // 顯示對應內容
  if (tabNumber === 1) {
    info.style.display = "block";
    controls.style.display = "none";
  } else if (tabNumber === 2) {
    info.style.display = "none";
    controls.style.display = "block";
  }

    // 切換 active 樣式
  const tabs = document.querySelectorAll(".tab-content li");
  tabs.forEach((tab, index) => {
    tab.classList.toggle("active", index === tabNumber - 1);
  });

}