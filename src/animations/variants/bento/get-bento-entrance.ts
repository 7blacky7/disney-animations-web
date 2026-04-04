/**
 * Creates a variant based on grid position for natural stagger.
 * Cards enter from the direction closest to their grid edge.
 *
 * @param col - Column index (0-based)
 * @param row - Row index (0-based)
 * @param totalCols - Total columns in grid
 */

import type { Variants } from "framer-motion";
import { bentoItemLeft } from "./bento-item-left";
import { bentoItemRight } from "./bento-item-right";
import { bentoItem } from "./bento-item";

export function getBentoEntrance(
  col: number,
  row: number,
  totalCols: number,
): Variants {
  // Cards on left edge enter from left, right edge from right
  const isLeftEdge = col === 0;
  const isRightEdge = col === totalCols - 1;

  if (isLeftEdge) return bentoItemLeft;
  if (isRightEdge) return bentoItemRight;
  return bentoItem;
}
