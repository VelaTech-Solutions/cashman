import React, { useEffect, useRef } from "react";

const CanvasView = ({ canvasRef, onMouseMove, onClick }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouse = (e) => {
      if (onMouseMove) onMouseMove(e);
    };

    const handleClick = (e) => {
      console.log("Canvas clicked!"); // ✅ Debug log
      if (onClick) onClick(e);
    };

    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("click", handleClick);
    };
  }, [onMouseMove, onClick, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={460}
      style={{ backgroundColor: "#111", borderRadius: "10px" }}
    />
  );
};

export default CanvasView;
