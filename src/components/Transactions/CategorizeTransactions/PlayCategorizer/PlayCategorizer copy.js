// Enhanced version with bullet miss protection, subcategory rounds, and countdowns
import React, { useEffect, useRef, useState } from "react";
import { db } from "../../../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

const PPPTQT2 = ({ transactions = [] }) => {
  const canvasRef = useRef(null);
  const [mouseX, setMouseX] = useState(300);
  const [bullets, setBullets] = useState([]);
  const [ammo, setAmmo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [uniqueTransactions, setUniqueTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryHits, setCategoryHits] = useState({});
  const [subcategoryHits, setSubcategoryHits] = useState({});
  const [timer, setTimer] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hitLogs, setHitLogs] = useState([]);
  const [subcategoryMode, setSubcategoryMode] = useState(false);
  const [subcategoryTargets, setSubcategoryTargets] = useState([]);
  const [bulletSpeed, setBulletSpeed] = useState(5);
  const [countdownLabel, setCountdownLabel] = useState(null);
  const [roundStarted, setRoundStarted] = useState(false);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const categoryRectsRef = useRef([]);
  const [storedCategorizedTransactions, setStoredCategorizedTransactions] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
      const initHits = {};
      list.forEach((cat) => {
        initHits[cat.name] = 0;
        (cat.subcategories || []).forEach((sub) => {
          initHits[sub.name] = 0;
        });
      });
      setCategoryHits(initHits);
      setSubcategoryHits(initHits);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const seen = new Set();
    const unique = transactions.filter((t) => {
      if (!t.description || seen.has(t.description)) return false;
      seen.add(t.description);
      return true;
    });

    setUniqueTransactions(unique);
    setAmmo(unique.length);
    setCurrentIndex(0);
    setGameOver(false);
    setTimer(0);
    setHitLogs([]);
    setSubcategoryMode(false);
    setSubcategoryTargets([]);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);

    return () => clearInterval(timerRef.current);
  }, [transactions]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  };

  const handleClick = () => {
    if (
      gameOver ||
      countdownLabel ||
      !uniqueTransactions[currentIndex] ||
      bullets.some((b) => !b.hit)
    ) return;

    const newBullet = {
      x: mouseX,
      y: 390,
      label: uniqueTransactions[currentIndex]?.description || "",
      hit: false,
    };
    setBullets((prev) => [...prev, newBullet]);
  };

  const handleReset = () => {
    setBullets([]);
    setCurrentIndex(0);
    setAmmo(uniqueTransactions.length);
    setTimer(0);
    setHitLogs([]);
    setGameOver(false);
    setSubcategoryMode(false);
    setSubcategoryTargets([]);
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

const startRound = (mode) => {
  setCountdownLabel(`${mode} starting in 3`);
  let count = 3;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      setCountdownLabel(`${mode} starting in ${count}`);
    } else {
      clearInterval(interval);
      setCountdownLabel(null);
      setRoundStarted(true);

      if (mode === "Categories") {
        setSubcategoryMode(false);

        const categoryNames = categories.map((cat) => cat.name.toLowerCase());

        const matched = transactions.filter((t) =>
          categoryNames.some((cat) =>
            t.description?.toLowerCase().includes(cat)
          )
        );

        setUniqueTransactions(matched);
        setStoredCategorizedTransactions(matched); // Save for next round
        setAmmo(matched.length);
        setCurrentIndex(0);

      } else if (mode === "Subcategories") {
        setSubcategoryMode(true);

        const allSubs = categories.flatMap((cat) => cat.subcategories || []);
        const subTargets = allSubs.map((s) => s.name.toLowerCase());

        const matchedSubs = storedCategorizedTransactions.filter((t) =>
          subTargets.some((sub) =>
            t.description?.toLowerCase().includes(sub)
          )
        );

        setSubcategoryTargets(allSubs);
        setUniqueTransactions(matchedSubs);
        setAmmo(matchedSubs.length);
        setCurrentIndex(0);
      }
    }
  }, 1000);
};

  

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";

    let roundLabel = "🎯 Shoot Categories";
    if (subcategoryMode && subcategoryTargets.length > 0) {
      const firstSub = subcategoryTargets[0];
      const category = categories.find((cat) =>
        (cat.subcategories || []).some((sub) => sub.name === firstSub.name)
      );
      if (category) {
        roundLabel = `🎯 Shoot ${category.name} Subcategories`;
      }
    }
    ctx.fillText(roundLabel, canvas.width / 2, 30);
    if (countdownLabel) {
      ctx.fillStyle = "orange";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(countdownLabel, canvas.width / 2, 60);
    }

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
    bullets.forEach((b) => {
      if (b.hit || b.y <= 0) return;
      b.y -= bulletSpeed;
      let hit = false;

      for (const rect of categoryRectsRef.current) {
        if (b.x >= rect.x && b.x <= rect.x + rect.width && b.y >= rect.y && b.y <= rect.y + rect.height) {
          hit = true;
          b.hit = true;
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
    });
    setBullets(updatedBullets);

    ctx.fillStyle = "#ccc";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Ammo: ${ammo}`, 10, 20);
    ctx.fillText(`Timer: ${timer}s`, 10, 40);

    if (subcategoryMode && ammo === 0 && updatedBullets.length === 0 && !gameOver) {
      const remaining = categories.filter((cat) =>
        Array.isArray(cat.subcategories) &&
        cat.subcategories.length > 0 &&
        !cat._processed
      );

      const [nextCategory] = remaining;

      if (nextCategory) {
        const subs = nextCategory.subcategories;
        const subTargets = subs.map((s) => s.name.toLowerCase());

        const matchedTransactions = transactions.filter((t) =>
          subTargets.some((subName) =>
            t.description?.toLowerCase().includes(subName)
          )
        );

        setSubcategoryMode(true);
        startCountdown(`🔄 Starting ${nextCategory.name} Subcategories`, () => {
          setSubcategoryTargets(subs);
          setUniqueTransactions(matchedTransactions);
          setAmmo(matchedTransactions.length);
          setCurrentIndex(0);
        });

        const updated = [...categories];
        const idx = updated.findIndex((c) => c.name === nextCategory.name);
        if (idx !== -1) updated[idx]._processed = true;
        setCategories(updated);
      } else {
        setGameOver(true);
        clearInterval(timerRef.current);
      }
    }

    if (gameOver) {
      ctx.fillStyle = "red";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`🎉 Game Complete! Time: ${timer}s`, canvas.width / 2, canvas.height / 2);
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mouseX, bullets, ammo, gameOver, categories, uniqueTransactions, currentIndex, subcategoryMode, countdownLabel]);

  return (
    <div className="flex flex-row gap-4">
      <div className="w-48 bg-gray-800 text-white p-3 rounded">
        <h3 className="text-lg font-semibold mb-2">📊 Categories</h3>
        <ul className="space-y-1 text-sm">
          {categories.map((cat) => {
            const hit = categoryHits[cat.name] || 0;
            const total = transactions.filter((t) =>
              t.description?.toLowerCase().includes(cat.name.toLowerCase())
            ).length;
            return (
              <li key={cat.name} className="flex justify-between">
                <span>{cat.name}</span>
                <span className="text-green-400">{hit} / {total}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col items-center gap-4">
        <canvas
          ref={canvasRef}
          width={1000}
          height={460}
          style={{ backgroundColor: "#111", borderRadius: "10px" }}
        />

          <button
            onClick={() => startRound("Categories")}
            disabled={countdownLabel || roundStarted}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            ▶️ Shoot Categories
          </button>
          <button
            onClick={() => startRound("Subcategories")}
            disabled={countdownLabel || roundStarted}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          >
            ▶️ Shoot Subcategories
          </button>
        <button
          onClick={handleReset}
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
            value={bulletSpeed}
            onChange={(e) => setBulletSpeed(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="bg-gray-900 text-white w-full max-w-xl mt-4 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">🎯 Hit Log</h3>
          <ul className="space-y-1 max-h-48 overflow-y-auto text-sm">
            {hitLogs.map((log, index) => (
              <li key={index} className="text-green-400">{log}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-60 bg-gray-800 text-white p-3 rounded">
        <h3 className="text-lg font-semibold mb-2">📂 Subcategories</h3>
        <ul className="space-y-1 text-sm">
          {subcategoryMode && (subcategoryTargets || []).map((sub) => (
            <li key={sub.name} className="flex justify-between">
              <span>{sub.name}</span>
              <span className="text-yellow-300">{subcategoryHits[sub.name] || 0}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PPPTQT2;