
class State {

  constructor(board, arrow, player_pos, current_player) {
    this.board = [...board];
    this.arrow = [...arrow];
    // tail p, head p, slope, tail r, tail c, head r, head c
    //    0      1       2      3        4      5       6
    this.player_pos = [...player_pos];
    this.current_player = current_player;
  }

  arrowize(p1,p2) {
    var arrow_tail_r = Math.floor(p1/8);
    var arrow_tail_c = p1 % 8;
    var arrow_head_r = Math.floor(p2/8);
    var arrow_head_c = p2 % 8;
    var slope = Infinity;

    // make sure that the tail is to the left
    if (arrow_tail_c > arrow_head_c) {
      var temp_tail_r = arrow_tail_r;
      var temp_tail_c = arrow_tail_c;
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

    this.arrow = [arrow_tail_r * 8 + arrow_tail_c, arrow_head_r * 8 + arrow_head_c, slope, arrow_tail_r, arrow_tail_c, arrow_head_r, arrow_head_c];

  }

  is_on_arrow(p) {
    if (this.arrow.length == 0) {
      return false;
    }
    var x1 = this.arrow[4];
    var y1 = -1 * this.arrow[3];
    var x2 = this.arrow[6];
    var y2 = -1 * this.arrow[5];
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
    if (this.arrow.length == 0) {
      return true;
    }

    // arrow is vertical
    if (this.arrow[2] == Infinity) {
      if (((p1 % 8) < this.arrow[4] && (p2 % 8) < this.arrow[4]) || ((p1 % 8) > this.arrow[4] && (p2 % 8) > this.arrow[4])) {
        return true;
      }
      else {
        return false;
      }
    }

    // arrow is slanted
    else {
      var row_on_arrow_in_col_of_p1 = this.arrow[3] + this.arrow[2] * (this.arrow[4] - (p1 % 8));
      var row_on_arrow_in_col_of_p2 = this.arrow[3] + this.arrow[2] * (this.arrow[4] - (p2 % 8));
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
      this.arrow = [];
    }
  }

  clone() {
    return new State([...this.board], [...this.arrow], [...this.player_pos], this.current_player);
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
