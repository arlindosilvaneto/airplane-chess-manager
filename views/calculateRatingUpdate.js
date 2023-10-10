/**
 * Calculate the new rating using the Elo rating system.
 *
 * @param {number} playerRating - Current rating of the player.
 * @param {number} opponentRating - Current rating of the opponent.
 * @param {number} score - Score of the game (1 for win, 0 for loss, 0.5 for draw).
 * @param {number} kFactor - K-factor used to adjust the rating (common values are 16, 24, 32, ...).
 * @returns {Object} - The new ratings for the player and the opponent.
 */
export function updateElo({ playerRating, opponentRating, score, kFactor }) {
  // Calculate the expected scores
  const playerExpected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const opponentExpected = 1 - playerExpected;

  // Calculate the updated ratings
  const playerNewRating = playerRating + kFactor * (score - playerExpected);
  const opponentNewRating = opponentRating + kFactor * ((1 - score) - opponentExpected);

  return {
    playerRating: parseInt(playerNewRating),
    opponentRating: parseInt(opponentNewRating)
  };
}
