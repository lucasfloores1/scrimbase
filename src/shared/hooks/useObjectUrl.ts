import { useEffect, useMemo } from "react";

/** Crea una URL local para previsualizar un archivo y la libera cuando cambia. */
export function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
