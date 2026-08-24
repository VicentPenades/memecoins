<template>
  <v-data-table
    class="vic-table"
    :items="items"
    :headers="headers"
    :loading="loading"
    :search="search"
    :items-per-page="itemsPerPage"
    :hide-default-header="hideHeader"
    :hide-default-footer="hideFooter"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>

    <!-- Empty state genérico: distingue "sin datos" (dataset vacío) de
         "sin resultados" (hay datos pero los filtros no devuelven nada).
         Se puede sobreescribir pasando el slot #no-data desde el consumidor. -->
    <template v-if="!$slots['no-data']" #no-data>
      <SectionEmptystateData
        v-if="hasSourceData"
        :title="noResultsTitle ?? t('common.noResults')"
        :description="noResultsDescription"
        :icon-id="noResultsIconId"
      />
      <SectionEmptystateData
        v-else
        :title="emptyTitle ?? t('common.noData')"
        :description="emptyDescription"
        :icon-id="emptyIconId"
      />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
// Enlazamos $attrs explícitamente al v-data-table (clases, @click:row, etc.),
// así que desactivamos la herencia automática para no aplicarlos dos veces.
defineOptions({ inheritAttrs: false });

interface Header {
  title: string;
  key: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  width?: string | number;
}

const props = withDefaults(
  defineProps<{
    items: any[];
    headers: Header[];
    loading?: boolean;
    search?: string;
    itemsPerPage?: number;
    hideHeader?: boolean;
    hideFooter?: boolean;
    // Recuento del dataset SIN filtrar. Si `items` está vacío pero esto es > 0,
    // el empty state muestra la variante "sin resultados" en vez de "sin datos".
    totalItems?: number;
    // Textos/icono del estado "sin datos" (dataset vacío). Por defecto genéricos.
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIconId?: string;
    // Textos/icono del estado "sin resultados" (tras filtrar). Por defecto genéricos.
    noResultsTitle?: string;
    noResultsDescription?: string;
    noResultsIconId?: string;
  }>(),
  {
    loading: false,
    search: "",
    itemsPerPage: 10,
    hideHeader: false,
    hideFooter: false,
    totalItems: 0,
    emptyTitle: undefined,
    emptyDescription: undefined,
    emptyIconId: "mdi-database-outline",
    noResultsTitle: undefined,
    noResultsDescription: undefined,
    noResultsIconId: "mdi-magnify",
  },
);

const { t } = useI18n();

// El slot #no-data solo se renderiza cuando no hay filas: si además el dataset
// original tenía elementos, la ausencia se debe al filtrado.
const hasSourceData = computed(() => props.totalItems > 0);
</script>

<style lang="scss">
/* Vic table */
.vic-table {
  table {
    border-spacing: 0 4px !important;
    border-collapse: separate;
    background-color: var(--mc-bw-gray-subtle) !important;

    thead tr th {
      height: 24px !important;
      border: none !important;
    }
    tbody tr {
      height: 64px !important;
    }
    tbody {
      > tr > td {
        border-bottom: 1px solid var(--border-default) !important;
        border-top: 1px solid var(--border-default) !important;
        background-color: #fff;
      }
      > tr:not(:last-child) > td {
        border-bottom: none;
      }
      > tr > td:first-child {
        border-top-left-radius: 9px !important;
        border-bottom-left-radius: 9px !important;
        border-left: 1px solid var(--border-default);
      }

      > tr > td:last-child {
        border-top-right-radius: 9px !important;
        border-bottom-right-radius: 9px !important;
        border-right: 1px solid var(--border-default);
      }
    }
  }

  .v-data-table--has-bottom > .v-table__wrapper > table > tbody {
    & > tr:first-child:hover {
      & > td:first-child {
        border-top-left-radius: 9px !important;
      }

      & > td:last-child {
        border-top-right-radius: 9px !important;
      }
    }
    & > tr:last-child:hover {
      & > td:first-child {
        border-bottom-left-radius: 9px !important;
      }

      & > td:last-child {
        border-bottom-right-radius: 9px !important;
      }
    }
  }

  .v-data-table-footer {
    background-color: var(--mc-bw-gray-subtle) !important;
  }

  .v-divider:has(+ .v-data-table-footer),
  .v-divider:has(+ .v-data-table-header) {
    display: none;
  }
}
</style>
