export type SocialLink = {
  platform:
    | "twitter"
    | "telegram"
    | "discord"
    | "instagram"
    | "tiktok"
    | "youtube"
    | "website";
  url: string;
  label?: string;
};

export type TokenomicsItem = {
  label: string;
  value: string;
};

export type HowToBuyStep = {
  emoji: string;
  title: string;
  description: string;
};

export type CoinConfig = {
  name: string;
  ticker: string;
  tagline: string;
  description: string;
  logo: string;

  hero: {
    headline: string;
    subheadline: string;
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

  howToBuy: {
    title: string;
    steps: HowToBuyStep[];
  };

  community: {
    title: string;
    description: string;
    socials: SocialLink[];
  };

  footer: {
    disclaimer: string;
  };
};
