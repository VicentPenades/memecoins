import { devRepository } from "~/app/pages/(modules)/devs/repositories/dev.repository";
import type {
  VoteCounts,
  VoteValue,
} from "~/app/pages/(modules)/devs/types/devs.types";

// Servicio de valoración (like/dislike) para devs y monedas. Sin estado propio:
// las cards mantienen sus contadores en local y aquí solo persistimos el voto.
export const useRatingService = () => {
  const rateDev = async (
    handle: string,
    value: VoteValue,
  ): Promise<VoteCounts> => {
    try {
      return await devRepository.voteDev(handle, value);
    } catch (err) {
      console.error("Error voting dev:", err);
      throw err;
    }
  };

  const rateCoin = async (
    handle: string,
    slug: string,
    value: VoteValue,
  ): Promise<VoteCounts> => {
    try {
      return await devRepository.voteCoin(handle, slug, value);
    } catch (err) {
      console.error("Error voting coin:", err);
      throw err;
    }
  };

  return { rateDev, rateCoin };
};
