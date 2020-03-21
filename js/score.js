function up_1() {
  var curr = Number(document.getElementById("1-score").innerHTML);
  document.getElementById("1-score").innerHTML = curr + 1;
}
function up_2() {
  var curr = Number(document.getElementById("2-score").innerHTML);
  document.getElementById("2-score").innerHTML = curr + 1;
}
function down_1() {
  var curr = Number(document.getElementById("1-score").innerHTML);
  document.getElementById("1-score").innerHTML =  curr > 0 ? curr - 1 : curr;
}
function down_2() {
  var curr = Number(document.getElementById("2-score").innerHTML);
  document.getElementById("2-score").innerHTML =  curr > 0 ? curr - 1 : curr;
}
function reset_scores() {
  document.getElementById("1-score").innerHTML =  0;
  document.getElementById("2-score").innerHTML =  0;
}
