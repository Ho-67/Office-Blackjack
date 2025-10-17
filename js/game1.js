const backImg = "../images/cards/Yellow_back.jpg";
function cardImg(card) {
  return `../images/cards/${card}.jpg`;
}

// 建立一副牌
function buildDeck() {
  const deck = [];
  const suits = ["H", "D", "C", "S"];
  const ranks = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  for (let s of suits) {
    for (let r of ranks) {
      deck.push(r + s); // 例如:1H
    }
  }
  return deck;
}

// Fisher-Yates 洗牌（隨機打亂陣列）
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// 遊戲規則
let deck = null; // 本局牌堆
deck = shuffle(buildDeck());

let gameOver = false;
// 爆掉
function bust(cards) {
  return points(cards) > 21;
}
// 點數換算
function points(cards) {
  // 參數cards是字串陣列，例如:[1H]
  let sum = 0;
  let ace = 0; // A的張數
  for (let i = 0; i < cards.length; i++) {
    // 去花色取點數，例如:1
    const rank = cards[i].slice(0, -1); // 從開頭切到倒數第一個（去掉花色）
    // 把每張A都當11點
    if (rank === "1") {
      ace += 1;
      sum += 11;
    } else if (["J", "Q", "K"].includes(rank)) {
      sum += 10;
    } else {
      sum += parseInt(rank); // 字串轉整數再加
    }
  }
  // 把一張A從11改成1，如果還超過就繼續改，直到sum不超過21
  while (sum > 21 && ace > 0) {
    ace -= 1;
    sum -= 10;
  }
  return sum;
}
// 初始化遊戲
function initGame() {
  deck = shuffle(buildDeck());
  playerCards = [];
  dealerCards = [];
  gameOver = false;

  $("#status").text("");
  $("#btn-hit, #btn-stand").prop("disabled", false);
  $("#btn-new").prop("disabled", true);

  for (let i = 0; i < 2; i++) {
    dealCard(true); // 發給玩家
    dealCard(false); // 發給莊家
  }

  showPlayerCards();
  showDealerCards();
  scores();
}

// 更新分數
function scores(showDealer = false) {
  $("#player-score").text(points(playerCards));
  $("#dealer-score").text(showDealer ? points(dealerCards) : "?");
}

// 建立一張牌
// 第一個參數代表牌如:1H，第二個參數是布林值
function buildCard(card, faceUp) {
  const cardDiv = $("<div>").addClass("card");
  const inner = $("<div>").addClass("card-inner");
  if (!faceUp) {
    inner.addClass("card-close");
  }

  const front = $("<div>")
    .addClass("card-front")
    .append($("<img>").attr("src", cardImg(card)));
  const back = $("<div>")
    .addClass("card-back")
    .append($("<img>").attr("src", backImg));

  inner.append(front, back);
  cardDiv.append(inner);
  return cardDiv;
}

// 顯示玩家手牌
let playerCards = []; // 字串陣列，如:[1H]
function showPlayerCards() {
  const container = $("#player-hand").empty(); // 避免重複堆疊舊牌
  // card參數如:1H
  for (let card of playerCards) {
    // 把牌塞到#player-hand裡
    container.append(buildCard(card, true));
  }
}

// 顯示莊家手牌
let dealerCards = [];
function showDealerCards() {
  const container = $("#dealer-hand").empty();
  for (let i = 0; i < dealerCards.length; i++) {
    let faceUp = null;
    if (i === 0) {
      faceUp = true; // 第一張牌：正面朝上
    } else {
      faceUp = false; // 其他牌：背面朝上
    }
    container.append(buildCard(dealerCards[i], faceUp));
  }
}

// 發牌(預設給玩家)
function dealCard(toPlayer = true) {
  if (deck.length === 0) return null;
  const card = deck.pop(); // 移除並回傳陣列最後一個元素（最上面那張牌)
  if (toPlayer) {
    playerCards.push(card);
  } else {
    dealerCards.push(card);
  }
  return card;
}

// 翻開莊家的第二張牌
async function revealCards() {
  await new Promise((r) => setTimeout(r, 400)); // 這裡的 r 是 resolve
  $("#dealer-hand .card-inner").eq(1).removeClass("card-close"); // 翻開莊家手牌中第2張牌（index從0開始）
}

// 控制莊家回合流程
async function dealerTurn() {
  await revealCards();
  scores(true);

  while (points(dealerCards) < 17) {
    const card = dealCard(false);
    const newCard = buildCard(card, false);
    $("#dealer-hand").append(newCard);
    await new Promise((r) => setTimeout(r, 400));
    newCard.find(".card-inner").removeClass("card-close");
    scores(true);
  }

  endGame();
}

// 結束遊戲
function endGame() {
  const p = points(playerCards);
  const d = points(dealerCards);
  let msg = "";

  if (p > 21) {
    msg = "玩家爆牌，莊家勝利！";
  } else if (d > 21) {
    msg = "莊家爆牌，玩家勝利！";
  } else if (p > d) {
    msg = "玩家勝利！";
  } else if (d > p) {
    msg = "莊家勝利！";
  } else {
    msg = "平手！";
  }

  $("#status").text(msg);
  $("#btn-hit, #btn-stand").prop("disabled", true); // 操作元素目前真實狀態的屬性值
  $("#btn-new").prop("disabled", false);
  gameOver = true;
}

// 按鈕
$("#btn-hit").on("click", function () {
  if (gameOver) return;
  dealCard(true);
  showPlayerCards();
  scores(false);

  if (points(playerCards) > 21) {
    endGame();
  }
});

$("#btn-stand").on("click", async function () {
  if (gameOver) return;
  $("#btn-hit, #btn-stand").prop("disabled", true);
  await dealerTurn();
});

$("#btn-new").on("click", function () {
  initGame();
});

initGame();
