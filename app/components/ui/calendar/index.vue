<template>
  <div>
    <!-- Toolbar de navegación y vistas -->
    <div class="flex gap-2 items-center">
      <div>
        <v-btn icon @click="previousPeriod">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <v-btn icon @click="goToToday">
          <v-icon>mdi-calendar-today</v-icon>
        </v-btn>

        <v-btn icon @click="nextPeriod">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>

      <div class="font-bold">
        {{ currentPeriodTitle }}
      </div>
    </div>

    <!-- DÍAS DEL CALENDARIO -->
    <div class="rounded-lg border">
      <!-- Encabezados de días de la semana -->
      <div class="grid grid-cols-8">
        <div
          v-for="day in DIAS_DE_LA_SEMANA"
          :key="day"
          class="text-center font-semibold text-sm py-3 text-gray-700"
        >
          {{ day }}
        </div>
        <div class="text-center font-semibold text-sm py-3 text-gray-700">
          Resumen
        </div>
      </div>

      <!-- Días del año -->
      <div class="grid grid-cols-8">
        <template v-for="(item, index) in yearDaysWithSummary" :key="index">
          <!-- Día normal -->
          <div
            v-if="item.type === 'day'"
            class="viccalendar-day"
            :class="getDayBackgroundClasses(item.data)"
            @click="item.data && onYearContinuousClick(item.data)"
          >
            <template v-if="item.data">
              <!-- Cell header -->
              <div class="flex justify-between items-start mb-1">
                <div class="text-xs">
                  {{ item.data.monthName }}
                </div>
                <div
                  v-if="getDayEvents(item.data).length > 0"
                  class="text-xs font-semibold text-blue-600 bg-blue-100 rounded-full"
                >
                  {{ getDayEvents(item.data).length }}
                </div>
              </div>
              <!-- Cell day number -->
              <div
                class="text-lg font-semibold mb-1"
                :class="{ 'text-blue-600': isTodayFull(item.data) }"
              >
                {{ item.data.day }}
              </div>
              <!-- Cell events -->
              <div class="space-y-1 overflow-hidden">
                <div
                  v-for="(event, idx) in getDayEvents(item.data).slice(0, 2)"
                  :key="idx"
                  class="text-xs truncate px-1 py-0.5 rounded"
                  :style="{
                    backgroundColor: event.color || '#3b82f6',
                    color: 'white',
                  }"
                  :title="event.title"
                  @click="() => clickEvent(event)"
                >
                  {{ event.title }}
                </div>
                <div
                  v-if="getDayEvents(item.data).length > 2"
                  class="text-xs text-gray-500 px-1"
                  @click="clickMoreEvents"
                >
                  +{{ getDayEvents(item.data).length - 2 }} más
                </div>
              </div>
            </template>
          </div>

          <!-- Resumen de semana -->
          <div v-else-if="item.type === 'summary'" class="viccalendar-summary">
            <div class="text-xs text-gray-600 mb-1 font-semibold">
              Semana {{ item.weekNumber }}
            </div>
            <div
              v-if="item.weekEvents && item.weekEvents > 0"
              class="text-sm font-semibold text-blue-700"
            >
              {{ item.weekEvents }} evento{{ item.weekEvents > 1 ? "s" : "" }}
            </div>
            <div v-else class="text-xs text-gray-400">Sin eventos</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Types
interface CalendarEvent {
  title: string;
  start: Date;
  end?: Date;
  color?: string;
}

interface DayData {
  year: number;
  month: number;
  day: number;
  monthName: string;
  date: Date;
}

interface CalendarItem {
  type: "day" | "summary";
  data?: DayData | null;
  weekNumber?: number;
  weekEvents?: number;
}

// Props and Emits
const props = defineProps<{
  modelValue?: Date;
  events?: CalendarEvent[];
}>();

const emit = defineEmits<{
  "update:modelValue": [date: Date];
  "click:date": [date: Date];
  "click:event": [event: CalendarEvent];
}>();

// CONSTANTES
const DIAS_DE_LA_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// STATE
const selectedDate = ref(props.modelValue || new Date());

// COMPUTED

const currentPeriodTitle = computed(() => {
  return selectedDate.value.getFullYear().toString();
});

// Generar todos los días del año en formato continuo con resúmenes semanales
const yearDaysWithSummary = computed(() => {
  const year = selectedDate.value.getFullYear();
  const items: CalendarItem[] = [];
  let weekNumber = 1;
  let currentWeekDays: DayData[] = [];

  // Obtener el primer día del año
  const firstDayOfYear = new Date(year, 0, 1);
  const firstDayOfWeek = (firstDayOfYear.getDay() + 6) % 7; // Lunes = 0

  // Agregar espacios vacíos antes del primer día
  for (let i = 0; i < firstDayOfWeek; i++) {
    items.push({ type: "day", data: null });
  }

  // Agregar todos los días del año
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month, 1).toLocaleDateString("es-ES", {
      month: "short",
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData: DayData = {
        year,
        month,
        day,
        monthName,
        date: new Date(year, month, day),
      };

      items.push({ type: "day", data: dayData });
      currentWeekDays.push(dayData);

      // Al completar una semana (7 días), agregar resumen
      if (items.filter((i) => i.type === "day").length % 7 === 0) {
        const weekEvents = currentWeekDays.reduce((acc, d) => {
          return acc + countDayEvents(d, props.events);
        }, 0);

        items.push({
          type: "summary",
          weekNumber,
          weekEvents,
        });

        weekNumber++;
        currentWeekDays = [];
      }
    }
  }

  // Si quedaron días sin completar semana, agregar resumen final
  if (currentWeekDays.length > 0) {
    // Agregar celdas vacías para completar la semana
    const daysToComplete = 7 - currentWeekDays.length;
    for (let i = 0; i < daysToComplete; i++) {
      items.push({ type: "day", data: null });
    }

    const weekEvents = currentWeekDays.reduce((acc, d) => {
      return acc + countDayEvents(d, props.events);
    }, 0);

    items.push({
      type: "summary",
      weekNumber,
      weekEvents,
    });
  }

  return items;
});

// METHODS

// Clases y estilos
const getDayBackgroundClasses = (dayData: DayData | null | undefined) => {
  // Si no hay datos, marcar como "no-data"
  if (!dayData) {
    return "no-data";
  }

  let classes = [];

  // Alternar fondo según el mes (ejemplo: meses pares vs impares)
  if (dayData.month % 2 === 0) {
    classes.push("data-even-month");
  } else {
    classes.push("data-odd-month");
  }

  // Dia actual
  if (isTodayFull(dayData)) {
    classes.push("current-day");
  }

  // Fin de semana
  const dayOfWeek = dayData.date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    classes.push("weekend");
  }

  return classes.join(" ");
};

// Función auxiliar para contar eventos de un día
const countDayEvents = (
  dayData: DayData,
  events: CalendarEvent[] | undefined,
) => {
  if (!events || events.length === 0) return 0;

  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = event.end ? new Date(event.end) : eventStart;
    const currentDate = dayData.date;

    const currentDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const startDay = new Date(
      eventStart.getFullYear(),
      eventStart.getMonth(),
      eventStart.getDate(),
    );
    const endDay = new Date(
      eventEnd.getFullYear(),
      eventEnd.getMonth(),
      eventEnd.getDate(),
    );

    return currentDay >= startDay && currentDay <= endDay;
  }).length;
};

const isTodayFull = (dayData: DayData) => {
  const today = new Date();
  return (
    dayData.year === today.getFullYear() &&
    dayData.month === today.getMonth() &&
    dayData.day === today.getDate()
  );
};

const getDayEvents = (dayData: DayData) => {
  if (!props.events || props.events.length === 0) return [];

  return props.events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = event.end ? new Date(event.end) : eventStart;
    const currentDate = dayData.date;

    // Normalizar las fechas para comparar solo día/mes/año
    const currentDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const startDay = new Date(
      eventStart.getFullYear(),
      eventStart.getMonth(),
      eventStart.getDate(),
    );
    const endDay = new Date(
      eventEnd.getFullYear(),
      eventEnd.getMonth(),
      eventEnd.getDate(),
    );

    // Verificar si el día actual está dentro del rango del evento
    return currentDay >= startDay && currentDay <= endDay;
  });
};

//Event handlers
const onYearContinuousClick = (dayData: DayData) => {
  console.log("Día clicado:", dayData);
  selectedDate.value = dayData.date;
  emit("update:modelValue", dayData.date);
  emit("click:date", dayData.date);
};

const clickEvent = (event: CalendarEvent) => {
  console.log("Evento clicado:", event);
  emit("click:event", event);
};

const clickMoreEvents = () => {
  console.log("Clic en 'más eventos'");
  // Aquí podrías abrir un modal o desplegable con la lista completa de eventos del día
};

// Navegación entre períodos
const previousPeriod = () => {
  const date = new Date(selectedDate.value);
  date.setFullYear(date.getFullYear() - 1);
  selectedDate.value = date;
  emit("update:modelValue", date);
};

const nextPeriod = () => {
  const date = new Date(selectedDate.value);
  date.setFullYear(date.getFullYear() + 1);
  selectedDate.value = date;
  emit("update:modelValue", date);
};

const goToToday = () => {
  const today = new Date();
  selectedDate.value = today;
  emit("update:modelValue", today);
};

// WATCHERS
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedDate.value = newValue;
    }
  },
);
</script>

<style lang="scss" scoped>
.viccalendar-day {
  border: 1px solid #f3f4f6;
  padding: 0.5rem;
  min-height: 100px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.viccalendar-day.no-data {
  background-color: red;
  cursor: default;
}

.viccalendar-day.data-even-month {
  background-color: rgba(253, 224, 71, 0.3);
}
.viccalendar-day.data-odd-month {
  background-color: rgba(253, 224, 71, 0.1);
}

.viccalendar-day.current-day {
  background-color: rgba(59, 130, 246, 0.2);
}

.viccalendar-day.weekend {
}

.viccalendar-summary {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  min-height: 100px;
  background-color: #f9fafb;
}
</style>
