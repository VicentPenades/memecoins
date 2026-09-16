<template>
  <div>
    <div
      ref="wrapperRef"
      class="relative flex items-center justify-center rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--mc-bw-gray-subtle)] cursor-pointer hover:bg-[var(--bg-nav)] transition-colors"
      :class="{
        'flex-col gap-1 p-3 min-h-[80px] h-auto': dropzone,
        'h-20': !dropzone,
        'border-[var(--error)]': isRequired && !modelValue,
        'border-solid': isDragging,
        'opacity-30 pointer-events-none': disabled,
      }"
      @drag.stop.prevent
      @dragstart.stop.prevent
      @dragover.stop.prevent="onDragIn"
      @dragenter.stop.prevent="onDragIn"
      @dragend.stop.prevent="onDragOut"
      @dragleave.stop.prevent="onDragOut"
      @drop.stop.prevent="
        onDragOut();
        change($event);
      "
    >
      <slot name="label" v-bind="{ name, image, remove }">
        <label
          :for="name"
          class="cursor-pointer flex flex-col items-center justify-center w-full h-full relative"
        >
          <template v-if="loading">
            <v-progress-circular
              size="20"
              width="2"
              indeterminate
              color="primary"
            />
            <span class="text-xs text-[var(--text-secondary)]">
              {{ $t("common.uploading") }}
            </span>
          </template>

          <template v-else-if="image">
            <div
              class="relative inline-block"
              :class="{ 'absolute inset-0 block': !dropzone }"
            >
              <img
                :src="image"
                :alt="name"
                class="object-contain"
                :class="dropzone ? 'max-h-12 max-w-[200px]' : 'w-full h-full'"
              />
              <v-btn
                v-if="showCloseButton"
                icon
                size="x-small"
                color="primary"
                class="absolute -top-1.5 -right-1.5"
                :aria-label="$t('common.remove')"
                @click.stop.prevent="remove"
              >
                <v-icon size="12">mdi-close</v-icon>
              </v-btn>
            </div>
          </template>

          <template v-else>
            <v-icon size="24" class="text-[var(--text-secondary)]">
              mdi-cloud-upload-outline
            </v-icon>
            <span
              class="text-xs text-[var(--text-secondary)]"
              :class="{ 'font-bold underline': dropzone }"
            >
              {{ ctaText ?? $t("common.selectFile") }}
            </span>
          </template>
        </label>
      </slot>

      <input
        :id="name"
        type="file"
        :accept="mimes.join(',')"
        :name="name"
        class="hidden"
        @change="change"
      />
    </div>

    <div class="flex justify-between">
      <span
        v-if="footerDescription"
        class="text-xs text-[var(--text-secondary)]"
      >
        {{ footerDescription }}
      </span>
      <span
        v-if="isRequired && !modelValue"
        class="text-xs text-[var(--error)]"
      >
        {{ $t("common.required") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
type ImageValue = string | File | null;

const props = withDefaults(
  defineProps<{
    name?: string;
    footerDescription?: string;
    isRequired?: boolean;
    showCloseButton?: boolean;
    modelValue?: ImageValue;
    fallbackImage?: string | null;
    mimes?: string[];
    disabled?: boolean;
    loading?: boolean;
    ctaText?: string;
    dropzone?: boolean;
  }>(),
  {
    name: "avatar",
    footerDescription: undefined,
    isRequired: false,
    showCloseButton: true,
    modelValue: null,
    fallbackImage: null,
    mimes: () => ["image/png", "image/x-png", "image/jpeg"],
    disabled: false,
    loading: false,
    ctaText: undefined,
    dropzone: false,
  },
);

const emit = defineEmits<{
  (e: "update:model-value", value: File | string | null): void;
}>();

const { t: $t } = useI18n();

const wrapperRef = ref<HTMLElement>();
const file = ref<File | null>(null);
const isDragging = ref(false);
const image = ref<string | null>(
  typeof props.modelValue === "string" ? props.modelValue : null,
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (typeof newValue === "string") image.value = newValue;
    else if (newValue === null) image.value = null;
  },
);

watch(file, (newFile) => {
  image.value = newFile ? URL.createObjectURL(newFile) : null;
});

const change = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const dataTransfer = (event as DragEvent).dataTransfer;
  const files = target?.files ?? dataTransfer?.files ?? null;
  const selected = files?.[0];
  if (!selected) return;

  if (!props.mimes.includes(selected.type)) {
    console.error("Tipo de archivo no permitido:", selected.type);
    return;
  }
  emit("update:model-value", selected);
  file.value = selected;
};

const remove = () => {
  file.value = null;
  image.value = props.fallbackImage ?? null;
  emit("update:model-value", props.fallbackImage ?? null);
};

const onDragIn = () => {
  isDragging.value = true;
};
const onDragOut = () => {
  isDragging.value = false;
};
</script>
