// Modelos del componente de filtros (FilterMenu / FilterMenuOption).
// Los ids de las opciones pueden ser string o number según el dominio.

export type FilterOptionId = string | number;

export type FilterOption<IdType extends FilterOptionId = FilterOptionId> = {
  id: IdType;
  label: string;
  icon?: string;
  active: boolean;
  // Contador opcional de resultados que mostrar junto a la opción
  resultsCount?: number;
};

export type FilterSection<IdType extends FilterOptionId = FilterOptionId> = {
  id: string;
  label?: string;
  help?: string;
  className?: string;
  // Si es true, la sección se comporta como radio (una sola opción activa)
  singleSelect?: boolean;
  options: FilterOption<IdType>[];
};

// Mapa plano "sectionId+optionId" -> seleccionado. También guarda el estado
// agregado de cada sección bajo su propio id.
export type FiltersMap = Record<string, boolean>;
