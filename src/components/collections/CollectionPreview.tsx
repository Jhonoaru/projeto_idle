import { useState } from "react";
import { getCollectionSprite } from "../../data/collectionSprites";
import type { CollectionItem } from "../../shared/types";

interface CollectionPreviewProps {
  item?: CollectionItem;
  hidden?: boolean;
  fallback?: string;
  priority?: boolean;
}

export function CollectionPreview({ item, hidden = false, fallback = "?", priority = false }: CollectionPreviewProps) {
  const sprite = getCollectionSprite(item?.id);
  const [failedSrc, setFailedSrc] = useState<string>();
  if (hidden) return <>?</>;
  if (!sprite || failedSrc === sprite.src) return <>{item?.previewValue ?? fallback}</>;
  return (
    <img
      className={`collection-preview-image is-${item?.category ?? "unknown"}`}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailedSrc(sprite.src)}
      src={sprite.src}
    />
  );
}
