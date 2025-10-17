let canHitBoss = false; // 是否啟用打Boss模式
let gameStarted = false;
const GAME_TIME = 10;
let score = 0;
let timeLeft = 0;
let timer = 0;

const highscore = {
  name: "none",
  score: 0,
};

// 讀取本地最高分
if (localStorage.apple) {
  const data = JSON.parse(localStorage.apple);
  highscore.name = data.name;
  highscore.score = data.score;
  $("#text-highscore-name").text(highscore.name);
  $("#text-highscore-score").text(highscore.score);
}

// 點擊 .weapon 開關（只能在未遊戲中切換）
$(".weapon").on("click", function () {
  if (gameStarted === true) return; // 倒數中禁止切換

  canHitBoss = !canHitBoss;

  if (canHitBoss) {
    $(this).addClass("active").css("cursor", "pointer");
    $("#btn-start").addClass("enabled");
    $("#boss-face").css("cursor", "url(./images/cursor_black.png) 50 50, auto");
    $(".annotation").show();
  } else {
    $(this).removeClass("active").css("cursor", "default");
    $("#btn-start").removeClass("enabled");
    $("#boss-face").css("cursor", "default");
    $("#text-time").text("10");
    $(".annotation").hide();
  }
});

// 點擊開始遊戲（僅在開啟打Boss模式下能點）
$("#btn-start").on("click", function () {
  if (canHitBoss === false || gameStarted === true) return;

  $(this).attr("disabled", true); // 停用按鈕
  score = 0;
  timeLeft = GAME_TIME;
  gameStarted = true;

  $("#text-score").text(score);
  $(".text").addClass("blinking");

  const _this = this;

  timer = setInterval(() => {
    timeLeft--;
    $("#text-time").text(timeLeft);

    // 時間到
    if (timeLeft === 0) {
      clearInterval(timer);
      gameStarted = false;
      $(".text").removeClass("blinking");
      $(_this).attr("disabled", false); // 啟用按鈕

      // 如果破紀錄
      if (score > highscore.score) {
        Swal.fire({
          title: "最高分",
          text: "請輸入名字",
          input: "text",
          confirmButtonText: "儲存",
          inputPlaceholder: "你的暱稱",
          showCloseButton: true,
          allowOutsideClick: false,
        }).then((result) => {
          const name = result.value || "本來上班就煩";
          highscore.name = name;
          highscore.score = score;
          $("#text-highscore-name").text(name);
          $("#text-highscore-score").text(score);
          localStorage.apple = JSON.stringify(highscore);
        });
      }
    }
  }, 1000);
});

$("#boss-face").on("click", function (el) {
  if (canHitBoss === false || gameStarted === false) return;

  const boss = $(this);
  // .offset() 返回的座標都是元素在整個頁面中的固定位置，滾動頁面時返回值會改變
  // 獲取或設定元素相對於 整個文檔（document） 左上角的絕對位置，返回或接受的值是像素單位的 top 和 left
  const offset = boss.offset();
  // 順序一定是「滑鼠位置 - 元素位置」
  // 點擊時滑鼠在整個頁面上的 X 座標 - 點擊的位置在 Boss 元素內部的水平位置
  const clickX = el.pageX - offset.left;
  // 點擊時滑鼠在整個頁面上的 Y 座標 - 點擊的位置在 Boss 元素內部的垂直位置
  const clickY = el.pageY - offset.top;

  // 建立血跡 div
  const blood = $('<div class="blood"></div>').css({
    position: "absolute",
    top: clickY - 30 + "px", // 偏移中心（血圖大小 60px）
    left: clickX - 30 + "px",
    width: "60px",
    height: "60px",
    backgroundImage: "url('./images/blood.png')",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    opacity: 0, // 起始透明
    pointerEvents: "none", // 不影響點擊
  });

  // 插入到 boss-face 裡
  boss.append(blood);

  // 加上漸變 class
  setTimeout(() => {
    blood.css("opacity", 1); // 淡入
    setTimeout(() => {
      blood.css("opacity", 0); // 淡出
    }, 600); // 中間停留時間
  }, 30);

  // 0.7秒後移除
  setTimeout(() => {
    blood.remove();
  }, 700);

  // 加分
  score++;
  $("#text-score").text(score);
});
