import React from 'react';
import { StarDiscoveryModal, StarDiscoveryModalProps } from './StarDiscoveryModal';

/**
 * Shared reusable StarQuestionPopup component (alias for StarDiscoveryModal).
 * Unifies Star Point questions, artwork preview, and discovery options across all galleries.
 */
export const StarQuestionPopup: React.FC<StarDiscoveryModalProps> = (props) => {
  return <StarDiscoveryModal {...props} />;
};

export default StarQuestionPopup;
