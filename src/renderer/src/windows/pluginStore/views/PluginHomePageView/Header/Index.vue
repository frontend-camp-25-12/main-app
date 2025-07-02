<template>
    <nav class="nav-bar">
        <div class="logo">
            <img width="36" height="36" src="/icon/icon-plugin-store.png" alt="Logo" style="margin: 8px;"/>
            <span>{{ t('pluginStore.title') }}</span>
        </div>
        <template v-if="route.name === 'PluginList'">
            <div class="upload-btn" @click="invokeFileChooseDialog">{{ t('pluginStore.uploadPlugin') }}</div>
            <input ref="fileInput" style="display: none" type="file" accept=".asar" @change="handlePluginUpload" />
            <!-- <div class="search-bar">
                <el-icon><Search /></el-icon>
                <input type="text" :placeholder="t('pluginStore.searchPlaceholder')" />
            </div> -->
        </template>
    </nav>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useRoute } from "vue-router";
import { pluginListReload } from "../../../utils/pluginListReload";
import { HOST } from "../../../api/plugin";
import { t } from '../../../../../utils/i18n';
import { ElIcon } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const route = useRoute()

//隐藏的input
const fileInput = useTemplateRef("fileInput");
//唤起文件选择框
function invokeFileChooseDialog(): void {
    fileInput.value?.click();
}


//上传插件
async function handlePluginUpload(e): Promise<void> {
    const file = e.target.files[0];

    if (!file) {
        alert(t('pluginStore.fileSelectError'));
        return;
    }

    // 检查文件类型
    if (!file.name.endsWith('.asar')) {
        ElMessage({
            message: t('pluginStore.fileTypeError'),
            type: 'warning',
            offset: 30
        });
        e.target.value = '';
        return;
    }

    const formData = new FormData();
    formData.append("plugin", file, file.name);

    try {
        const response = await fetch(`http://${HOST}/plugin`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            ElMessage({
                message: t('pluginStore.uploadSuccess', { name: result.originalname }),
                type: 'success',
                offset: 30
            })
            pluginListReload.value += 1;
        } else {
            throw new Error(result.error || "上传失败");
        }
    } catch (error: any) {
        console.error("上传错误:", error);
        ElMessage({
            message: t('pluginStore.uploadFailed', { name: file.name, error: error.message }),
            type: 'error',
            offset: 30
        })
    } finally {
        e.target.value = '';
    }
}
</script>

<style scoped>
/* 导航栏样式 */
.nav-bar {
    background: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-light);
    padding: 15px 40px;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    height: 70px;
    z-index: 100;
}

.upload-btn {
    padding: 7px 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s;
    white-space: nowrap;
    color: var(--el-color-primary);
}

.upload-btn:hover {
    background: var(--el-color-primary);
    color: var(--el-bg-color);
    border-color: var(--el-color-primary);
}

.logo {
    display: flex;
    align-items: center;
    font-size: 22px;
    font-weight: 700;
    color: var(--el-color-primary);
    margin-right: 30px;
}

.logo i {
    margin-right: 8px;
    font-size: 28px;
}



.search-bar {
    position: relative;
    margin-left: auto;
}

.search-bar input {
    width: 280px;
    padding: 10px 15px 10px 40px;
    border: 1px solid var(--el-border-color);
    border-radius: 20px;
    outline: none;
    transition: all 0.3s;
}

.search-bar input:focus {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 3px var(--el-color-primary-light-9);
}

.search-bar i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--el-text-color-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .nav-bar {
        padding: 12px 15px;
    }

    .search-bar input {
        width: 150px;
        font-size: 13px;
        padding-left: 35px;
    }

    .logo {
        font-size: 18px;
    }

    .logo i {
        font-size: 22px;
    }
}

@media (max-width: 480px) {
    .nav-bar {
        flex-wrap: wrap;
    }

    .search-bar {
        margin: 10px 0 0;
        width: 100%;
        order: 2;
    }

    .search-bar input {
        width: 100%;
    }
}
</style>
