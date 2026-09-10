import type { CoinConfig } from "./types";

// About
export const COIN_ABOUT: CoinConfig["about"] = {
  title: "WTF is Cat Season? 🐱",
  paragraphs: [
    "$CATSZN is more than a token — it's a movement. Born from the collective energy of thousands of cat lovers in the crypto space, Cat Season represents the unstoppable rise of feline culture on the blockchain.",
    "With zero taxes, a fully renounced contract, and a community that grows stronger every day, $CATSZN is the memecoin that doesn't need nine lives — one is enough to reach the moon. 🌙",
  ],
  tags: ["Zero Tax", "Community Driven", "LP Burned", "Renounced"],
  image: "/coins/catszn/about.jpeg",
};

// Tokenomics
export const COIN_TOKENOMICS: CoinConfig["tokenomics"] = {
  title: "Tokenomics 📊",
  items: [
    { label: "Total Supply", value: "1M" },
    { label: "Tax", value: "0%" },
    { label: "Contract", value: "Renounced ✅" },
  ],
  contractAddress: "CATSZNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  chain: "Solana",
};

export const COIN: CoinConfig = {
  name: "Cat Season",
  ticker: "$CATSZN",
  tagline: "Every season is cat season 🐱",
  description:
    "The purr-fect memecoin for cat lovers and degen enthusiasts. Community-driven, zero tax, 100% vibes.",
  logo: "/coins/catszn/logo.png",

  hero: {
    headline: "It's always Cat Season",
    subheadline:
      "Join the fluffiest community in crypto. No dogs allowed. $CATSZN is here to take over the blockchain, one purr at a time.",
    ctaLabel: "Buy $CATSZN Now 🚀",
    ctaUrl: "https://raydium.io/swap/?inputMint=sol&outputMint=CATSZN_ADDRESS",
  },

  about: COIN_ABOUT,
  tokenomics: COIN_TOKENOMICS,

  howToBuy: {
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
  },

  community: {
    title: "Join the Degen Army 🐾",
    description:
      "Cat Season is nothing without its community. Connect with fellow degens across the internet.",
    socials: [
      {
        platform: "twitter",
        url: "https://x.com/catszn_sol",
        label: "@catszn_sol",
      },
      {
        platform: "telegram",
        url: "https://t.me/catszn",
        label: "t.me/catszn",
      },
      {
        platform: "discord",
        url: "https://discord.gg/catszn",
        label: "Discord",
      },
    ],
  },

  footer: {
    disclaimer:
      "$CATSZN is a memecoin with no intrinsic value or expectation of financial return. It exists purely for entertainment purposes. Always do your own research.",
  },
};
