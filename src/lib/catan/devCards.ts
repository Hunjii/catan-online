import { DevCardType } from './types';

// Standard 25 Development Cards Deck
export function createDevCardDeck(): DevCardType[] {
  const deck: DevCardType[] = [
    // 14 Knights
    'knight', 'knight', 'knight', 'knight', 'knight', 'knight', 'knight',
    'knight', 'knight', 'knight', 'knight', 'knight', 'knight', 'knight',
    // 5 Victory Points
    'victory_point', 'victory_point', 'victory_point', 'victory_point', 'victory_point',
    // 2 Road Building
    'road_building', 'road_building',
    // 2 Year of Plenty
    'year_of_plenty', 'year_of_plenty',
    // 2 Monopoly
    'monopoly', 'monopoly',
  ];

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export const DEV_CARD_INFO: Record<
  DevCardType,
  { title: string; viTitle: string; description: string; viDescription: string; badge: string }
> = {
  knight: {
    title: 'Knight',
    viTitle: 'Hiệp sĩ',
    description: 'Move the robber to a new tile and steal 1 resource from an adjacent player.',
    viDescription: 'Di chuyển Tướng cướp sang ô mới và cướp 1 tài nguyên từ đối thủ ở ô đó.',
    badge: '⚔️',
  },
  victory_point: {
    title: 'Victory Point',
    viTitle: 'Điểm chiến thắng',
    description: 'Provides 1 hidden Victory Point towards the 10 VP goal.',
    viDescription: 'Cung cấp 1 Điểm Chiến Thắng ẩn để đạt mốc 10 điểm chiến thắng.',
    badge: '🏆',
  },
  road_building: {
    title: 'Road Building',
    viTitle: 'Xây dựng đường',
    description: 'Place 2 new roads for free immediately.',
    viDescription: 'Đặt ngay 2 đoạn đường mới miễn phí.',
    badge: '🛣️',
  },
  year_of_plenty: {
    title: 'Year of Plenty',
    viTitle: 'Năm bội thu',
    description: 'Take any 2 resource cards from the bank immediately.',
    viDescription: 'Lấy ngay 2 thẻ tài nguyên bất kỳ từ ngân hàng.',
    badge: '🌾',
  },
  monopoly: {
    title: 'Monopoly',
    viTitle: 'Độc quyền',
    description: 'Name 1 resource type. All other players must give you all cards of that type.',
    viDescription: 'Chọn 1 loại tài nguyên. Tất cả người chơi khác phải giao nộp toàn bộ tài nguyên đó cho bạn.',
    badge: '👑',
  },
};
