// Utils/gameHandlers.js

export const handleMouseMove = (e, canvasRef, setMouseX) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  };
  
  export const handleClick = ({
    gameOver,
    uniqueTransactions,
    currentIndex,
    mouseX,
    bullets = [], // ensure bullets is never undefined
    setBullets,
  }) => {
    console.log("handleClick triggered");
  
    const currentTransaction = uniqueTransactions?.[currentIndex];
  
    if (
      gameOver ||
      !currentTransaction ||
      bullets.some((b) => !b.hit)
    ) {
      return;
    }
  
    const newBullet = {
      x: mouseX,
      y: 390,
      label: currentTransaction.description || "",
      hit: false,
    };
  
    setBullets((prev) => [...prev, newBullet]);
  };
  
  
  
  export const handleReset = ({
    transactions,
    categories,
    timerRef,
    setBullets,
    setCurrentIndex,
    setAmmo,
    setTimer,
    setHitLogs,
    setGameOver,
    setSubcategoryMode,
    setSubcategoryTargets,
    setUniqueTransactions,
    setCategoryHits,
    setSubcategoryHits,
    getUniqueTransactions,
  }) => {
    const unique = getUniqueTransactions(transactions);
    setBullets([]);
    setCurrentIndex(0);
    setAmmo(unique.length);
    setTimer(0);
    setHitLogs([]);
    setGameOver(false);
    setSubcategoryMode(false);
    setSubcategoryTargets([]);
    setUniqueTransactions(unique);
  
    const initHits = {};
    categories.forEach((cat) => {
      initHits[cat.name] = 0;
      (cat.subcategories || []).forEach((sub) => {
        initHits[sub.name] = 0;
      });
    });
  
    setCategoryHits(initHits);
    setSubcategoryHits(initHits);
  
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
  };
  