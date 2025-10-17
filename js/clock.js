function clock() {
  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  $("#hour").css("transform", `rotate(${h * 30 + 90}deg)`);
  $("#minute").css("transform", `rotate(${m * 6 + 90}deg)`);
  $("#second").css("transform", `rotate(${s * 6 + 90}deg)`);
}

setInterval(clock, 1000);
clock();
