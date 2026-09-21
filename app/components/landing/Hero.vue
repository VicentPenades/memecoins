<template>
  <CommonSection id="home" background-color="var(--bg-hero)">
    <!-- Capa de partículas de fondo (particles.js escribe su canvas aquí) -->
    <div
      id="hero-particles"
      class="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />

    <div
      class="relative z-10 grid w-full grid-cols-1 lg:grid-cols-2 items-center"
    >
      <div
        ref="gameContainer"
        class="relative h-[420px] w-full pointer-events-auto"
        role="img"
        aria-label="Interactive mini-game: feed the rocket cat with fish to stack more cats and send $CATSZN to the moon"
      />
      <div class="relative text-center">
        <CommonSectionHeader
          :title="COIN.hero.headline"
          heading-tag="h1"
          divider-class="mb-8"
        />

        <!-- TICKER & HEADLINE -->
        <CommonPill variant="hero">
          {{ COIN.general.ticker }}
        </CommonPill>

        <p
          v-for="(paragraph, i) in COIN.hero.subheadline"
          :key="i"
          class="text-base md:text-lg max-w-xl mx-auto mb-8"
          style="color: var(--text-muted)"
        >
          {{ paragraph }}
        </p>

        <CommonButton :href="COIN.hero.ctaUrl">
          {{ COIN.hero.ctaLabel }} →
        </CommonButton>
      </div>
    </div>
  </CommonSection>

  <Teleport to="body">
    <Transition name="pump-modal">
      <div
        v-if="isPumpModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        role="presentation"
        @click.self="closePumpModal"
        @keydown.esc="closePumpModal"
      >
        <section
          class="w-full max-w-md overflow-hidden rounded-3xl border p-6 text-center shadow-2xl sm:p-8"
          style="
            color: var(--text-primary);
            background: var(--bg-gradient);
            border-color: color-mix(
              in srgb,
              var(--primary) 35%,
              transparent
            );
            box-shadow: 0 0 80px
              color-mix(in srgb, var(--primary) 24%, transparent);
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="pump-modal-title"
          aria-describedby="pump-modal-description"
        >
          <div
            class="mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl text-5xl"
            style="
              background-color: color-mix(
                in srgb,
                var(--primary) 16%,
                transparent
              );
            "
            aria-hidden="true"
          >
            🚀
          </div>

          <p
            class="mb-2 text-xs font-black uppercase tracking-[0.25em]"
            style="color: var(--primary)"
          >
            Moon mission complete
          </p>
          <h2
            id="pump-modal-title"
            class="mb-3 text-3xl font-black sm:text-4xl"
          >
            The chart has spoken.
          </h2>
          <p
            id="pump-modal-description"
            class="mx-auto mb-7 max-w-sm text-sm leading-relaxed sm:text-base"
            style="color: var(--text-muted)"
          >
            You fed the cat. You summoned the green candles. Now join the new
            era of Cat Season.
          </p>

          <div class="flex flex-col gap-3">
            <a
              :href="COIN.hero.ctaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center rounded-2xl px-6 py-4 text-base font-black transition-transform duration-200 hover:scale-[1.02]"
              style="
                color: var(--text-inverse);
                background: linear-gradient(
                  to right,
                  var(--primary-light),
                  var(--primary)
                );
                box-shadow: 0 0 30px
                  color-mix(in srgb, var(--primary) 35%, transparent);
              "
              @click="closePumpModal"
            >
              Join the new era · Buy $CATSZN
            </a>
            <button
              type="button"
              class="rounded-2xl border px-6 py-3 text-sm font-bold transition-colors hover:border-[var(--text-muted)]"
              style="
                color: var(--text-muted);
                border-color: var(--border-default);
              "
              autofocus
              @click="closePumpModal"
            >
              No, I’m a dog 🐶
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import type { Game } from "phaser";
import { COIN } from "~/data/coin";

const gameContainer = ref<HTMLDivElement | null>(null);
const isPumpModalOpen = ref(false);
let phaserGame: Game | null = null;

const closePumpModal = () => {
  isPumpModalOpen.value = false;
};

// --- EFECTOS DE SONIDO SINTETIZADOS (Web Audio API) ---
// Se reutiliza un único AudioContext en lugar de crear uno nuevo por sonido.
// Safari antiguo expone el constructor como `webkitAudioContext`.
type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as WindowWithWebkitAudio).webkitAudioContext;
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
  } catch {
    // Audio no permitido sin interacción previa
  }
};

// --- PARTÍCULAS DE FONDO (particles.js de Vincent Garreau) ---
// La librería vive en app/assets/js y se auto-registra en `window.particlesJS`.
type ParticlesJS = (tagId: string, params: Record<string, unknown>) => void;

const initParticles = async (reducedMotion: boolean) => {
  await import("~/assets/js/particles.js");
  await nextTick();

  const particlesJS = (window as unknown as { particlesJS?: ParticlesJS })
    .particlesJS;
  if (!particlesJS || !document.getElementById("hero-particles")) return;

  particlesJS("hero-particles", {
    particles: {
      // Con "reduce motion" bajamos densidad y desactivamos el movimiento.
      number: {
        value: reducedMotion ? 30 : 70,
        density: { enable: true, value_area: 800 },
      },
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
      move: { enable: !reducedMotion, speed: 1.5, out_mode: "out" },
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

// --- MOTOR DEL JUEGO (PHASER 4) ---
onMounted(async () => {
  if (import.meta.server) return;

  // Respeta la preferencia del sistema de reducir animaciones.
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Fondo de partículas primero (no bloquea el resto del montaje).
  // Capturamos el error para que un fallo de la librería no quede en silencio.
  initParticles(reducedMotion).catch((error: unknown) => {
    console.error("Error inicializando las partículas del hero:", error);
  });

  const Phaser = (await import("phaser")).default;

  class CatGameScene extends Phaser.Scene {
    cat!: Phaser.GameObjects.Image;
    catShadow!: Phaser.GameObjects.Ellipse;
    feedStatus!: Phaser.GameObjects.Text;
    mouthZone!: Phaser.GameObjects.Zone;
    candle!: Phaser.GameObjects.Rectangle;
    moon!: Phaser.GameObjects.Container;
    // Gatos pasajeros que se apilan sobre el cohete (crecen al alimentar)
    passengerCats: Phaser.GameObjects.Text[] = [];
    feedCounter = 0;
    catBaseY = 0;
    catX = 0;
    // Cuánto sube el gato-cohete (en px) por cada pez comido
    climbPerFish = 34;
    // Número de peces necesarios para el evento pump
    feedGoal = 5;
    // Layout de la pila de gatos sobre el cohete
    maxPassengerRow = 3;
    passengerSpacingX = 32;
    passengerSpacingY = 30;
    passengerBaseOffsetY = -78;

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
      // Sin animación de flotación si el usuario prefiere menos movimiento.
      if (reducedMotion) {
        this.cat.y = baseY;
        this.cat.angle = 0;
        this.mouthZone.y = baseY;
        return;
      }
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

      // Luna en un contenedor para poder reposicionarla al redimensionar.
      this.moon = this.add
        .container(this.moonX(width), this.moonY(height), [
          this.add.circle(0, 0, 48, 0xfef3c7, 0.12),
          this.add
            .circle(0, 0, 36, 0xfef3c7)
            .setStrokeStyle(3, 0xfde68a, 0.8),
          this.add.circle(-12, -8, 7, 0xd6d3d1, 0.35),
          this.add.circle(13, 10, 5, 0xd6d3d1, 0.3),
          this.add.circle(10, -15, 4, 0xd6d3d1, 0.25),
        ])
        .setDepth(-1);

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

      // Zona de la boca (Detección de colisión), centrada en el gato
      this.mouthZone = this.add.zone(catX, catY + 10, 100, 100);

      // --- ANIMACIÓN IDLE: el cohete flota/se balancea suavemente ---
      this.startIdleFloat();

      // Primer gato pasajero sobre el cohete (la pila arranca con uno)
      this.addPassengerCat();

      // Crear pescados interactivos
      this.spawnFish();

      // Vela verde oculta por defecto
      this.candle = this.add
        .rectangle(width / 2, height + 100, 40, 0, 0x10b981)
        .setOrigin(0.5, 1);

      // Reposicionar elementos clave cuando cambia el tamaño del contenedor.
      this.scale.on("resize", this.handleResize, this);
      this.events.once("shutdown", () => {
        this.scale.off("resize", this.handleResize, this);
      });
    }

    // Posición de la luna en la esquina superior derecha, según el tamaño.
    moonX(width: number) {
      return width - Math.max(60, width * 0.1);
    }

    moonY(height: number) {
      return Math.max(60, height * 0.1);
    }

    handleResize(gameSize: Phaser.Structs.Size) {
      const width = gameSize.width;
      const height = gameSize.height;
      if (!width || !height) return;

      // Recolocar horizontalmente el cohete, su sombra y la zona de la boca.
      this.catX = width / 2;
      this.cat.x = this.catX;
      this.mouthZone.x = this.catX;
      this.catShadow.x = this.catX;

      // Luna y vela a sus nuevas posiciones.
      this.moon.setPosition(this.moonX(width), this.moonY(height));
      this.candle.x = width / 2;
    }

    // Añade un gato a la pila con un pequeño "pop" de entrada.
    addPassengerCat() {
      const passenger = this.add
        .text(this.cat.x, this.cat.y, "🐱", { fontSize: "30px" })
        .setOrigin(0.5)
        .setDepth(5);
      this.passengerCats.push(passenger);

      if (reducedMotion) {
        passenger.setScale(1);
        return;
      }
      passenger.setScale(0);
      this.tweens.add({
        targets: passenger,
        scale: 1,
        duration: 300,
        ease: "Back.easeOut",
      });
    }

    // Cada frame recoloca la pila de gatos relativa al cohete (pirámide).
    override update(time: number) {
      const total = this.passengerCats.length;
      this.passengerCats.forEach((passenger, index) => {
        const row = Math.floor(index / this.maxPassengerRow);
        const col = index % this.maxPassengerRow;
        const catsInRow = Math.min(
          this.maxPassengerRow,
          total - row * this.maxPassengerRow,
        );
        const dx = (col - (catsInRow - 1) / 2) * this.passengerSpacingX;
        const dy = this.passengerBaseOffsetY - row * this.passengerSpacingY;
        // Balanceo suave desfasado por gato (salvo "reduce motion")
        const bob = reducedMotion ? 0 : Math.sin(time / 300 + index) * 3;
        passenger.x = this.cat.x + dx;
        passenger.y = this.cat.y + dy + bob;
        passenger.setAngle(this.cat.angle * 0.5);
      });
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
      if (!reducedMotion) {
        this.tweens.add({
          targets: fish,
          y: startY - 8,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      // Evento Arrastrar (Drag)
      fish.on(
        "drag",
        (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
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
        },
      );

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

      // Cada pez comido suma un gato más a la pila del cohete
      this.addPassengerCat();

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
          isPumpModalOpen.value = true;

          // `delayedCall` está ligado al ciclo de vida de la escena: no dispara
          // sobre objetos destruidos si el componente se desmonta antes.
          this.time.delayedCall(3000, () => {
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
                // La pila de gatos vuelve a empezar con uno solo
                this.passengerCats.forEach((passenger) => passenger.destroy());
                this.passengerCats = [];
                this.addPassengerCat();
                // El cohete vuelve a su posición base para empezar de nuevo
                this.cat.y = this.catBaseY;
                this.catShadow.setAlpha(0.3);
                this.catShadow.setScale(1);
                this.startIdleFloat();
                this.spawnFish();
              },
            });
          });
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

<style scoped>
.pump-modal-enter-active,
.pump-modal-leave-active {
  transition:
    opacity 0.2s ease,
    backdrop-filter 0.2s ease;
}

.pump-modal-enter-active section,
.pump-modal-leave-active section {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.pump-modal-enter-from,
.pump-modal-leave-to,
.pump-modal-enter-from section,
.pump-modal-leave-to section {
  opacity: 0;
}

.pump-modal-enter-from section,
.pump-modal-leave-to section {
  transform: translateY(12px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .pump-modal-enter-active,
  .pump-modal-leave-active,
  .pump-modal-enter-active section,
  .pump-modal-leave-active section {
    transition: none;
  }
}
</style>
