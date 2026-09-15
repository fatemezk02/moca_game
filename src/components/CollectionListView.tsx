import React, { useEffect } from 'react';
import { MuseumCollection } from '../types';
import { CuratorExhibitionWall } from './CuratorExhibitionWall';
import { markCollectionsAsViewed } from '../data/collectionNotificationStore';

interface CollectionListViewProps {
  collections: MuseumCollection[];
  onSelectCollectionOnMap: (collection: MuseumCollection) => void;
  onOpenDetailModal: (collection: MuseumCollection) => void;
}

export const CollectionListView: React.FC<CollectionListViewProps> = ({
  collections,
  onSelectCollectionOnMap,
  onOpenDetailModal,
}) => {
  useEffect(() => {
    markCollectionsAsViewed();
  }, []);

  return (
    <div className="w-full h-full overflow-hidden select-none">
      <CuratorExhibitionWall
        onNavigateToMap={() => {
          if (collections.length > 0) {
            onSelectCollectionOnMap(collections[0]);
          }
        }}
        onOpenDetailModal={onOpenDetailModal}
      />
    </div>
  );
};

