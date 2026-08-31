import { Player, ResourceType, Vertex } from './types';

export interface PlayerPortRatios {
  generic: number; // 4 default, or 3 if has generic 3:1 port
  wood: number; // 4 default, or 3, or 2 if has wood 2:1 port
  brick: number;
  sheep: number;
  wheat: number;
  ore: number;
}

/**
 * Computes trade ratios available to a player based on their harbor access.
 */
export function getPlayerTradeRatios(
  playerId: string,
  vertices: Vertex[]
): PlayerPortRatios {
  const ratios: PlayerPortRatios = {
    generic: 4,
    wood: 4,
    brick: 4,
    sheep: 4,
    wheat: 4,
    ore: 4,
  };

  // Find all ports owned by this player
  vertices.forEach((v) => {
    if (v.building && v.building.playerId === playerId && v.port) {
      if (v.port.type === 'generic_3_1') {
        ratios.generic = Math.min(ratios.generic, 3);
        (['wood', 'brick', 'sheep', 'wheat', 'ore'] as ResourceType[]).forEach((res) => {
          ratios[res] = Math.min(ratios[res], 3);
        });
      } else if (v.port.resource) {
        ratios[v.port.resource] = 2;
      }
    }
  });

  return ratios;
}

/**
 * Validates whether a player has enough resources to fulfill an offer.
 */
export function hasEnoughResources(
  player: Player,
  required: Partial<Record<ResourceType, number>>
): boolean {
  for (const [res, count] of Object.entries(required)) {
    const resource = res as ResourceType;
    if ((count || 0) > (player.resources[resource] || 0)) {
      return false;
    }
  }
  return true;
}
