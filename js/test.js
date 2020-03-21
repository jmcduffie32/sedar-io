function print(string) { document.getElementById('o').innerHTML += string + "<br>>>> "; console.log(string)}



var empty_board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];



function play_game(player_1_func, player_2_func) {
  var game_state = new state(empty_board, [], [3, 60], 0);
  game_state.board[3] = 2;
  game_state.board[60] = 3;
  while (game_state.get_possible_moves().length != 0) { // while game is not over
    if (game_state.current_player == 0) {
      var move = player_1_func(game_state.board, game_state.arrow, game_state.player_pos, game_state.current_player);
    } else {
      var move = player_2_func(game_state.board, game_state.arrow, game_state.player_pos, game_state.current_player);
    }
    game_state.move_to(move);
  }
  return 1 - game_state.current_player;
}


// // // // // // // // // // // // // // // // // // // // // // // // // // //
// // // // // // // // // // // // // // // // // // // // // // // // // // //
// // // // // // // // // // // // // // // // // // // // // // // // // // //


function run() {
  // var game_state = new state(empty_board, [], [3, 60], 0);
  // game_state.board[3] = 2;
  // game_state.board[60] = 3;
  // print(max_play_mobility(game_state.board, game_state.arrow, game_state.player_pos, game_state.current_player));
  // return;


  // search for best coefficients on strategies against random_play()
  var best_alpha = 0;
  var best_win_rate = 0;

  var alpha = 0;
  var DIFF = 0.1;

  while (alpha < 1) { // iterate through values for alpha
    print("alpha = " + alpha);
    var win_rate = 0;
    for (i in [...Array(300)]) { // play 300 games per alpha setting
      player_1_func = Math.random() <= alpha ? min_opp_and_max_play_mobility: chaser;
      if (play_game(player_1_func, random_play) == 0) { // if white win
        win_rate++;
      }
    }
    print("win_rate = " + (win_rate / 300));
    if (win_rate > best_win_rate) {
      best_win_rate = win_rate;
      best_alpha = alpha;
    }
    alpha += DIFF;
  }


  print("best_alpha = " + best_alpha);




}
