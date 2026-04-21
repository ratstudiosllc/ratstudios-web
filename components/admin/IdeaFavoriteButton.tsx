"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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

  function toggleFavorite() {
    const nextFavorite = !optimisticFavorite;
    setOptimisticFavorite(nextFavorite);
    setError(null);

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
        setOptimisticFavorite(!nextFavorite);
        setError("Could not save star");
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
      {error ? <p className="text-xs text-red-600">Could not save star</p> : null}
    </div>
  );
}
