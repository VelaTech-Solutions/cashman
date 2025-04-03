import React from "react";

const Controls = ({
  onStartCat,
  onStartSubcat,
  onReset,
  speed,
  setSpeed,
  countdownLabel,
  roundStarted,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <button
        onClick={onStartCat}
        disabled={countdownLabel || roundStarted}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        ▶️ Shoot Categories
      </button>

      <button
        onClick={onStartSubcat}
        disabled={countdownLabel || roundStarted}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
      >
        ▶️ Shoot Subcategories
      </button>

      <button
        onClick={onReset}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        🔁 Reset Game
      </button>

      <div className="flex flex-col items-center w-full max-w-sm">
        <label className="text-white mb-1">Bullet Speed</label>
        <input
          type="range"
          min={1}
          max={20}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default Controls;
