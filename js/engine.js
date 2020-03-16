

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");

  var board;
  var arrow;
  var player_pos;

  var current_player = 0;

  var mode;
  var comp_color;
  var custom_start;

  var won;
  var started = false;


  function set_color() {
    document.getElementById('board').style.backgroundColor = '#c7f9fc'; // document.getElementById('color').value;
  }

  function start_game() {
    started = true;
    var start = document.getElementById('start');
    start.innerHTML='Restart';
    start.classList.remove('btn-success');
    start.classList.add('btn-danger');
    mode = document.querySelector('input[name="mode"]:checked').value;
    comp_color = document.querySelector('input[name="comp_color"]:checked').value;
    diff = document.querySelector('input[name="diff"]:checked').value;
    custom_start = document.getElementById('custom_start').checked;
    clean_board();
    if (custom_start) {
      document.getElementById("console").innerHTML = ">>> select white position";
    } else {
      board[3] = 2;
      board[60] = 3;
      player_pos = [3, 60];
      if ((mode == "computer") && (comp_color == "white")) {
        var move = get_comp_move();
        if (move == -1) {
          console.log("get_comp_move() returns invalid -1");
        }
        move_to(move);
      }
    }
    update_board();
    toggle_music();
  }

  var loc = -1;
  function set_loc() {
    var rect = canvas.getBoundingClientRect()
    var USER_X = event.clientX - rect.left;
    var USER_Y = event.clientY - rect.top;
    var row = (USER_Y - (USER_Y % 100)) / 100;
    var col = (USER_X - (USER_X % 100)) / 100;
    loc = row * 8 + col;
    console.log("loc = ", loc);
  }

  function clean_board() {
    board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    arrow = []; // tail p, head p, slope, tail r, tail c, head r, head c
    player_pos = [];
    current_player = 0;
    won = false;
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

  function get_possible_moves() {
    var possible_moves = [];
    for (p in board) {
      if (this.can_move_to(p)) {
        possible_moves.push(Number(p));
      }
    }
    return possible_moves;
  }

  function get_comp_move() {
    possible_moves = get_possible_moves();
    var out = -1;
    if (possible_moves.length == 0) {
      return -1;
    }
    if (diff == 0) {
      return possible_moves[0];
    }
    if (diff == 1) {
      return possible_moves[Math.floor(Math.random() * possible_moves.length)];
    }
    if (diff == 2) {
      return min_opp_mobility(board, arrow, player_pos, current_player);
    }
    if (diff == 3) {
      return min_opp_and_max_play_mobility(board, arrow, player_pos, current_player);
    }
    if (diff == 4) {
      return chaser(board, arrow, player_pos, current_player);
    }
  }



  function update_board() {
    if (started) {
      console.log("update_board()");
      ctx.clearRect(0, 0, 800, 800);

      // add the grid lines
      ctx.fillStyle = "lightgrey";
      for (var i = 1; i < 8; i++) {
        ctx.fillRect(0, i * 100, 800, 2);
        ctx.fillRect(i * 100, 0, 2, 800);
      }

      // add markers
      for (p in board) {
          var mark = board[p];

          ctx.fillStyle = "lightgrey";
          var x = 100 * (p % 8);
          var y = 100 * Math.floor(p / 8);

          // block piece
          if (mark == 1) {
            ctx.fillRect(x, y, 100, 100);
          }

          // suggestion squares
          if (document.getElementById('show_suggestions').checked) {
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
        }

      // add numbers
      if (document.getElementById('numbered').checked) {
        ctx.font = "19px Arial";
        ctx.fillStyle = "darkgrey";
        for (p in board) {
          var x = 100 * (p % 8) + 3;
          var y = 100 * Math.floor(p / 8) + 97;
          ctx.fillText(p, x, y);
        }
      }

      // add labels
      if (document.getElementById('labeled').checked) {
        ctx.font = "19px Arial";
        ctx.fillStyle = "darkgrey";
        for (p in board) {
          var x = 100 * (p % 8) + 77;
          var y = 100 * Math.floor(p / 8) + 18;
          ctx.fillText(["a","b","c","d","e","f","g","h"][p % 8] + Math.floor(1 + p / 8), x, y);
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

      // queen pieces
      for (i in player_pos) {
        var p = player_pos[i];
        var x = 100 * (p % 8) + 10;
        var y = 100 * Math.floor(p / 8) + 10;
        var color = {0:"white", 1:"black"}[i];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + 40, y + 40, 40, 0, 2 * Math.PI, false);
        ctx.fill();

        if (!won && p == player_pos[current_player] && player_pos.length == 2){
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(x + 40, y + 40, 10, 0, 2 * Math.PI, false);
          ctx.fill();
        }
      }

      // crown
      if (won) {
        var crown = new Image();
        crown.onload = function() {
          var p = player_pos[1 - current_player];
          var x = 100 * (p % 8) + 20;
          var y = 100 * Math.floor(p / 8) + 20;
          ctx.drawImage(crown, x, y, 60, 60);
        };
        crown.src = "img/crown.png";
      }


      // if (won) {
      //   // Create gradient
      //   var grd = ctx.createRadialGradient(400,400,0,400,400,800);
      //   grd.addColorStop(0,{0:"white", 1:"black"}[current_player]);
      //   grd.addColorStop(1,"transparent");
      //
      //   // Fill with gradient
      //   ctx.fillStyle = grd;
      //   ctx.fillRect(0,0,800,800);
      //
      //   var winning_img = new Image();
      //
      //   winning_img.onload = function() {
      //     ctx.drawImage(winning_img, 100, 100, 600, 600);
      //   };
      //   winning_img.src = {0:"img/white_wins.png", 1:"img/black_wins.png"}[1 - current_player];
      // }

    }
  }




  function move_to(p) {
    // add block piece
    board[player_pos[current_player]] = 1;

    // update arrow
    arrowize(player_pos[current_player], p);

    // move current player
    board[p] = current_player + 2;
    player_pos[current_player] = p;

    // switch player
    current_player = 1 - current_player;

    if (is_on_arrow(player_pos[0]) && is_on_arrow(player_pos[1])) {
      arrow = [];
    }

    document.getElementById("console").innerHTML = ">>> " + {0:"white", 1:"black"}[current_player] + " move";
    if (get_possible_moves().length == 0) { // game is over
      document.getElementById("console").innerHTML =  ">>> " + {0:"White", 1:"Black"}[1 - current_player] + " wins!";
      won = true;
    }

  }


  function comp_move() {
    var move = get_comp_move();

    console.log("comp move:", move);

    if (move == undefined) {
      console.error("get_comp_move() returns invalid undefined");
    }
    if (move == -1) {
      console.error("get_comp_move() returns invalid -1");
    }
    if (move == player_pos[current_player]) {
      console.error("get_comp_move() returns invalid, opponent position");
    }
    move_to(move);
  }


  function game_step() {
    if (!won) {

      // no pieces are placed, so place white
      if (custom_start && player_pos.length == 0) {
        board[loc] = 2;
        player_pos.push(loc);
        document.getElementById("console").innerHTML = ">>> select black position";
      }

      // only white is on the board, so place black
      else if (custom_start && player_pos.length == 1 && loc != player_pos[0]) {
        board[loc] = 3;
        player_pos.push(loc);
        document.getElementById("console").innerHTML = ">>> white move";
        if ((mode == "computer") && (comp_color == "white")) {
          comp_move();
        }
      }

      // both pieces are placed
      else if (player_pos.length == 2) {
        if (can_move_to(loc)) {
          move_to(loc);
          if (mode == "computer" && !won) {
            comp_move();
          }
        }
      }

      update_board();

    }
  }
