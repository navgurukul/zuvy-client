"use client";

export default function MiniSparkle() {
  const SPARKS = [
    { top: "15%", left: "35%", delay: "0s" },
    { top: "55%", left: "70%", delay: "0.4s" },
    { top: "70%", left: "20%", delay: "0.8s" },
  ];

  return (
    <div className="relative w-[20px] h-[20px]">
      {SPARKS.map((s, i) => (
        <div
          key={i}
          className="absolute opacity-0 animate-sparkle"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
          }}
        >
          {/* horizontal */}
          <div className="w-[8px] h-[1.5px] bg-[#2c5e2c] rounded" />
          {/* vertical */}
          <div className="w-[1.5px] h-[8px] bg-[#2c5e2c] rounded absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      ))}

      <style jsx>{`
        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          25% {
            transform: scale(1.2) rotate(45deg);
            opacity: 1;
          }
          60% {
            transform: scale(0.8) rotate(120deg);
            opacity: 0.6;
          }
          100% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
        }

        .animate-sparkle {
          animation: sparkle 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}