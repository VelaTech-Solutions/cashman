import React, { useEffect, useRef, useState } from "react";
import CanvasView from "./Views/CanvasView";
import Controls from "./Controls/Controls";
import { fetchCategoriesFromDB, getUniqueTransactions } from "./Utils/dataPrep";
import { drawCanvas } from "./Actions/GameEngine";

import CategoryList from "./Views/CategoryList";
import SubcategoryList from "./Views/SubcategoryList";
import Summaries from "./Views/summary";

import {
  handleMouseMove as onMouseMoveHandler,
  handleClick as onClickHandler,
  handleReset as onResetHandler,
} from "./Utils/gameHandlers";

const PlayCategorizer = ({ transactions = [], id }) => {
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const categoryRectsRef = useRef([]);
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
  const [storedCategorizedTransactions, setStoredCategorizedTransactions] = useState([]);
  const [storedSubcategorizedTransactions, setStoredSubcategorizedTransactions] = useState([]);

  useEffect(() => {
    fetchCategoriesFromDB().then((list) => {
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
    });
  }, []);

  useEffect(() => {
    const unique = getUniqueTransactions(transactions);
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

  useEffect(() => {
    animationRef.current = requestAnimationFrame(() =>
      drawCanvas({
        ctx: canvasRef.current?.getContext("2d"),
        state: {
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
          storedCategorizedTransactions,
          storedSubcategorizedTransactions,
          id,
        },
        refs: { categoryRectsRef },
        setStateFns: {
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
          setStoredCategorizedTransactions,
          setStoredSubcategorizedTransactions,
        },
        transactions,
        timerRef,
      })
    );
  }, [
    mouseX,
    bullets,
    ammo,
    gameOver,
    uniqueTransactions,
    categories,
    currentIndex,
    subcategoryMode,
  ]);

  return (
    <div className="flex justify-center items-start gap-6 w-full">
      <CategoryList categories={categories} categoryHits={categoryHits} />

      <div className="flex flex-col items-center gap-4">
        <div className="bg-black p-4 rounded shadow">
          <CanvasView
            canvasRef={canvasRef}
            onMouseMove={(e) => onMouseMoveHandler(e, canvasRef, setMouseX)}
            onClick={() =>
              onClickHandler({
                gameOver,
                uniqueTransactions,
                currentIndex,
                mouseX,
                setBullets,
              })
            }
          />
        </div>

        <div className="bg-gray-900 p-4 rounded shadow w-full">
          <Controls
            onStartCat={() => {}}
            onStartSubcat={() => {}}
            onReset={() =>
              onResetHandler({
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
              })
            }
            speed={bulletSpeed}
            setSpeed={setBulletSpeed}
          />

          <Summaries
            transactions={transactions}
            uniqueTransactions={uniqueTransactions}
          />
        </div>
      </div>

      <SubcategoryList
        subcategoryMode={subcategoryMode}
        subcategoryTargets={subcategoryTargets}
        subcategoryHits={subcategoryHits}
      />
    </div>
  );
};

export default PlayCategorizer;
