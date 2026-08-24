<template>
  <div class="flex flex-col gap-4">
    <SectionVicTabs v-model="activeTab" :tabs="tabs">
      <template #pc>
        <UiFormFile
          :name="name"
          :mimes="mimes"
          :model-value="files"
          empty-area-class="mc-file-selector-drop"
          @update:model-value="onFileInput"
        />
      </template>

      <template #url>
        <VTextField
          v-model="url"
          label="URL"
          :placeholder="fromURLHint"
          variant="outlined"
          clearable
          class="mb-4"
        />
        <v-btn color="primary" @click="onUrlInput(url)" :disabled="!url">
          Aceptar URL
        </v-btn>
      </template>
    </SectionVicTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { urlToImageFile } from "@/app/utils/file";
import type { VicTab } from "~/app/components/section/VicTabs.vue";

const tabs: VicTab[] = [
  { value: "pc", text: "PC" },
  { value: "url", text: "URL" },
];

// Props
interface Props {
  name: string;
  mimes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  mimes: () => [],
});

// Emits
interface Emits {
  (e: "update:modelValue", value: File[]): void;
}

const emit = defineEmits<Emits>();

// Reactive variables
const activeTab = ref("pc");
const loading = ref(false);
const files = ref<File[]>([]);
const url = ref<string | undefined>(undefined);
const currentTab = ref<"computer" | "url">("computer");
const currentFilesFromOpener = ref<File[] | undefined>(undefined);
const currentUrlFromOpener = ref<string | undefined>(undefined);
// Computed properties
const urlValidationRules = computed(
  (): string | undefined | Record<string, any> => {
    const allowedExtension = props.mimes
      .map((mime) => mime.split("/")[1])
      .join(",");
    if (fileMimeType.value === "image")
      return {
        urlWithProtocol: true,
        validateImageExtension: { allowedExtension },
      };
    if (fileMimeType.value === "video") return "urlWithProtocol|videoFromUrl";
    if (fileMimeType.value === "application")
      return "urlWithProtocol|documentFromUrl";
    return undefined;
  },
);

const fromURLHint = computed((): string | undefined => {
  let hintKey;
  switch (fileMimeType.value) {
    case "image":
      hintKey = "Image";
      break;
    case "application":
      hintKey = "Document";
      break;
    case "video":
      hintKey = "Video";
      break;
  }

  if (hintKey) {
    return hintKey;
  }

  return undefined;
});

const fileMimeType = computed(
  (): "image" | "video" | "application" | undefined => {
    for (const mime of props.mimes) {
      const mimeStr = mime;
      if (mimeStr.startsWith("image")) {
        return "image";
      } else if (mimeStr.startsWith("video")) {
        return "video";
      } else if (mimeStr.startsWith("application")) {
        return "application";
      }
    }
    return undefined;
  },
);
// Methods
const onFileInput = (payload: File[]) => {
  files.value = payload;

  if (currentFilesFromOpener.value) {
    currentFilesFromOpener.value = payload.length ? payload : undefined;
  }

  emit("update:modelValue", files.value);
  console.log("Files accepted:", files.value);
};

const onUrlInput = async (payload?: string) => {
  if (currentUrlFromOpener.value) {
    currentUrlFromOpener.value = payload ?? undefined;
  }
  console.log(payload);
  const file = await urlToImageFile(payload as string);
  console.log("file", file);
  emit("update:modelValue", [file]);
};
</script>
<style>
.mc-file-selector-drop {
  min-height: 160px;
}
</style>
