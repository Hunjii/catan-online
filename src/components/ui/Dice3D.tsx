'use client';

import React, { useMemo } from 'react';

export interface Dice3DProps {
  value: number; // 1 to 6
  isRolling?: boolean;
  size?: number; // size in px, default 56
  duration?: number; // animation duration in seconds, default 1.6
  color?: 'ivory' | 'red' | 'amber';
  dieIndex?: number; // 0 or 1, gives unique bounce trajectory
  onClick?: () => void;
  className?: string;
}

// Map target value to final 3D rotation angles (degrees)
// Standard D6: 1 opposite 6, 2 opposite 5, 3 opposite 4
const ROTATIONS: Record<number, { x: number; y: number; z: number }> = {
  1: { x: 0, y: 0, z: 0 },
  6: { x: 0, y: 180, z: 0 },
  2: { x: -90, y: 0, z: 0 },
  5: { x: 90, y: 0, z: 0 },
  3: { x: 0, y: -90, z: 0 },
  4: { x: 0, y: 90, z: 0 },
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value = 1,
  isRolling = false,
  size = 56,
  duration = 1.6,
  color = 'ivory',
  dieIndex = 0,
  onClick,
  className = '',
}) => {
  const halfSize = size / 2;
  const clampedValue = Math.max(1, Math.min(6, Math.round(value || 1)));

  // Target base face orientation
  const base = ROTATIONS[clampedValue] || ROTATIONS[1];
  const tiltX = dieIndex === 0 ? -12 : -16;
  const tiltY = dieIndex === 0 ? 16 : -14;

  // Final landing rotations with spin multiples for keyframe animation
  const targetRx = base.x + (dieIndex === 0 ? 1440 : -1080) + tiltX;
  const targetRy = base.y + (dieIndex === 0 ? 1080 : 1440) + tiltY;
  const targetRz = base.z + (dieIndex === 0 ? 720 : -720);

  // Static resting rotations
  const staticRx = base.x + tiltX;
  const staticRy = base.y + tiltY;
  const staticRz = base.z;

  // Milky white with subtle warm golden sheen (Ivory Porcelain)
  const faceBg =
    color === 'red'
      ? 'bg-gradient-to-br from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] border-[#991b1b]'
      : 'bg-gradient-to-br from-[#ffffff] via-[#fbf5e5] to-[#ece0be] border-[#d8c39b]';

  // Recessed dark charcoal-black pips with clean lighting
  const pipColor =
    color === 'red'
      ? 'bg-[#fffaf0] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.6)]'
      : 'bg-[#18110a] shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.95),0_1px_0.5px_rgba(255,255,255,0.75)]';

  const pipSize = Math.max(5, Math.round(size * 0.18));
  const cornerRadius = Math.max(6, Math.round(size * 0.22));

  // Helper to render pips for each face
  const renderPips = (faceNum: number) => {
    return (
      <>
        {/* Subtle golden luster reflection sheen */}
        <div className="pointer-events-none absolute inset-0 rounded-inherit bg-gradient-to-tr from-amber-300/10 via-amber-100/15 to-white/40" />
        
        {faceNum === 1 && (
          <div className="flex h-full w-full items-center justify-center">
            <span
              style={{ width: pipSize * 1.25, height: pipSize * 1.25 }}
              className={`rounded-full ${pipColor}`}
            />
          </div>
        )}
        {faceNum === 2 && (
          <div className="flex h-full w-full flex-col justify-between p-[18%]">
            <span style={{ width: pipSize, height: pipSize }} className={`self-start rounded-full ${pipColor}`} />
            <span style={{ width: pipSize, height: pipSize }} className={`self-end rounded-full ${pipColor}`} />
          </div>
        )}
        {faceNum === 3 && (
          <div className="flex h-full w-full flex-col justify-between p-[16%]">
            <span style={{ width: pipSize, height: pipSize }} className={`self-start rounded-full ${pipColor}`} />
            <span style={{ width: pipSize, height: pipSize }} className={`self-center rounded-full ${pipColor}`} />
            <span style={{ width: pipSize, height: pipSize }} className={`self-end rounded-full ${pipColor}`} />
          </div>
        )}
        {faceNum === 4 && (
          <div className="flex h-full w-full flex-col justify-between p-[16%]">
            <div className="flex justify-between">
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
            </div>
            <div className="flex justify-between">
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
            </div>
          </div>
        )}
        {faceNum === 5 && (
          <div className="relative flex h-full w-full flex-col justify-between p-[16%]">
            <div className="flex justify-between">
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
            </div>
            <span
              style={{ width: pipSize, height: pipSize }}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${pipColor}`}
            />
            <div className="flex justify-between">
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
            </div>
          </div>
        )}
        {faceNum === 6 && (
          <div className="flex h-full w-full justify-between p-[16%]">
            <div className="flex flex-col justify-between">
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
            </div>
            <div className="flex flex-col justify-between">
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
              <span style={{ width: pipSize, height: pipSize }} className={`rounded-full ${pipColor}`} />
            </div>
          </div>
        )}
      </>
    );
  };

  const faceCommon = `absolute inset-0 border shadow-[inset_0_2.5px_4px_rgba(255,255,255,0.98),inset_0_-2px_4px_rgba(180,130,40,0.22),inset_2px_0_3px_rgba(255,248,220,0.7),inset_-2px_0_3px_rgba(150,110,35,0.2),0_4px_10px_rgba(0,0,0,0.35)] backface-hidden select-none overflow-hidden ${faceBg}`;

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        perspective: size * 8,
      }}
      className={`relative inline-block select-none ${className}`}
    >
      <style>{`
        @keyframes diceTumble0 {
          0% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(540deg) rotateY(360deg) rotateZ(180deg);
          }
          55% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(1080deg) rotateY(720deg) rotateZ(360deg);
          }
          75% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(1260deg) rotateY(900deg) rotateZ(540deg);
          }
          90% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(calc(var(--target-rx) + 4deg)) rotateY(calc(var(--target-ry) - 3deg)) rotateZ(var(--target-rz));
          }
          100% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(var(--target-rx)) rotateY(var(--target-ry)) rotateZ(var(--target-rz));
          }
        }

        @keyframes diceTumble1 {
          0% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(-360deg) rotateY(540deg) rotateZ(-180deg);
          }
          55% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(-720deg) rotateY(1080deg) rotateZ(-360deg);
          }
          75% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(-900deg) rotateY(1260deg) rotateZ(-540deg);
          }
          90% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(calc(var(--target-rx) - 4deg)) rotateY(calc(var(--target-ry) + 3deg)) rotateZ(var(--target-rz));
          }
          100% {
            transform: translateZ(calc(-1 * var(--half-size))) rotateX(var(--target-rx)) rotateY(var(--target-ry)) rotateZ(var(--target-rz));
          }
        }

        @keyframes diceVerticalHop {
          0% { transform: translateY(-6px); }
          25% { transform: translateY(-10px); }
          55% { transform: translateY(-3px); }
          75% { transform: translateY(-1px); }
          100% { transform: translateY(0px); }
        }

        @keyframes diceShadowBounce {
          0% { transform: scale(0.85) translateY(2px); opacity: 0.5; }
          25% { transform: scale(0.7) translateY(4px); opacity: 0.35; }
          55% { transform: scale(0.92) translateY(1px); opacity: 0.65; }
          75% { transform: scale(0.98) translateY(0px); opacity: 0.72; }
          100% { transform: scale(1) translateY(0); opacity: 0.75; }
        }
      `}</style>

      {/* Dynamic 3D Ground Shadow */}
      <div
        style={{
          width: size * 1.05,
          height: size * 0.35,
          left: -size * 0.025,
          bottom: -size * 0.16,
          ...(isRolling
            ? {
                animation: 'diceShadowBounce 1.1s cubic-bezier(0.15, 0.85, 0.25, 1) forwards',
              }
            : {
                transform: 'scale(1) translateY(0)',
                opacity: 0.75,
                transition: 'all 0.4s ease-out',
              }),
        }}
        className="pointer-events-none absolute rounded-full bg-black/60 blur-[5px]"
      />

      {/* Upright Bounce Wrapper */}
      <div
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          ...(isRolling
            ? {
                animation: `diceVerticalHop ${duration}s cubic-bezier(0.15, 0.85, 0.25, 1) forwards`,
              }
            : {
                transform: 'translateY(0)',
              }),
        }}
        className="relative h-full w-full"
      >
        {/* 3D Cube Container */}
        <div
          style={{
            width: size,
            height: size,
            transformStyle: 'preserve-3d',
            ...(isRolling
              ? {
                  animation: `${dieIndex === 0 ? 'diceTumble0' : 'diceTumble1'} ${duration}s cubic-bezier(0.15, 0.85, 0.25, 1) forwards`,
                  ['--half-size' as string]: `${halfSize}px`,
                  ['--target-rx' as string]: `${targetRx}deg`,
                  ['--target-ry' as string]: `${targetRy}deg`,
                  ['--target-rz' as string]: `${targetRz}deg`,
                }
              : {
                  transform: `translateZ(-${halfSize}px) rotateX(${staticRx}deg) rotateY(${staticRy}deg) rotateZ(${staticRz}deg)`,
                  transition: 'transform 0.4s ease-out',
                }),
          }}
          className="relative h-full w-full"
        >
          {/* Face 1: Front */}
          <div
            style={{
              transform: `translateZ(${halfSize}px)`,
              borderRadius: cornerRadius,
            }}
            className={faceCommon}
          >
            {renderPips(1)}
          </div>

          {/* Face 6: Back */}
          <div
            style={{
              transform: `rotateY(180deg) translateZ(${halfSize}px)`,
              borderRadius: cornerRadius,
            }}
            className={faceCommon}
          >
            {renderPips(6)}
          </div>

          {/* Face 2: Top */}
          <div
            style={{
              transform: `rotateX(90deg) translateZ(${halfSize}px)`,
              borderRadius: cornerRadius,
            }}
            className={faceCommon}
          >
            {renderPips(2)}
          </div>

          {/* Face 5: Bottom */}
          <div
            style={{
              transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
              borderRadius: cornerRadius,
            }}
            className={faceCommon}
          >
            {renderPips(5)}
          </div>

          {/* Face 3: Right */}
          <div
            style={{
              transform: `rotateY(90deg) translateZ(${halfSize}px)`,
              borderRadius: cornerRadius,
            }}
            className={faceCommon}
          >
            {renderPips(3)}
          </div>

          {/* Face 4: Left */}
          <div
            style={{
              transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
              borderRadius: cornerRadius,
            }}
            className={faceCommon}
          >
            {renderPips(4)}
          </div>
        </div>
      </div>
    </div>
  );
};



