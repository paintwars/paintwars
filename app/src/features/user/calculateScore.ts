export function calculateScore(
  ownedPixels: number,
  totalStakedUsd: number,
  totalMoves: number
): number {
  // Diminishing returns on pixel control
  const pixelsComponent = Math.sqrt(ownedPixels);

  // Diminishing returns on stake
  const stakeComponent = Math.sqrt(totalStakedUsd);

  // Activity reward: more moves increases score via diminishing returns
  const movesComponent = Math.sqrt(totalMoves);

  // Weights (sum to 1)
  const weightPixels = 0.5;
  const weightStake = 0.3;
  const weightMoves = 0.2;

  // Composite score
  const rawScore =
    pixelsComponent * weightPixels +
    stakeComponent * weightStake +
    movesComponent * weightMoves;

  return Math.round(rawScore * 1200);
}
