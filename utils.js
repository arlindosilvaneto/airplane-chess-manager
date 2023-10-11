export const parsePlayerData = (data) => {
  return data.map((player) => ({
    ...player,
    progress: player.rating.map((rating, index) => ({ timestamp: index + 1, rating: rating.rating })),
    rating: player.rating[player.rating.length - 1].rating,
    lastScore: player.rating[player.rating.length - 1].score,
    lastScoreDate: player.rating[player.rating.length - 1].timestamp,
  }));
}