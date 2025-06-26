export async function fetchMyCards(token) {
  const res = await fetch("/api/cards", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch cards");
  return res.json();
}

export async function likeCard(cardId, token) {
  const res = await fetch(`/api/cards/${cardId}/helpful`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to like card");
  return res.json();
}
