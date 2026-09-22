import type { CoinConfig } from "./types";

// General information about the coin
const COIN_GENERAL: CoinConfig["general"] = {
  name: "Cat Season",
  ticker: "$CATSZN",
  tagline: "Every season is cat season 🐱",
  description:
    "The purr-fect memecoin for cat lovers and degen enthusiasts. Community-driven, zero tax, 100% vibes.",
  logo: "/coins/catszn/logo.png",
  disclaimer:
    "$CATSZN is a memecoin with no intrinsic value or expectation of financial return. It exists purely for entertainment purposes. Always do your own research.",
};

// Hero section information for the coin
const COIN_HERO: CoinConfig["hero"] = {
  headline: "It's always Cat Season",
  subheadline: [
    "Join the fluffiest community in crypto. No dogs allowed. $CATSZN is here to take over the blockchain, one purr at a time.",
    "Sometimes BTC pumps, sometimes ALTS pumps, but it's always $CATSZN.",
  ],
  ctaLabel: "Buy $CATSZN Now 🚀",
  ctaUrl:
    "https://pump.fun/coin/Hd8xhFxcrh5SdmaAFFzePqkDkonkwKxDfg4aU1Appump",
};

// About
const COIN_ABOUT: CoinConfig["about"] = {
  title: "WTF is Cat Season? 🐱",
  paragraphs: [
    "$CATSZN is more than a token — it's a movement. Born from the collective energy of thousands of cat lovers in the crypto space, Cat Season represents the unstoppable rise of feline culture on the blockchain.",
  ],
  image: "/coins/catszn/about.jpeg",
};

// Tokenomics
const COIN_TOKENOMICS: CoinConfig["tokenomics"] = {
  title: "Tokenomics 📊",
  items: [
    { label: "Total Supply", value: "1M" },
    { label: "Tax", value: "0%" },
    { label: "Contract", value: "Renounced ✅" },
  ],
  contractAddress: "Hd8xhFxcrh5SdmaAFFzePqkDkonkwKxDfg4aU1Appump",
  chain: "Solana",
};

// Other cat coins in the ecosystem
const COIN_CAT_COINS: CoinConfig["catCoins"] = {
  title: "The Cat Coin Hall of Fame 🐈",
  description:
    "Cats already rule the internet. These feline coins prove they are coming for the blockchain too.",
};

// How to buy section information for the coin
const COIN_BUY: CoinConfig["howToBuy"] = {
  title: "How to Ape In 🦧",
  steps: [
    {
      emoji: "👛",
      title: "Get a Wallet",
      description:
        "Download Phantom or Solflare and create a new wallet. Save your seed phrase somewhere safe.",
    },
    {
      emoji: "💰",
      title: "Load up SOL",
      description:
        "Buy SOL on an exchange like Coinbase or Binance and send it to your wallet address.",
    },
    {
      emoji: "🔄",
      title: "Swap for $CATSZN",
      description:
        "Go to Raydium or Jupiter, connect your wallet, paste the $CATSZN contract address, and swap your SOL.",
    },
    {
      emoji: "🐱",
      title: "Join the Cult",
      description:
        "Follow us on X and join the Telegram. Welcome to Cat Season!",
    },
  ],
};

// Community section information for the coin
const COIN_COMMUNITY: CoinConfig["community"] = {
  title: "Building a Better Community 🐾",
  description:
    "We are trying to build an honest, clean and welcoming community around Cat Season — one where everyone plays by the same rules.",
  rules: [
    {
      icon: "👥",
      title: "No insider circles",
      description:
        "No private groups with privileged access or special treatment.",
    },
    {
      icon: "🔎",
      title: "Transparency first",
      description:
        "Important information and decisions should be shared openly with everyone.",
    },
    {
      icon: "🚫",
      title: "No fake hype",
      description:
        "No paid shilling, misleading promises or coordinated pump-and-dump games.",
    },
    {
      icon: "🤝",
      title: "Respect the community",
      description:
        "Be helpful, stay honest and remember that everyone is responsible for their own decisions.",
    },
  ],
  socials: [
    {
      platform: "twitter",
      icon: "𝕏",
      url: "https://x.com/catszn_solana",
      label: "@catszn_solana",
    },
  ],
};

export const COIN: CoinConfig = {
  general: COIN_GENERAL,
  hero: COIN_HERO,
  about: COIN_ABOUT,
  tokenomics: COIN_TOKENOMICS,
  catCoins: COIN_CAT_COINS,
  howToBuy: COIN_BUY,
  community: COIN_COMMUNITY,
};
