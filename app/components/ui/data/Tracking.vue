<template>
  <v-card>
    <!-- Header con navegación -->
    <v-card-title v-if="showNavigation">
      <div class="flex justify-between items-center w-full">
        <span>Seguimiento semanal</span>
        <div class="flex items-center gap-4">
          <v-btn icon size="small" @click="handlePreviousPeriod">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <span class="text-body-1">{{ computedNavigationLabel }}</span>
          <v-btn icon size="small" @click="handleNextPeriod">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <!-- Header -->
          <thead>
            <tr>
              <th class="text-left py-2 px-4 border-b"></th>
              <th
                v-for="periodo in currentPeriod"
                :key="periodo.key"
                class="text-center py-2 px-2 border-b min-w-[80px]"
              >
                <div class="text-sm font-medium">{{ periodo.label }}</div>
                <div v-if="periodo.sublabel" class="text-xs text-grey">
                  {{ periodo.sublabel }}
                </div>
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
              class="border-b hover:bg-grey-lighten-4 transition-colors"
            >
              <!-- Nombre del item con acciones -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <v-chip
                    :color="item.color ?? undefined"
                    size="small"
                    variant="flat"
                    class="font-medium"
                  >
                    {{ item.titulo }}
                  </v-chip>
                  <div class="flex items-center gap-1">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="$emit('edit', item)"
                    >
                      <v-icon size="small">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="$emit('delete', item)"
                    >
                      <v-icon size="small">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
                <div
                  v-if="item.descripcion"
                  class="text-xs text-grey mt-1 ml-1"
                >
                  {{ item.descripcion }}
                </div>

                <!-- Progreso semanal opcional -->
                <div
                  v-if="showWeeklyProgress && getItemProgress"
                  class="mt-2 min-w-[200px]"
                >
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-grey">Progreso</span>
                    <span class="text-xs font-medium">
                      {{ getItemProgress(item).completed }}/{{
                        getItemProgress(item).goal
                      }}
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="getItemProgress(item).percentage"
                    :color="
                      getItemProgress(item).percentage >= 100
                        ? 'success'
                        : (item.color ?? undefined)
                    "
                    height="6"
                    rounded
                  >
                    <template v-if="getItemProgress(item).percentage >= 100">
                      <v-icon
                        size="x-small"
                        color="white"
                        class="progress-check"
                      >
                        mdi-check
                      </v-icon>
                    </template>
                  </v-progress-linear>
                </div>
              </td>

              <!-- Checkboxes/Controles para cada período -->
              <td
                v-for="periodo in currentPeriod"
                :key="`${item.id}-${periodo.key}`"
                class="text-center py-3 px-2"
              >
                <div class="flex justify-center">
                  <v-checkbox
                    v-if="isItemVisibleInPeriod(item, periodo)"
                    :model-value="isItemCompleted(item, periodo)"
                    @update:model-value="
                      $emit('toggle', item, periodo, $event ?? false)
                    "
                    hide-details
                    density="compact"
                    :color="item.color ?? undefined"
                  />
                  <span v-else class="text-grey-lighten-2">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="items.length === 0" class="text-center py-12">
        <p class="text-grey mt-4">{{ $t("common.noData") }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script
  setup
  lang="ts"
  generic="
    T extends {
      id: string | number;
      titulo: string;
      descripcion?: string | null;
      color?: string | null;
      [key: string]: any;
    },
    P extends {
      key: string | number;
      label: string;
      sublabel?: string;
      [key: string]: any;
    }
  "
>
// Props
const props = withDefaults(
  defineProps<{
    items: T[];
    showNavigation?: boolean;
    showWeeklyProgress?: boolean;
    // Item handlers
    isItemVisibleInPeriod: (item: T, periodo: P) => boolean;
    isItemCompleted: (item: T, periodo: P) => boolean;
    getItemProgress?: (item: T) => {
      completed: number;
      goal: number;
      percentage: number;
    };
  }>(),
  {
    showNavigation: false,
    showWeeklyProgress: false,
  },
);

// Emits
const emit = defineEmits<{
  periodChange: [periodStart: Date];
  edit: [item: T];
  delete: [item: T];
  toggle: [item: T, periodo: P, completed: boolean];
}>();

// State
const currentDay = ref<Date>(new Date());

// Computed
const currentPeriod = computed(() => {
  const weekStart = getStartOfWeek(currentDay.value);
  return getWeekDays(weekStart);
});

const computedNavigationLabel = computed(() => {
  return formatWeekLabel(currentDay.value);
});

// Methods
const handlePreviousPeriod = () => {
  currentDay.value = changeWeekPeriod(currentDay.value, -1);
  emit("periodChange", currentDay.value);
};

const handleNextPeriod = () => {
  currentDay.value = changeWeekPeriod(currentDay.value, 1);
  emit("periodChange", currentDay.value);
};

// Utils
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getWeekDays = (startDate: Date): P[] => {
  const days: any[] = [];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0] || "";
    const dayName = dayNames[date.getDay()] || "---";
    days.push({
      key: dateStr,
      fecha: dateStr,
      label: dayName,
      sublabel: dateStr,
      nombre: dayName,
      numero: date.getDate(),
    });
  }

  return days as P[];
};

const formatWeekLabel = (date: Date): string => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${
    end.getMonth() + 1
  }`;
};

const changeWeekPeriod = (current: Date, direction: number): Date => {
  const newDate = new Date(current);
  newDate.setDate(newDate.getDate() + direction * 7);
  return newDate;
};
</script>

<style scoped>
.progress-check {
  animation: checkBounce 0.3s ease-in-out;
}

@keyframes checkBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
