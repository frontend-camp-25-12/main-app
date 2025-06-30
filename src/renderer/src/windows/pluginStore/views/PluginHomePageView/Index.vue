<template>
    <div class="plugin-homepage-view-container">
        <Header></Header>
        <RouterView v-slot="{ Component }">
            <component :is="Component" @show-detail="handleShowDetail" />
        </RouterView>
    </div>
</template>

<script setup lang="ts">
import Header from "./Header/Index.vue";
import { useRouter } from "vue-router";

const router = useRouter()
function handleShowDetail(pluginId) {
    router.push({
        name: "PluginDetail",
        params: { pluginId }
    })
}
</script>

<style scoped></style>
