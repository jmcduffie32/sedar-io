
const WHITE = 0;
const BLACK = 1;


class State {
  
  constructor(board, arrow, player_pos, current_player) {
    /**
      board - 1D representation of the bord ()
      arrow = JS object
        {
          tail: {r: #, c: #, p: #},
          head: {r: #, c: #, p: #},
          slope: #
        }
      player_pos - two element array of player board positions indexed by  0 (WHITE) or 1 (BLACK)
      current player - 0 (WHITE) or 1 (BLACK)
    **/

    this.board = [...board];
    this.arrow = JSON.parse(JSON.stringify(arrow));
    this.player_pos = [...player_pos];
    this.current_player = current_player;
  }

  arrowize(p1,p2) {
    var arrow = {
      tail: {r: Math.floor(p1/8), c: p1 % 8},
      head: {r: Math.floor(p2/8), c: p2 % 8},
    };

    // make sure that the tail is to the left (switch head and tail if not)
    if (arrow.tail.c > arrow.head.c) {
      arrow = {
        tail: arrow.head,
        head: arrow.tail,
      }
    }

    if (arrow.tail.c == arrow.head.c) { // vertical
      arrow.tail.r = 0;
      arrow.head.r = 7;
      arrow.slope = Infinity;
    }
    else if (arrow.tail.r == arrow.head.r) { // horizontal
      arrow.tail.c = 0;
      arrow.head.c = 7;
      arrow.slope = 0;
    }
    else {
      arrow.slope = arrow.tail.r < arrow.head.r ? -1 : 1;

      // find edge for tail
      while (arrow.tail.c > 0 && arrow.tail.r > 0 && arrow.tail.r < 7) {
        arrow.tail.c--;
        arrow.tail.r += arrow.slope;
      }

      // find edge for head
      while (arrow.head.c < 7 && arrow.head.r > 0 && arrow.head.r < 7) {
        arrow.head.c++;
        arrow.head.r -= arrow.slope;
      }
    }

    arrow.tail.p = arrow.tail.r * 8 + arrow.tail.c;
    arrow.head.p = arrow.head.r * 8 + arrow.head.c;

    this.arrow = arrow;
  }

  is_on_arrow(p) {
    if (JSON.stringify(this.arrow) == '{}') {
      return false;
    }
    var x1 = this.arrow.tail.c;
    var y1 = -1 * this.arrow.tail.r;
    var x2 = this.arrow.head.c;
    var y2 = -1 * this.arrow.head.r;
    var r = -1 * Math.floor(p / 8);
    var c = p % 8;

    return (r - y1) * (x2 - x1) == (y2 - y1) * (c - x1);
  }

  can_move_to(p) {
    // occupied
    if (this.board[p] != 0) {
      return false;
    }


    var r1 = Math.floor(this.player_pos[this.current_player] / 8);
    var c1 = this.player_pos[this.current_player] % 8;
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
      if (this.board[start_r * 8 + start_c] != 0) {
        return false;
      }
    }




    // queen's move
    if ((Math.abs(r1 - r2) != Math.abs(c1 - c2) || Math.abs(c1 - c2) == 0) && Math.abs(c1 - c2) != 0 && Math.abs(r1 - r2) != 0) {
      return false;
    }


    // same side as arrow
    if (!this.is_on_same_side_of_arrow(this.player_pos[this.current_player], p)) {
      return false;
    }

    // everything passes
    return true;
  }

  get_possible_moves() {
    var possible_moves = [];
    for (var p in this.board) {
      if (this.can_move_to(Number(p))) {
        possible_moves.push(Number(p));
      }
    }
    return possible_moves;
  }

  is_on_same_side_of_arrow(p1, p2) {
    if (JSON.stringify(this.arrow) == '{}') {
      return true;
    }

    // arrow is vertical
    if (this.arrow.slope == Infinity) {
      if (((p1 % 8) < this.arrow.tail.c && (p2 % 8) < this.arrow.tail.r) || ((p1 % 8) > this.arrow.tail.c && (p2 % 8) > this.arrow.tail.c))
        return true;
      else
        return false;
    }

    // arrow is slanted
    else {
      var row_on_arrow_in_col_of_p1 = this.arrow.tail.c + this.arrow.slope * (this.arrow.tail.c - (p1 % 8));
      var row_on_arrow_in_col_of_p2 = this.arrow.tail.r + this.arrow.slope * (this.arrow.tail.c - (p2 % 8));
      if (Math.floor(p1 / 8) > row_on_arrow_in_col_of_p1 && Math.floor(p2 / 8) > row_on_arrow_in_col_of_p2)
        return true;
      if (Math.floor(p1 / 8) < row_on_arrow_in_col_of_p1 && Math.floor(p2 / 8) < row_on_arrow_in_col_of_p2)
        return true;
      return false;
    }
  }

  move_to(p) {
    // add block piece
    this.board[this.player_pos[this.current_player]] = 1;

    // update arrow
    this.arrowize(this.player_pos[this.current_player], p);

    // move current player
    this.board[p] = this.current_player + 2;
    this.player_pos[this.current_player] = p;

    // switch player
    this.current_player = 1 - this.current_player;

    if (this.is_on_arrow(this.player_pos[0]) && this.is_on_arrow(this.player_pos[1])) {
      this.arrow = {};
    }
  }

  clone() {
    return new State([...this.board], JSON.parse(JSON.stringify(arrow)), [...this.player_pos], this.current_player);
  }

  expand() {
    var children = [];
    var possible_moves = this.get_possible_moves();
    for (var i in possible_moves) {
      var move = possible_moves[i];
      var child = this.clone();
      child.move_to(move);
      children.push(child);
    }
    return children;
  }

}






function first_possible_move(board, arrow, player_pos, current_player) {
  var game_state = new State(board, arrow, player_pos, current_player);
  var possible_moves = game_state.get_possible_moves();
  return possible_moves[0];
}
first_possible_move.description = "a player that makes the first possible move in row-col order";


function random_play(board, arrow, player_pos, current_player) {
  var game_state = new State(board, arrow, player_pos, current_player);
  var possible_moves = game_state.get_possible_moves();
  return possible_moves[Math.floor(Math.random() * possible_moves.length)];
}
random_play.description = "a player that plays randomly";


function min_opp_mobility(board, arrow, player_pos, current_player) {
  var game_state = new State(board, arrow, player_pos, current_player);
  var val = Infinity;
  var best_child = null;
  var children = game_state.expand();
  for (var i in children) {
    var child = children[i];
    var opponent_moves = child.get_possible_moves();
    var opponent_move_count = opponent_moves.length; // how many moves the other player will have
    if (opponent_move_count == 0) {
      return child.player_pos[1 - child.current_player]; // return since it is a winning move
    }
    if (opponent_move_count < val) { // if this is better than old move, then update
      val = opponent_move_count;
      best_child = child;
    }
  }
  return best_child.player_pos[1 - best_child.current_player];
}
min_opp_mobility.description = "a player that makes moves only based off of restricting the mobility of the opponent on their next turn.";


function max_play_mobility(board, arrow, player_pos, current_player) {
  var game_state = new State(board, arrow, player_pos, current_player);
  var val = 0;
  var best_child = null;
  var children = game_state.expand();
  for (var i in children) {
    var child = children[i];
    var opponent_moves = child.get_possible_moves();
    var opponent_move_count = opponent_moves.length; // how many moves the other player will have
    if (opponent_move_count == 0) { // opponent has no moves
      return child.player_pos[1 - child.current_player]; // return since it is a winning move
    } else { // opponent has moves to make
      opponents_moves_children = child.expand();
      for (var j in opponents_moves_children) {
        var opp_child = opponents_moves_children[j];
        var player_move_count = opp_child.get_possible_moves().length; // how many moves you have
        if (player_move_count >= val) {
          val = player_move_count;
          best_child = child;
        }
      }
    }
  }
  return best_child.player_pos[1 - best_child.current_player];
}
max_play_mobility.description = "a player that makes move based off maximizing the player's mobility after this move.";


function chaser(board, arrow, player_pos, current_player) {
  var game_state = new State(board, arrow, player_pos, current_player);
  var val = Infinity;
  var best_child = null;
  var children = game_state.expand();
  for (var i in children) {
    var child = children[i];

    // check if you have a winning move
    var opponent_moves = child.get_possible_moves();
    var opponent_move_count = opponent_moves.length; // how many moves the other player will have
    if (opponent_move_count == 0) {
      return child.player_pos[1 - child.current_player];
    }

    // check the distance between you and the opponent
    var opp_pos = child.player_pos[child.current_player];
    var opp_r = Math.floor(opp_pos / 8);
    var opp_c = opp_pos % 8;
    var play_pos = child.player_pos[1 - child.current_player];
    var play_r = Math.floor(play_pos / 8);
    var play_c = play_pos % 8;

    var distance = Math.sqrt(Math.pow((opp_r - play_r), 2) + Math.pow((opp_c - play_c), 2));

    if (distance < val) { // if this is closer than old move, then update
      val = distance;
      best_child = child;
    }
  }
  return best_child.player_pos[1 - best_child.current_player];
}
chaser.description = "a player that makes the move that gets it the closest to the other player's position";


function min_opp_and_max_play_mobility(board, arrow, player_pos, current_player) {
  var game_state = new State(board, arrow, player_pos, current_player);
  var val = Infinity;
  var best_child = null;
  var children = game_state.expand();
  for (var i in children) {
    var child = children[i];
    var opponent_moves = child.get_possible_moves();
    var opponent_move_count = opponent_moves.length; // how many moves the other player will have
    if (opponent_move_count == 0) {
      return child.player_pos[1 - child.current_player]; // return since it is a winning move
    }
    child.move_to(child.player_pos[child.current_player]); // have the opponent stay where they are
    var player_move_count = -1 * child.get_possible_moves().length; // how many moves you have * -1
    var count = opponent_move_count + player_move_count;
    if (count < val) { // if this is better than old move, then update
      val = count;
      best_child = child;
    }
  }
  return best_child.player_pos[best_child.current_player];
}
min_opp_and_max_play_mobility.description = "a player that makes move based off of restructing the mobility of the opponent on their next turn and maximizing the player's mobility after this move.";


// add more here!
// don't forget to add the function to the list below







var all_AI_list = [
  first_possible_move,
  random_play,
  min_opp_mobility,
  max_play_mobility,
  chaser,
  min_opp_and_max_play_mobility,
];




















function print(string) {
  document.getElementById('run').innerHTML += string + "<br>>>> "; console.log(string);
}



var empty_board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];



function play_game(white_func, black_func, white_start, black_start) {
 var game_state = new State(empty_board, {}, [white_start, black_start], 0);
 game_state.board[white_start] = 2;
 game_state.board[black_start] = 3;
 while (game_state.get_possible_moves().length != 0) { // while game is not over
   if (game_state.current_player == 0) {
     var move = white_func(game_state.board, game_state.arrow, game_state.player_pos, game_state.current_player);
   } else {
     var move = black_func(game_state.board, game_state.arrow, game_state.player_pos, game_state.current_player);
   }
   game_state.move_to(move);
 }
 return 1 - game_state.current_player;
}






function fight() {
  document.getElementById('fight').innerHTML = ">>> loading...";
  var white_func = eval(document.querySelector('input[name="white"]:checked').value);
  var black_func = eval(document.querySelector('input[name="black"]:checked').value);

  var num_games = document.getElementById('numGames').value;
  var white_start = document.getElementById('white_start').value;
  var black_start = document.getElementById('black_start').value;

  var num_white_wins = 0;
  for (var i = 0; i < num_games; i++) {
   num_white_wins += play_game(white_func, black_func, white_start, black_start) == 0 ? 1 : 0;
  }

  document.getElementById('fight').innerHTML =
    "White (" + white_func.name + ") wins: " + num_white_wins
      + " (" + (num_white_wins * 100 / num_games) + "%)<br>" +
    "Black (" + black_func.name + ") wins: " + (num_games - num_white_wins)
      + " (" + ((num_games - num_white_wins) * 100 / num_games) + "%)" ;
}























// Grave yard:



/**
  experimental and VERY SLOW => do not use
**/
// function monte_carlo(board, arrow, player_pos, current_player) {
//   var game_state = new State(board, arrow, player_pos, current_player);
//   var val = -Infinity;
//   var best_child = null;
//   var children = game_state.expand();
//   for (var i in children) {
//     var child = children[i];
//     var white_pos = child.board.indexOf(WHITE);
//     var black_pos = child.board.indexOf(BLACK);
//     var num_wins = 0;
//     for (var j = 0; j < 100; j++) {
//       if (play_game(random_play, random_play, white_pos, black_pos) == current_player) {
//         num_wins += 1;
//       }
//     }
//     if (num_wins >= val) {
//       best_child = child;
//     }
//   }
//   return best_child.player_pos[1 - best_child.current_player];
// }


//
// function run() {
//
//  // search for best coefficients on strategies against random_play()
//  var best_alpha = 0;
//  var best_win_rate = 0;
//
//  var alpha = 0;
//  var DIFF = 0.1;
//
//  while (alpha < 1) { // iterate through values for alpha
//    print("alpha = " + alpha);
//    var win_rate = 0;
//    for (i in [...Array(300)]) { // play 300 games per alpha setting
//      player_1_func = Math.random() <= alpha ? min_opp_and_max_play_mobility: chaser;
//      if (play_game(player_1_func, random_play, 3, 60) == 0) { // if white win
//        win_rate++;
//      }
//    }
//    print("win_rate = " + (win_rate / 300));
//    if (win_rate > best_win_rate) {
//      best_win_rate = win_rate;
//      best_alpha = alpha;
//    }
//    alpha += DIFF;
//  }
//
//
//  print("best_alpha = " + best_alpha);
//
//
//
//
// }

// <!-- <div class="panel panel-default">
//   <div class="panel-heading">
//     <div class="row">
//       <div class="col-md-6">
//         <button type="button" class="btn btn-primary" onclick="run();">run()</button>
//       </div>
//       <div class="col-md-6 text-right">
//         <button type="button" class="btn btn-danger right-block" onclick="document.getElementById('run').innerHTML='>>> ';">Clear</button>
//       </div>
//     </div>
//   </div>
//   <div class="panel-body console-out">
//     <p id="run">>>> </p>
//   </div>
// </div> -->
