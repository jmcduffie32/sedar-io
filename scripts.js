
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var arrow = [];
var player_pos = [];
var current_player = 0;

function clean_board() {
  board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  arrow = []; // tail p, head p, slope, tail r, tail c, head r, head c
  player_pos = [];
  current_player = 0;
}

function arrowize(p1,p2) {
  var arrow_tail_r = Math.floor(p1/8);
  var arrow_tail_c = p1 % 8;
  var arrow_head_r = Math.floor(p2/8);
  var arrow_head_c = p2 % 8;
  var slope = Infinity;

  // make sure that the tail is to the left
  if (arrow_tail_c > arrow_head_c) {
    temp_tail_r = arrow_tail_r;
    temp_tail_c = arrow_tail_c;
    arrow_tail_r = arrow_head_r;
    arrow_tail_c = arrow_head_c;
    arrow_head_r = temp_tail_r;
    arrow_head_c = temp_tail_c;
  }

  if (arrow_tail_c == arrow_head_c) { // vertical
    arrow_tail_r = 0;
    arrow_head_r = 7;
  }
  else if (arrow_tail_r == arrow_head_r) { // horizontal
    slope = 0;
    arrow_tail_c = 0;
    arrow_head_c = 7;
  }
  else {
    slope = arrow_tail_r < arrow_head_r ? -1 : 1;

    // find edge for tail
    while (arrow_tail_c > 0 && arrow_tail_r > 0 && arrow_tail_r < 7) {
      arrow_tail_c--;
      arrow_tail_r += slope;
    }

    // find edge for head
    while (arrow_head_c < 7 && arrow_head_r > 0 && arrow_head_r < 7) {
      arrow_head_c++;
      arrow_head_r -= slope;
    }
  }
  arrow = [arrow_tail_r * 8 + arrow_tail_c, arrow_head_r * 8 + arrow_head_c, slope, arrow_tail_r, arrow_tail_c, arrow_head_r, arrow_head_c];
}

function is_on_arrow(p) {
  if (arrow == []) {
    return false;
  }
  var x1 = arrow[4];
  var y1 = -1 * arrow[3];
  var x2 = arrow[6];
  var y2 = -1 * arrow[5];
  var r = -1 * Math.floor(p / 8);
  var c = p % 8;

  return (r - y1) * (x2 - x1) == (y2 - y1) * (c - x1);
}

function is_on_same_side_of_arrow(p1, p2) {
  if (arrow.length == 0) {
    return true;
  }

  // arrow is vertical
	if (arrow[2] == Infinity) {
		if (((p1 % 8) < arrow[4] && (p2 % 8) < arrow[4]) || ((p1 % 8) > arrow[4] && (p2 % 8) > arrow[4]))
			return true;
		else
			return false;
	}

	// arrow is slanted
	else {
		var row_on_arrow_in_col_of_p1 = arrow[3] + arrow[2] * (arrow[4] - (p1 % 8));
		var row_on_arrow_in_col_of_p2 = arrow[3] + arrow[2] * (arrow[4] - (p2 % 8));
		if (Math.floor(p1 / 8) > row_on_arrow_in_col_of_p1 && Math.floor(p2 / 8) > row_on_arrow_in_col_of_p2)
			return true;
		if (Math.floor(p1 / 8) < row_on_arrow_in_col_of_p1 && Math.floor(p2 / 8) < row_on_arrow_in_col_of_p2)
			return true;
		return false;
	}
}

function can_move_to(p) {

  // occupied
  if (board[p] != 0) {
    return false;
  }

  var r1 = Math.floor(player_pos[current_player] / 8);
  var c1 = player_pos[current_player] % 8;
  var r2 = Math.floor(p / 8);
  var c2 = p % 8;


  // blocked
  var start_r = r1;
  var start_c = c1;
  var r_dir = r1 == r2 ? 0 : (r2 - r1) / Math.abs(r2 - r1);
  var c_dir = c1 == c2 ? 0 : (c2 - c1) / Math.abs(c2 - c1);
  while (start_r != r2 || start_c != c2) {
    start_r += r_dir;
    start_c += c_dir;
    if (board[start_r * 8 + start_c] != 0) {
      return false;
    }
  }

  // queen's move
  if ((Math.abs(r1 - r2) != Math.abs(c1 - c2) || Math.abs(c1 - c2) == 0) && Math.abs(c1 - c2) != 0 && Math.abs(r1 - r2) != 0) {
    return false;
  }

  // same side as arrow
  if (!is_on_same_side_of_arrow(player_pos[current_player], p)) {
    return false;
  }

  // everything passes
  return true;
}

function update_board() {
  ctx.clearRect(0, 0, 800, 800);

  // add the grid lines
  ctx.fillStyle = "lightgrey";
  for (var i = 1; i < 8; i++) {
    ctx.fillRect(0, i * 100, 800, 2);
    ctx.fillRect(i * 100, 0, 2, 800);
  }

  // add square markers
  for (p in board) {
    var mark = board[p];

    var size = {1:100, 2:80, 3:80}[mark];
    var color = {1:"lightgrey", 2:"white", 3:"black"}[mark];
    ctx.fillStyle = color;
    var x = 100 * (p % 8) + ((100 - size) / 2);
    var y = 100 * Math.floor(p / 8) + ((100 - size) / 2);

    // block piece
    if (mark == 1) {
      ctx.fillRect(x, y, size, size);
    }
    // queen piece
    if (mark > 1) {
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI, false);
      ctx.fill();
      if (p == player_pos[current_player] && player_pos.length == 2){
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, 10, 0, 2 * Math.PI, false);
        ctx.fill();
        // ctx.fillRect(x+30, y+30, 20, 20);
      }
    }
    // suggestions
    if (player_pos.length == 2) {
      if (can_move_to(p)) {
        var x = 100 * (p % 8) + 40;
        var y = 100 * Math.floor(p / 8) + 40;
        ctx.fillStyle = "lightgreen";
        ctx.fillRect(x, y, 20, 20);
      }
    }
  }


  // draw arrow // TODO: make this less messy
  if (arrow != []) {

    var arrow_tail_r = Math.floor(arrow[0]/8);
    var arrow_tail_c = arrow[0] % 8;
    var arrow_head_r = Math.floor(arrow[1]/8);
    var arrow_head_c = arrow[1] % 8;

    var arrow_tail_x = 0;
    var arrow_tail_y = 0;
    var arrow_head_x = 800;
    var arrow_head_y = 800;

    if (arrow_tail_c == arrow_head_c) { // vertical
      arrow_tail_x = 50 + arrow_tail_c * 100;
      arrow_head_x = 50 + arrow_tail_c * 100;
    }
    else if (arrow_tail_r == arrow_head_r) { // horizontal
      arrow_tail_y = 50 + arrow_tail_r * 100;
      arrow_head_y = 50 + arrow_tail_r * 100;
    }
    else {
      var slope = arrow_tail_r < arrow_head_r ? -1 : 1;
      arrow_tail_x = arrow_tail_c * 100;
      arrow_tail_y = arrow_tail_r * 100 + 50 + (slope * 50);
      arrow_head_x = arrow_head_c * 100 + 100;
      arrow_head_y = arrow_head_r * 100 + 50 - (slope * 50);
    }

    ctx.beginPath();
    ctx.moveTo(arrow_tail_x, arrow_tail_y);
    ctx.lineTo(arrow_head_x, arrow_head_y);
    ctx.stroke();
  }
}

function game_is_over() {
  for (p in board) {
    if (can_move_to(p))
      return false;
  }
  return true;
}


function start_game() {
  clean_board();
  update_board();
  document.getElementById("console").innerHTML = ">>> select white position";
  var piece = 2;
  handler = function(e) {
    var rect = canvas.getBoundingClientRect()
    var USER_X = event.clientX - rect.left;
    var USER_Y = event.clientY - rect.top;
    var row = (USER_Y - (USER_Y % 100)) / 100;
    var col = (USER_X - (USER_X % 100)) / 100;
    if (player_pos[0] != row * 8 + col) {
      board[row * 8 + col] = piece;
      player_pos[piece - 2] = row * 8 + col;
      piece++;
      document.getElementById("console").innerHTML = ">>> select black position";
      update_board();
      if (piece == 4) {
        document.getElementById("console").innerHTML = ">>> white move";
        canvas.removeEventListener('click', handler);
      }
    }
  };
  canvas.addEventListener("click", handler);

  var ended = false;
  // game play
  canvas.addEventListener("click", function(e) {
    var rect = canvas.getBoundingClientRect()
    var USER_X = event.clientX - rect.left;
    var USER_Y = event.clientY - rect.top;
    var row = (USER_Y - (USER_Y % 100)) / 100;
    var col = (USER_X - (USER_X % 100)) / 100;

    if (can_move_to(row * 8 + col)) {
      // add block piece
      board[player_pos[current_player]] = 1;

      // update arrow
      arrowize(player_pos[current_player], row * 8 + col);

      // move current player
      board[row * 8 + col] = current_player + 2;
      player_pos[current_player] = row * 8 + col;


      if (is_on_arrow(player_pos[0]) && is_on_arrow(player_pos[1])) {
        arrow = [];
      }

      // change player
      current_player = 1 - current_player;
      document.getElementById("console").innerHTML = ">>> " + {0:"white", 1:"black"}[current_player] + " move";

      update_board();

    }
    if (game_is_over()) {
      document.getElementById("console").innerHTML =  ">>> " + {0:"White", 1:"Black"}[1 - current_player] + " wins!<br>click board to restart";
      if (ended) {
        start_game();
      }
      ended = true;
    }


  });

  }
