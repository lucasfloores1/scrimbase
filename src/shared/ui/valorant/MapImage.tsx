import { useState } from "react";
import { mapListIcon, mapMinimap, mapSplash } from "@/shared/constants/valorant";
import { cn } from "@/lib/utils";

type Variant = "splash" | "minimap" | "strip";

const srcFor: Record<Variant, (m: string) => string | null> = {
  splash: mapSplash,
  minimap: mapMinimap,
  strip: mapListIcon,
};

/**
 * Imagen oficial del mapa (valorant-api.com). Si el CDN no responde, cae en un
 * degradado estable derivado del nombre, así la interfaz nunca queda con un hueco.
 */
export function MapImage({
  map,
  variant = "splash",
  className,
  imgClassName,
  eager = false,
}: {
  map: string;
  variant?: Variant;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = srcFor[variant](map);

  let hue = 0;
  for (const ch of map) hue = (hue * 31 + ch.charCodeAt(0)) % 360;

  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {src && !failed ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn("size-full object-cover", imgClassName)}
        />
      ) : (
        <div
          className="size-full"
          style={{
            background: `linear-gradient(135deg, oklch(0.45 0.11 ${hue}), oklch(0.24 0.05 ${(hue + 50) % 360}))`,
          }}
        />
      )}
    </div>
  );
}

export default MapImage;
