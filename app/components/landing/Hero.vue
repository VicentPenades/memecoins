<template>
  <CommonSection id="home" background-color="#020617">
    <div class="relative grid w-full grid-cols-1 lg:grid-cols-2 items-center">
      <div
        ref="gameContainer"
        class="relative h-[420px] w-full pointer-events-auto"
      />
      <div class="relative text-center">
        <CommonSectionHeader
          :title="COIN.hero.headline"
          heading-tag="h1"
          divider-class="mb-8"
        />

        <!-- TICKER & HEADLINE -->
        <CommonPill variant="hero">
          {{ COIN.ticker }}
        </CommonPill>

        <p class="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-8">
          {{ COIN.hero.subheadline }}
        </p>

        <CommonButton :href="COIN.hero.ctaUrl">
          {{ COIN.hero.ctaLabel }} →
        </CommonButton>
      </div>
    </div>
  </CommonSection>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { COIN } from "~/data/coin";

const gameContainer = ref<HTMLDivElement | null>(null);
let phaserGame: any = null;

// --- EFECTOS DE SONIDO SINTETIZADOS (Web Audio API) ---
// Se reutiliza un único AudioContext en lugar de crear uno nuevo por sonido.
let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx?.state === "suspended") audioCtx.resume();
  return audioCtx;
};

const playSound = (type: "eat" | "pump") => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "eat") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "pump") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    // Audio no permitido sin interacción previa
  }
};

// --- PARTÍCULAS DE FONDO (particles.js de Vincent Garreau) ---
// La librería vive en app/assets/js y se auto-registra en `window.particlesJS`.
type ParticlesJS = (tagId: string, params: Record<string, unknown>) => void;

const initParticles = async () => {
  await import("~/assets/js/particles.js");
  await nextTick();

  const particlesJS = (window as unknown as { particlesJS?: ParticlesJS })
    .particlesJS;
  if (!particlesJS || !document.getElementById("hero-particles")) return;

  particlesJS("hero-particles", {
    particles: {
      number: { value: 70, density: { enable: true, value_area: 800 } },
      color: { value: ["#f59e0b", "#10b981"] },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 140,
        color: "#f59e0b",
        opacity: 0.25,
        width: 1,
      },
      move: { enable: true, speed: 1.5, out_mode: "out" },
    },
    interactivity: {
      // La capa es pointer-events-none (no roba clics al juego), así que
      // el hover no recibe eventos: lo desactivamos para no dejar config muerta.
      detect_on: "canvas",
      events: {
        onhover: { enable: false },
        onclick: { enable: false },
        resize: true,
      },
    },
    retina_detect: true,
  });
};

// --- MOTOR DEL JUEGO (PHASER 3) ---
onMounted(async () => {
  if (import.meta.server) return;

  // Fondo de partículas primero (no bloquea el resto del montaje)
  initParticles();

  const Phaser = (await import("phaser")).default;

  class CatGameScene extends Phaser.Scene {
    cat!: Phaser.GameObjects.Image;
    catShadow!: Phaser.GameObjects.Ellipse;
    feedStatus!: Phaser.GameObjects.Text;
    mouthZone!: Phaser.GameObjects.Zone;
    candle!: Phaser.GameObjects.Rectangle;
    feedCounter = 0;
    catBaseY = 0;
    catX = 0;
    // Cuánto sube el gato-cohete (en px) por cada pez comido
    climbPerFish = 34;
    // Número de peces necesarios para el evento pump
    feedGoal = 5;

    constructor() {
      super({ key: "CatGameScene" });
    }

    preload() {
      this.load.image("rocketCat", "/coins/catszn/rocket-cat.png");
    }

    startIdleFloat() {
      this.startIdleFloatAt(this.cat.y);
    }

    startIdleFloatAt(baseY: number) {
      this.tweens.killTweensOf(this.cat);
      this.tweens.add({
        targets: this.cat,
        y: baseY - 8,
        angle: 3,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        onUpdate: () => {
          this.mouthZone.y = this.cat.y;
        },
      });
    }

    create() {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      const catX = width / 2;
      const catY = height * 0.62;
      this.catX = catX;
      this.catBaseY = catY;

      const moonX = width - Math.max(60, width * 0.1);
      const moonY = Math.max(60, height * 0.1);
      this.add.circle(moonX, moonY, 48, 0xfef3c7, 0.12).setDepth(-2);
      this.add
        .circle(moonX, moonY, 36, 0xfef3c7)
        .setStrokeStyle(3, 0xfde68a, 0.8)
        .setDepth(-1);
      this.add.circle(moonX - 12, moonY - 8, 7, 0xd6d3d1, 0.35).setDepth(-1);
      this.add.circle(moonX + 13, moonY + 10, 5, 0xd6d3d1, 0.3).setDepth(-1);
      this.add.circle(moonX + 10, moonY - 15, 4, 0xd6d3d1, 0.25).setDepth(-1);

      this.feedStatus = this.add
        .text(18, 18, `FEED THE CAT · 0/${this.feedGoal}`, {
          fontFamily: "monospace",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#fef3c7",
          backgroundColor: "#0f172acc",
          padding: { x: 10, y: 6 },
        })
        .setDepth(20);

      // Sombra/estela bajo el gato (se difumina a medida que el cohete sube)
      this.catShadow = this.add.ellipse(catX, catY + 78, 90, 18, 0x000000, 0.3);

      // Avatar: gato montado en cohete (imagen proporcionada por el usuario)
      this.cat = this.add
        .image(catX, catY, "rocketCat")
        .setOrigin(0.5)
        .setDisplaySize(320, 174.4)
        .setInteractive();

      // --- ANIMACIÓN IDLE: el cohete flota/se balancea suavemente ---
      this.startIdleFloat();

      // Zona de la boca (Detección de colisión), centrada en el gato
      this.mouthZone = this.add.zone(catX, catY + 10, 100, 100);

      // Crear pescados interactivos
      this.spawnFish();

      // Vela verde oculta por defecto
      this.candle = this.add
        .rectangle(width / 2, height + 100, 40, 0, 0x10b981)
        .setOrigin(0.5, 1);
    }

    spawnFish() {
      // Generar pescado siempre a la derecha del gato, bien separado
      const startX = this.cat.x + 190;
      const startY = this.cat.y;
      const fish = this.add
        .text(startX, startY, "🐟", {
          fontSize: "50px",
        })
        .setOrigin(0.5)
        .setFlipX(true)
        .setInteractive({ draggable: true, useHandCursor: true });

      // Suave flotación mientras espera a ser arrastrado
      this.tweens.add({
        targets: fish,
        y: startY - 8,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Evento Arrastrar (Drag)
      fish.on("drag", (pointer: any, dragX: number, dragY: number) => {
        this.tweens.killTweensOf(fish);
        fish.x = dragX;
        fish.y = dragY;

        // Comprobar si está cerca de la boca
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            fish.getBounds(),
            this.mouthZone.getBounds(),
          )
        ) {
          this.eatFish(fish);
        }
      });

      // Si se suelta sin llegar a la boca, vuelve a su sitio
      fish.on("dragend", () => {
        if (!fish.active) return;
        this.tweens.add({
          targets: fish,
          x: startX,
          y: startY,
          duration: 300,
          ease: "Back.easeOut",
        });
      });

      // También se puede tocar/clicar para comerlo (accesibilidad y móvil)
      fish.on("pointerdown", () => {
        this.tweens.killTweensOf(fish);
        this.tweens.add({
          targets: fish,
          x: this.cat.x,
          y: this.cat.y,
          scale: 0.3,
          duration: 200,
          ease: "Cubic.easeIn",
          onComplete: () => this.eatFish(fish),
        });
      });
    }

    eatFish(fish: Phaser.GameObjects.Text) {
      if (!fish.active) return; // evita comer el mismo pez dos veces
      this.tweens.killTweensOf(fish);
      fish.destroy();
      playSound("eat");

      this.feedCounter++;
      this.feedStatus.setText(
        `FEED THE CAT · ${this.feedCounter}/${this.feedGoal}`,
      );

      // El cohete asciende un poco más con cada pez comido
      this.tweens.killTweensOf(this.cat);
      const newBaseY = this.catBaseY - this.climbPerFish * this.feedCounter;
      this.tweens.add({
        targets: [this.cat, this.mouthZone],
        y: newBaseY,
        duration: 350,
        ease: "Cubic.easeOut",
        onUpdate: () => {
          // La sombra se aleja y se difumina cuanto más alto vuela
          const distance = this.catBaseY - this.cat.y;
          this.catShadow.setAlpha(Math.max(0.05, 0.3 - distance / 400));
          this.catShadow.setScale(Math.max(0.4, 1 - distance / 300));
        },
        onComplete: () => {
          this.startIdleFloatAt(newBaseY);
        },
      });

      // Feedback visual del cohete al comer (pequeño "impulso" + pulso de escala)
      this.tweens.add({
        targets: this.cat,
        scaleX: this.cat.scaleX * 1.15,
        scaleY: this.cat.scaleY * 1.15,
        duration: 120,
        yoyo: true,
      });

      const isMoonShot = this.feedCounter === this.feedGoal;
      const popText = this.add
        .text(
          this.cat.x,
          this.cat.y - 90,
          isMoonShot ? "MOOOOOOOON" : "+500 $CATSZN",
          {
            fontSize: isMoonShot ? "30px" : "20px",
            color: isMoonShot ? "#22c55e" : "#f59e0b",
            fontStyle: "bold",
          },
        )
        .setOrigin(0.5);

      this.tweens.add({
        targets: popText,
        y: popText.y - 50,
        opacity: 0,
        duration: 600,
        onComplete: () => popText.destroy(),
      });

      // Si no ha llegado al objetivo, saca otro pescado
      if (this.feedCounter < this.feedGoal) {
        this.spawnFish();
      } else {
        // MEGA EVENTO: PUMP GOD CANDLE
        this.triggerPumpEvent();
      }
    }

    triggerPumpEvent() {
      playSound("pump");
      this.tweens.killTweensOf(this.cat);

      // El cohete acelera de emoción hacia arriba
      this.tweens.add({
        targets: this.cat,
        y: this.cat.y - 30,
        duration: 250,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeOut",
      });

      // Temblor de pantalla (Screen Shake)
      this.cameras.main.shake(1500, 0.01);

      // Crecimiento de la Vela Verde
      this.candle.y = this.cameras.main.height - 20;
      this.candle.setDepth(10);

      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      const barsCount = 8;
      const spacing = width / (barsCount + 1);
      const barWidth = Math.max(18, Math.min(32, spacing * 0.45));
      const bars: Phaser.GameObjects.Rectangle[] = [];

      for (let i = 0; i < barsCount; i++) {
        const barMaxHeight = Phaser.Math.Between(
          Math.round(height * 0.55),
          Math.round(height * 0.95),
        );
        const bar = this.add
          .rectangle(
            spacing * (i + 1),
            height - 20,
            barWidth,
            barMaxHeight,
            0x22c55e,
            1,
          )
          .setOrigin(0.5, 1)
          .setStrokeStyle(3, 0x86efac, 1)
          .setDepth(9)
          .setScale(1, 0.01);
        bars.push(bar);
        this.tweens.add({
          targets: bar,
          scaleY: 1,
          duration: 600 + i * 80,
          delay: i * 60,
          ease: "Cubic.easeOut",
        });
      }

      this.tweens.add({
        targets: this.candle,
        height: 280,
        duration: 1500,
        ease: "Bounce.easeOut",
        onComplete: () => {
          setTimeout(() => {
            // Reset tras la animación
            this.tweens.add({
              targets: bars,
              scaleY: 0,
              duration: 500,
            });
            this.tweens.add({
              targets: this.candle,
              height: 0,
              duration: 500,
              onComplete: () => {
                bars.forEach((bar) => bar.destroy());
                this.feedCounter = 0;
                this.feedStatus.setText(`FEED THE CAT · 0/${this.feedGoal}`);
                // El cohete vuelve a su posición base para empezar de nuevo
                this.cat.y = this.catBaseY;
                this.catShadow.setAlpha(0.3);
                this.catShadow.setScale(1);
                this.startIdleFloat();
                this.spawnFish();
              },
            });
          }, 3000);
        },
      });
    }
  }

  const container = gameContainer.value;
  if (!container) {
    throw new Error("No se ha encontrado el contenedor del juego");
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: container,
    width: container.clientWidth,
    height: container.clientHeight,
    transparent: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      mouse: { preventDefaultWheel: false },
      touch: { capture: false },
    },
    physics: { default: "arcade" },
    scene: [CatGameScene],
  };

  phaserGame = new Phaser.Game(config);
});

onUnmounted(() => {
  if (phaserGame) phaserGame.destroy(true);
  if (audioCtx) audioCtx.close();
});
</script>
