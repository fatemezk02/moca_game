import React from 'react';
import {
  PuzzleQuestionModal,
  PuzzleQuestionModalProps,
} from './PuzzleQuestionModal';

export type PuzzlePointModalProps = PuzzleQuestionModalProps;

/**
 * Backwards compatibility alias for the shared PuzzleQuestionModal.
 */
export const PuzzlePointModal: React.FC<PuzzlePointModalProps> = (props) => {
  return <PuzzleQuestionModal {...props} />;
};

export default PuzzlePointModal;
