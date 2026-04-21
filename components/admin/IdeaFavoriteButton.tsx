import { toggleIdeaFavoriteAction } from "@/app/admin/ideas/actions";

export function IdeaFavoriteButton({
  ideaId,
  isFavorite,
}: {
  ideaId: string;
  isFavorite: boolean;
}) {
  return (
    <form action={toggleIdeaFavoriteAction}>
      <input type="hidden" name="id" value={ideaId} />
      <input type="hidden" name="nextFavorite" value={String(!isFavorite)} />
      <button
        type="submit"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.form?.requestSubmit();
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Remove star" : "Star idea"}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${isFavorite ? "border-amber-200 bg-amber-50 text-amber-700" : "border-black/10 bg-white text-neutral-600 hover:bg-[#fcfaf7]"}`}
      >
        <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
        <span>{isFavorite ? "Starred" : "Star"}</span>
      </button>
    </form>
  );
}
