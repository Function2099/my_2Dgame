// 初始化用戶數據
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = null;

function checkLoginBeforeStart() {
  if (!currentUser) {
    alert('登入後開始遊戲');
    return;
  }
  // 呼叫 game.js 的版本
  window.startGame();
}

// 註冊功能
document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault(); // 阻止表單默認提交行為

  const email = document.getElementById('register-email').value;
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const nickname = document.getElementById('register-nickname').value;

  // 檢查郵箱是否已註冊
  if (users[email]) {
    alert('該郵箱已註冊！');
    return;
  }
  // 檢查使用者名稱是否已使用
  const isUsernameTaken = Object.values(users).some(u => u.username === username);
  if (isUsernameTaken) {
    alert('該使用者名稱已被使用！');
    return;
  }

  // 保存用戶數據（明文密碼，僅供測試！）
  users[email] = {
    username,
    password,
    nickname,
    // progress: {} // 初始化遊戲進度
  };
  // 更新 localStorage
  localStorage.setItem('users', JSON.stringify(users));
  alert('註冊成功！');
  document.getElementById('register-modal').classList.add('hidden'); // 關閉彈窗

  // 自動登入
  currentUser = email; //設置當前用戶剛註冊的郵箱
  localStorage.setItem('currentUser', email); //保存當前用戶到localStorage
  updateAuthUI();

  console.log('註冊成功，準備啟動遊戲...');
  console.log('game-frame 元素:', document.getElementById('game-frame'));
  console.log('startGame 函數:', typeof window.startGame);

  setTimeout(() => {
    console.log('調用 startGame');
    checkLoginBeforeStart();
  }, 500);

  document.getElementById("register-email").value = "";
  document.getElementById("register-username").value = "";
  document.getElementById("register-password").value = "";
  document.getElementById("register-nickname").value = "";
});


// 登入功能
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const identifier = document.getElementById('login-identifier').value;
  const password = document.getElementById('login-password').value;

  // 檢查是否空輸入
  if (!identifier || !password) {
    showLoginError('請輸入帳號或密碼');
    return;
  }

  // 檢查輸入的是郵件還是用戶名
  let userEmail = null;
  for (const email in users) {
    if (email === identifier || users[email].username === identifier) {
      userEmail = email;  // 正確儲存匹配的郵箱
      break;
    }
  }
  // 檢查用戶是否存在且密碼正確
  if (userEmail) {
    if (users[userEmail].password === password) {
      // 登入成功
      currentUser = userEmail;
      alert(`歡迎回來，${users[userEmail].nickname || users[userEmail].username}！`);
      document.getElementById('login-modal').classList.add('hidden');
      updateAuthUI();

      console.log('登入成功，準備啟動遊戲...');
      setTimeout(() => {
        console.log('調用 startGame');
        checkLoginBeforeStart();
      }, 500);

    } else {
      showLoginError('密碼錯誤！');
    }
  } else {
    showLoginError('帳號不存在！');
  }
});

function showLoginError(message) {
  //移除舊的錯誤訊息
  const oldError = document.querySelector('.login-error-message');
  if (oldError) oldError.remove();

  //創建新的錯誤訊息元素
  const errorElement = document.createElement('div');
  errorElement.className = 'login-error-message';
  errorElement.textContent = message;
  errorElement.style.color = 'red';
  errorElement.style.marginTop = '10px';
  errorElement.style.textAlign = 'center';

  // 
  const loginForm = document.getElementById('login-form');
  loginForm.appendChild(errorElement);

  setTimeout(() => {
    errorElement.remove();
  }, 3000);
}
// 在 auth-panel 動態添加登出按鈕
function updateAuthUI() {
  const authPanel = document.getElementById('auth-panel');
  authPanel.innerHTML = currentUser
    ? `<button id="logout">登出 (${users[currentUser].nickname || users[currentUser].username})</button>`
    : `<button id="show-register">註冊</button>
       <button id="show-login">登入</button>`;

  bindStartButton();
  // 重新綁定事件
  if (currentUser) {
    const logoutBtn = document.getElementById('logout');
    logoutBtn.replaceWith(logoutBtn.cloneNode(true)); // 移除所有事件
    const newLogoutBtn = document.getElementById('logout');
    newLogoutBtn.addEventListener('click', logout);

  } else {
    document.getElementById('show-register').addEventListener('click', () => {
      document.getElementById('register-modal').classList.remove('hidden');
      document.getElementById("register-email").value = "";
      document.getElementById("register-username").value = "";
      document.getElementById("register-password").value = "";
      document.getElementById("register-nickname").value = "";
    });
    document.getElementById('show-login').addEventListener('click', () => {
      document.getElementById('login-modal').classList.remove('hidden');
      document.getElementById("login-identifier").value = "";
      document.getElementById("login-password").value = "";
    });

  }
  const gameLauncher = document.getElementById("game-launcher");
  if (gameLauncher) {
    gameLauncher.classList.toggle("hidden", !!currentUser);
  }
}

// 登出函數
function logout() {
  // 清空遊戲畫面，恢復 placeholder
  document.getElementById('game-frame').innerHTML = `
    <div id="game-launcher">
      <button id="start-button">登入後開始遊戲</button>
    </div>
    <div class="placeholder"><p>這裡將嵌入遊戲畫面</p></div>
  `;
  currentUser = null;
  localStorage.removeItem('currentUser');
  destroyGame();
  updateAuthUI();
  alert('已登出！');
}

// 初始化頁面時調用
updateAuthUI();

// 註冊和登入彈窗相關
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

document.addEventListener('DOMContentLoaded', () => {

  const placeholder = document.querySelector('#game-frame .placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  bindStartButton();
});

// 中間登入按鈕
document.getElementById('start-button').addEventListener('click', () => {
  if (!currentUser) {
    alert('請先登入才能開始遊戲');
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById("login-identifier").value = "";
    document.getElementById("login-password").value = "";
    return;
  }

  const startBtn = document.getElementById('start-button');
  if (startBtn) {
    startBtn.disabled = !currentUser; // 登入後啟用，未登入禁用
  }

  // 隱藏啟動按鈕
  document.getElementById('game-launcher').style.display = 'none';

  // 啟動遊戲
  window.startGame();
});

document.getElementById('switch-to-register').addEventListener('click', () => {
  // 關閉登入彈窗
  document.getElementById('login-modal').classList.add('hidden');

  // 清空註冊欄位
  document.getElementById("register-email").value = "";
  document.getElementById("register-username").value = "";
  document.getElementById("register-password").value = "";
  document.getElementById("register-nickname").value = "";

  // 顯示註冊彈窗
  document.getElementById('register-modal').classList.remove('hidden');
});

document.getElementById('switch-to-login').addEventListener('click', () => {
  // 關閉註冊彈窗
  document.getElementById('register-modal').classList.add('hidden');

  // 清空登入欄位
  document.getElementById("login-identifier").value = "";
  document.getElementById("login-password").value = "";

  // 顯示登入彈窗
  document.getElementById('login-modal').classList.remove('hidden');
});

// 重新綁定按鈕
function bindStartButton() {
  console.log('重新綁定 start-button');

  const oldBtn = document.getElementById('start-button');
  if (!oldBtn) return;

  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);

  newBtn.addEventListener('click', () => {
    if (!currentUser) {
      alert('請先登入才能開始遊戲');
      document.getElementById('login-modal').classList.remove('hidden');
      document.getElementById("login-identifier").value = "";
      document.getElementById("login-password").value = "";
      return;
    }

    newBtn.disabled = true;
    document.getElementById('game-launcher').style.display = 'none';
    window.startGame();
  });
}
