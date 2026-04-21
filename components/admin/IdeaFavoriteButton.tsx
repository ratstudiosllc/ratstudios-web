"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const STORAGE_KEY = "ratstudios.favoriteIdeas";

function readFavoriteIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.map((value) => String(value)) : []);
  } catch {
    return new Set<string>();
  }
}

function writeFavoriteIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

export function IdeaFavoriteButton({
  ideaId,
  isFavorite,
}: {
  ideaId: string;
  isFavorite: boolean;
}) {
  const router = useRouter();
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const favoriteIds = readFavoriteIds();
    if (favoriteIds.has(ideaId)) {
      setOptimisticFavorite(true);
    }
  }, [ideaId]);

  function persistLocalFavorite(nextFavorite: boolean) {
    const favoriteIds = readFavoriteIds();
    if (nextFavorite) favoriteIds.add(ideaId);
    else favoriteIds.delete(ideaId);
    writeFavoriteIds(favoriteIds);
  }

  function toggleFavorite() {
    const nextFavorite = !optimisticFavorite;
    setOptimisticFavorite(nextFavorite);
    setError(null);
    persistLocalFavorite(nextFavorite);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/ideas/${ideaId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: nextFavorite }),
        });

        if (!response.ok) {
          throw new Error("Failed to update favorite");
        }

        router.refresh();
      } catch {
        setError("Saved only on this browser for now");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!isPending) toggleFavorite();
        }}
        aria-pressed={optimisticFavorite}
        aria-label={optimisticFavorite ? "Remove star" : "Star idea"}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${optimisticFavorite ? "border-amber-200 bg-amber-50 text-amber-700" : "border-black/10 bg-white text-neutral-600 hover:bg-[#fcfaf7]"} ${isPending ? "opacity-70" : ""}`}
      >
        <span aria-hidden="true">{optimisticFavorite ? "★" : "☆"}</span>
        <span>{optimisticFavorite ? "Starred" : "Star"}</span>
      </button>
      {error ? <p className="text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}
