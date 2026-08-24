import type { Ref } from "vue";
import type {
  DevListItem,
  VoteValue,
} from "~/app/pages/(modules)/devs/types/devs.types";

// Estado de voto de un dev: contadores optimistas + bloqueo de "ya voté".
type VoteState = {
  likes: number;
  dislikes: number;
  myVote: VoteValue | null;
  pending: boolean;
};

// Gestiona el voto de una lista de devs compartiendo estado por fila, igual que
// useCoinVotes con las coins: las columnas separadas de Likes y Dislikes (celdas
// independientes de la data-table) operan sobre el MISMO estado del dev, así que
// votar en una bloquea la otra.
export const useDevVotes = (devs: Ref<DevListItem[]>) => {
  const { rateDev } = useRatingService();
  const states = reactive<Record<string, VoteState>>({});

  // Sincroniza el mapa con la lista: crea entradas nuevas y refresca los
  // contadores de los devs que aún no hemos votado en esta sesión.
  watch(
    devs,
    (list) => {
      for (const dev of list) {
        const current = states[dev.handle];
        if (!current) {
          states[dev.handle] = {
            likes: dev.likes,
            dislikes: dev.dislikes,
            myVote: null,
            pending: false,
          };
        } else if (current.myVote === null) {
          current.likes = dev.likes;
          current.dislikes = dev.dislikes;
        }
      }
    },
    { immediate: true, deep: true },
  );

  // Estado siempre definido (fallback a los contadores del propio dev).
  const stateFor = (dev: DevListItem): VoteState =>
    states[dev.handle] ?? {
      likes: dev.likes,
      dislikes: dev.dislikes,
      myVote: null,
      pending: false,
    };

  const vote = async (dev: DevListItem, value: VoteValue) => {
    const state = states[dev.handle];
    if (!state || state.pending || state.myVote !== null) return;

    const prevLikes = state.likes;
    const prevDislikes = state.dislikes;
    state.pending = true;
    state.myVote = value;
    if (value === "like") state.likes += 1;
    else state.dislikes += 1;

    try {
      const counts = await rateDev(dev.handle, value);
      state.likes = counts.likes;
      state.dislikes = counts.dislikes;
    } catch {
      // Revertimos la UI optimista si el server falla (rateDev ya loguea).
      state.likes = prevLikes;
      state.dislikes = prevDislikes;
      state.myVote = null;
    } finally {
      state.pending = false;
    }
  };

  return { stateFor, vote };
};
