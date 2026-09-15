import React from 'react';
import { AdminPuzzlePoint } from '../types/admin';
import { PuzzlePointMarker } from './PuzzlePointMarker';
import { isPuzzlePointCompleted } from '../data/puzzleProgressStore';

export interface PuzzlePointProps {
  puzzlePoint: AdminPuzzlePoint;
  galleryId: string;
  onClick: (puzzlePoint: AdminPuzzlePoint, e: React.MouseEvent) => void;
  mapWidth?: number;
  mapHeight?: number;
  isSelected?: boolean;
}

/**
 * Shared reusable PuzzlePoint component.
 * Used identically across all galleries to render a puzzle point on the map.
 * Visuals, size, styling, interactions, and completion/check state are completely unified.
 */
export const PuzzlePoint: React.FC<PuzzlePointProps> = ({
  puzzlePoint,
  galleryId,
  onClick,
  mapWidth = 848,
  mapHeight = 1264,
  isSelected = false,
}) => {
  const [isCollected, setIsCollected] = React.useState<boolean>(() =>
    isPuzzlePointCompleted(puzzlePoint.id, galleryId, puzzlePoint.puzzlePieceId)
  );

  React.useEffect(() => {
    const updateStatus = () => {
      setIsCollected(
        isPuzzlePointCompleted(puzzlePoint.id, galleryId, puzzlePoint.puzzlePieceId)
      );
    };
    updateStatus();
    window.addEventListener('museum_puzzle_progress_updated', updateStatus);
    return () => {
      window.removeEventListener('museum_puzzle_progress_updated', updateStatus);
    };
  }, [puzzlePoint.id, galleryId, puzzlePoint.puzzlePieceId]);

  const leftPercent = (puzzlePoint.x / mapWidth) * 100;
  const topPercent = (puzzlePoint.y / mapHeight) * 100;

  return (
    <div
      id={`puzzle-point-${puzzlePoint.id}`}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: 'translate(-50%, -50%) scale(var(--map-point-scale, 1))',
        transformOrigin: 'center center',
      }}
      className="absolute pointer-events-auto z-25"
    >
      <button
        onClick={(e) => onClick(puzzlePoint, e)}
        aria-label={`Open Puzzle: ${puzzlePoint.title}`}
        title={puzzlePoint.title}
        className="relative group flex items-center justify-center p-1 rounded-full cursor-pointer focus:outline-none transition-transform hover:scale-110 active:scale-95"
      >
        <PuzzlePointMarker
          isCollected={isCollected}
          isActive={puzzlePoint.isActive !== false}
          isSelected={isSelected}
          pointId={puzzlePoint.id}
          galleryId={galleryId}
          puzzlePieceId={puzzlePoint.puzzlePieceId}
        />
      </button>
    </div>
  );
};
