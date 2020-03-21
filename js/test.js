function print(string) { document.getElementById('run').innerHTML += string + "<br>>>> "; console.log(string)}



var empty_board = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];



function play_game(white_func, black_func) {
  var game_state = new state(empty_board, [], [3, 60], 0);
  game_state.board[3] = 2;
  game_state.board[60] = 3;
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
  var white_num = document.querySelector('input[name="white"]:checked').value;
  var black_num = document.querySelector('input[name="black"]:checked').value;
  white_func = all_AI_list[white_num];
  black_func = all_AI_list[black_num];

  var num_games = document.getElementById('numGames').value;

  var num_white_wins = 0;
  for (i in [...Array(Number(num_games))]) {
    num_white_wins += play_game(white_func, black_func) == 0 ? 1 : 0;
  }

  document.getElementById('fight').innerHTML = "White (" + white_num + ") wins: " + num_white_wins + " (" + (num_white_wins * 100 / num_games) + "%)<br>" + "Black (" + black_num + ") wins: " + (num_games - num_white_wins) + " (" + ((num_games - num_white_wins) * 100 / num_games) + "%)" ;
}









function run() {

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
