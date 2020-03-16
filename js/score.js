function up_white() {
  var curr = Number(document.getElementById("white-score").innerHTML);
  document.getElementById("white-score").innerHTML = curr + 1;
}
function up_black() {
  var curr = Number(document.getElementById("black-score").innerHTML);
  document.getElementById("black-score").innerHTML = curr + 1;
}
function down_white() {
  var curr = Number(document.getElementById("white-score").innerHTML);
  document.getElementById("white-score").innerHTML =  curr > 0 ? curr - 1 : curr;
}
function down_black() {
  var curr = Number(document.getElementById("black-score").innerHTML);
  document.getElementById("black-score").innerHTML =  curr > 0 ? curr - 1 : curr;
}
