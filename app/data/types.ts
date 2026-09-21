export type SocialLink = {
  platform:
    | "twitter"
    | "telegram"
    | "discord"
    | "instagram"
    | "tiktok"
    | "youtube"
    | "website";
  icon?: string;
  url: string;
  label?: string;
};

export type TokenomicsItem = {
  label: string;
  value: string;
};

export type CatCoin = {
  slug: string;
  name: string;
  ticker: string;
  chain: string;
  emoji: string;
  description: string;
  dexScreener?: {
    chainId: string;
    tokenAddress: string;
  };
};

export type HowToBuyStep = {
  emoji: string;
  title: string;
  description: string;
};

export type CommunityRule = {
  icon: string;
  title: string;
  description: string;
};

export type CoinConfig = {
  general: {
    name: string;
    ticker: string;
    tagline: string;
    description: string;
    logo: string;
    disclaimer: string;
  };

  hero: {
    headline: string;
    subheadline: string[];
    ctaLabel: string;
    ctaUrl: string;
  };

  about: {
    title: string;
    paragraphs: string[];
    tags?: string[];
    image?: string;
  };

  tokenomics: {
    title: string;
    items: TokenomicsItem[];
    contractAddress?: string;
    chain?: string;
  };

  catCoins: {
    title: string;
    description: string;
    coins: CatCoin[];
  };

  howToBuy: {
    title: string;
    steps: HowToBuyStep[];
  };

  community: {
    title: string;
    description: string;
    rules: CommunityRule[];
    socials: SocialLink[];
  };
};
