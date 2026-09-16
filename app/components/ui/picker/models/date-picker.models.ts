// Forma mínima del día que emite v-calendar en @dayclick (solo usamos `date`).
// v-calendar no expone su tipo `CalendarDay` en el entry point público.
export interface CalendarDay {
  date: Date;
}

// Rango de fechas seleccionado por el picker de rango. `null` en start/end
// mientras el rango se está construyendo (v-calendar rellena start antes que end).
export interface DateRange {
  start: Date | null;
  end: Date | null;
}
