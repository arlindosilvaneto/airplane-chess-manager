export const parsePlayerData = (data) => {
  return data.map((player) => ({
    ...player,
    progress: player.rating.map((rating, index) => ({ timestamp: index + 1, rating: rating.rating })),
    rating: player.rating[player.rating.length - 1].rating,
    lastScore: player.rating[player.rating.length - 1].score,
    lastScoreDate: new Date(player.rating[player.rating.length - 1].timestamp).toLocaleString(),
  }));
}

export function convertToCSV(arr) {
  if (arr.length === 0) {
    return '';
  }

  // Extract headers
  const headers = Object.keys(arr[0]);

  // Create rows
  const rows = arr.map(obj => {
    return headers.map(header => {
      let data = obj[header];

      // Quote the data if it contains special characters
      if (typeof data === 'string' && (data.includes(',') || data.includes('\n') || data.includes('"'))) {
        data = `"${data.replace(/"/g, '""')}"`;  // Escape double quotes
      }
      return data;
    }).join(',');
  });

  // Join headers and rows
  return [headers.join(','), ...rows].join('\n');
}
