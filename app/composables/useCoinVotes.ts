import type { Ref } from "vue";
import type {
  FeedCoin,
  VoteValue,
} from "~/app/pages/(modules)/devs/types/devs.types";

// Estado de voto de una coin: contadores optimistas + bloqueo de "ya voté".
type VoteState = {
  likes: number;
  dislikes: number;
  myVote: VoteValue | null;
  pending: boolean;
};

// Gestiona el voto de una lista de coins compartiendo estado por fila, de modo
// que las columnas separadas de Likes y Dislikes (celdas independientes de la
// data-table) operen sobre el MISMO estado: votar en una bloquea la otra.
export const useCoinVotes = (coins: Ref<FeedCoin[]>) => {
  const { rateCoin } = useRatingService();
  const states = reactive<Record<number, VoteState>>({});

  // Sincroniza el mapa con la lista: crea entradas nuevas y refresca los
  // contadores de las coins que aún no hemos votado en esta sesión.
  watch(
    coins,
    (list) => {
      for (const coin of list) {
        const current = states[coin.id];
        if (!current) {
          states[coin.id] = {
            likes: coin.likes,
            dislikes: coin.dislikes,
            myVote: null,
            pending: false,
          };
        } else if (current.myVote === null) {
          current.likes = coin.likes;
          current.dislikes = coin.dislikes;
        }
      }
    },
    { immediate: true, deep: true },
  );

  // Estado siempre definido (fallback a los contadores de la propia coin).
  const stateFor = (coin: FeedCoin): VoteState =>
    states[coin.id] ?? {
      likes: coin.likes,
      dislikes: coin.dislikes,
      myVote: null,
      pending: false,
    };

  const vote = async (coin: FeedCoin, value: VoteValue) => {
    const state = states[coin.id];
    if (!state || state.pending || state.myVote !== null || !coin.slug) return;

    const prevLikes = state.likes;
    const prevDislikes = state.dislikes;
    state.pending = true;
    state.myVote = value;
    if (value === "like") state.likes += 1;
    else state.dislikes += 1;

    try {
      const counts = await rateCoin(coin.devHandle, coin.slug, value);
      state.likes = counts.likes;
      state.dislikes = counts.dislikes;
    } catch {
      // Revertimos la UI optimista si el server falla (rateCoin ya loguea).
      state.likes = prevLikes;
      state.dislikes = prevDislikes;
      state.myVote = null;
    } finally {
      state.pending = false;
    }
  };

  return { stateFor, vote };
};
