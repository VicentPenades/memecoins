<template>
  <v-menu
    location="bottom end"
    transition="scale-transition"
    :offset="6"
    :min-width="minWidth"
    content-class="mc-actions-menu"
  >
    <template #activator="{ props: menuProps }">
      <!-- Activador personalizable; por defecto, el botón kebab de tres puntos -->
      <slot name="activator" :props="menuProps">
        <v-btn
          icon
          variant="text"
          size="small"
          class="mc-actions-trigger rounded-lg"
          :title="$t('common.actionsMenu')"
          v-bind="menuProps"
        >
          <v-icon size="20">mdi-dots-vertical</v-icon>
        </v-btn>
      </slot>
    </template>
    <v-list :min-width="minWidth" density="compact" class="mc-menu-list-wrap">
      <template
        v-for="(item, index) in props.actionMenuItems"
        :key="item.label ?? `divider-${index}`"
      >
        <v-divider v-if="item.divider" class="my-1" />
        <v-list-item
          v-else
          :title="item.label"
          :subtitle="item.subtitle"
          :prepend-icon="item.prependIcon"
          :append-icon="item.appendIcon"
          :to="item.to"
          rounded="lg"
          @click="item.action?.()"
        />
      </template>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
type ActionMenuItem = {
  label?: string;
  subtitle?: string;
  prependIcon?: string;
  appendIcon?: string;
  // Enlace de navegación; si se define, el item actúa como <NuxtLink>
  to?: string;
  // Marca el item como separador (ignora el resto de campos)
  divider?: boolean;
  action?: () => void;
};

const props = withDefaults(
  defineProps<{
    actionMenuItems: ActionMenuItem[];
    minWidth?: number | string;
  }>(),
  { minWidth: 200 },
);
</script>

<style>
/* Botón activador (kebab): discreto, con hover sutil y color de acento al abrir */
.mc-actions-trigger {
  color: var(--text-secondary);
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    color: var(--mc-bw-text-primary);
    background-color: var(--mc-bw-gray-subtle);
  }
}

/* Contenedor flotante del menú: esquinas redondeadas y sombra suave */
.mc-actions-menu {
  border-radius: 12px;
  box-shadow:
    0 4px 6px -2px rgba(30, 35, 38, 0.08),
    0 10px 24px -4px rgba(30, 35, 38, 0.14);
  overflow: hidden;
}

.mc-menu-list-wrap {
  &.v-list {
    padding: 6px;
    background-color: var(--bg-main);

    .v-list-item {
      padding: 8px 12px;
      min-height: 40px;
      font-size: 14px;
      transition: background-color 0.15s ease;

      .v-list-item__prepend,
      .v-list-item__append {
        margin: 0px;
        padding: 0px !important;
        height: 18px;
        min-height: 18px;
        min-width: 18px;
        align-self: center;

        .v-list-item__spacer {
          display: none;
          width: 12px;
        }

        .v-icon,
        svg.v-icon {
          font-size: 18px;
          color: var(--mc-bw-grey-darken-1);
          transition: color 0.15s ease;
        }

        .v-chip__content {
          font-size: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
      }

      /* Separación entre icono y texto (compensa el spacer oculto) */
      .v-list-item__prepend {
        margin-inline-end: 12px;
      }

      .v-list-item__content {
        margin: 0px;
        padding: 0px;

        .v-list-item-title {
          color: var(--mc-bw-text-primary);
          font-size: 14px;
          font-weight: 500;
          line-height: normal;
        }

        .v-list-item-subtitle {
          color: var(--text-secondary);
          font-size: 10px;
        }
      }

      &::before,
      &::after {
        content: none;
      }
    }

    .v-list-item--active:not(.avoid-custom-active-class) {
      background-color: var(--mc-bw-gray-subtle) !important;
      .v-list-item-title {
        font-weight: 700 !important;
      }
    }

    .v-list-item:hover {
      background-color: var(--mc-bw-gray-subtle) !important;

      .v-list-item__prepend .v-icon,
      .v-list-item__prepend svg.v-icon {
        color: var(--primary);
      }
    }
  }
}
</style>
