// GameEngine
import { saveShot } from "../Utils/saveShot";

export const drawCanvas = ({
  ctx,
  state,
  refs,
  setStateFns,
  transactions,
  timerRef,
}) => {
  if (!ctx) return;

  const {
    canvasRef,
    mouseX,
    bullets,
    ammo,
    gameOver,
    uniqueTransactions,
    categories,
    categoryHits,
    subcategoryHits,
    timer,
    currentIndex,
    hitLogs,
    subcategoryMode,
    subcategoryTargets,
    bulletSpeed,
    countdownLabel,
    id,
  } = state;

  const { categoryRectsRef } = refs;

  const {
    setBullets,
    setCategoryHits,
    setSubcategoryHits,
    setCurrentIndex,
    setAmmo,
    setGameOver,
    setHitLogs,
    setSubcategoryMode,
    setSubcategoryTargets,
    setUniqueTransactions,
    setCategories,
  } = setStateFns;

  const canvas = canvasRef.current;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "yellow";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  const roundLabel = subcategoryMode ? "🎯 Shoot Subcategories" : "🎯 Shoot Categories";
  ctx.fillText(roundLabel, canvas.width / 2, 30);

  categoryRectsRef.current = [];
  const targets = subcategoryMode ? subcategoryTargets : categories;
  const spacing = Math.min(100, canvas.width / (targets.length + 1));

  targets.forEach((item, i) => {
    const x = 100 + i * spacing;
    const y = 60;
    ctx.fillStyle = "#444";
    ctx.fillRect(x, y, 100, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.name, x + 50, y + 20);
    categoryRectsRef.current.push({ x, y, width: 100, height: 30, label: item.name });
  });

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(mouseX, 400);
  ctx.lineTo(mouseX - 10, 420);
  ctx.lineTo(mouseX + 10, 420);
  ctx.closePath();
  ctx.fill();

  if (uniqueTransactions[currentIndex]) {
    ctx.fillStyle = "#0ff";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(uniqueTransactions[currentIndex].description, mouseX, 430);
  }

  const updatedBullets = [];

  for (const b of bullets) {
    if (b.hit || b.y <= 0) continue;
    b.y -= bulletSpeed;
    let hit = false;

    for (const rect of categoryRectsRef.current) {
      if (
        b.x >= rect.x &&
        b.x <= rect.x + rect.width &&
        b.y >= rect.y &&
        b.y <= rect.y + rect.height
      ) {
        hit = true;
        b.hit = true;
        const transaction = uniqueTransactions[currentIndex];

        setHitLogs((prev) => [`🎯 Hit ${rect.label} with "${b.label}"`, ...prev]);

        if (subcategoryMode) {
          setSubcategoryHits((prev) => ({
            ...prev,
            [rect.label]: (prev[rect.label] || 0) + 1,
          }));
        } else {
          setCategoryHits((prev) => ({
            ...prev,
            [rect.label]: (prev[rect.label] || 0) + 1,
          }));
        }

        // ✅ Firestore save
        (async () => {
          try {
            await saveShot({
              id,
              description: transaction?.description || "",
              category: subcategoryMode ? null : rect.label,
              subcategory: subcategoryMode ? rect.label : null,
              timestamp: Date.now(),
            });
          } catch (err) {
            console.error("Failed to save shot:", err);
          }
        })();

        setCurrentIndex((prev) => prev + 1);
        setAmmo((prev) => prev - 1);
        break;
      }
    }

    if (!hit && b.y > 0) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0f0";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText(b.label, b.x, b.y - 10);
      updatedBullets.push(b);
    }
  }

  setBullets(updatedBullets);

  ctx.fillStyle = "#ccc";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Ammo: ${ammo}`, 10, 20);
  ctx.fillText(`Timer: ${timer}s`, 10, 40);

  const gameStarted = bullets.length > 0;

  if (gameStarted && ammo === 0 && updatedBullets.length === 0 && !gameOver) {
    setGameOver(true);
    clearInterval(timerRef.current);
  }

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`🎉 Game Complete! Time: ${timer}s`, canvas.width / 2, canvas.height / 2);
  }

  requestAnimationFrame(() =>
    drawCanvas({
      ctx,
      state,
      refs,
      setStateFns,
      transactions,
      timerRef,
    })
  );
};
