<template>
  <v-app class="flex flex-col min-h-screen">
    <LayoutHeader />
    <main class="px-10 py-8 flex-1" :style="{ backgroundColor: '#EBEEEF' }">
      <slot />
    </main>
    <LayoutFooter />
  </v-app>
</template>
