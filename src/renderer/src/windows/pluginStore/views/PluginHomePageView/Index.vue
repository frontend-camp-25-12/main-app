<template>
    <div class="plugin-homepage-view-container">
        <Header></Header>
        <RouterView v-slot="{ Component }">
            <component :is="Component" />
        </RouterView>
    </div>
</template>

<script setup lang="ts">
import Header from "./Header/Index.vue";

</script>

<style scoped>
.plugin-homepage-view-container {
    height: 100vh;
}
</style>
