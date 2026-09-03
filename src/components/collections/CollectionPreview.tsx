import { useState } from "react";
import { getCollectionSprite } from "../../data/collectionSprites";
import type { CollectionItem } from "../../shared/types";

interface CollectionPreviewProps {
  item?: CollectionItem;
  hidden?: boolean;
  fallback?: string;
}

export function CollectionPreview({ item, hidden = false, fallback = "?" }: CollectionPreviewProps) {
  const sprite = getCollectionSprite(item?.id);
  const [failedSrc, setFailedSrc] = useState<string>();
  if (hidden) return <>?</>;
  if (!sprite || failedSrc === sprite.src) return <>{item?.previewValue ?? fallback}</>;
  return (
    <img
      className="collection-preview-image"
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      onError={() => setFailedSrc(sprite.src)}
      src={sprite.src}
    />
  );
}
