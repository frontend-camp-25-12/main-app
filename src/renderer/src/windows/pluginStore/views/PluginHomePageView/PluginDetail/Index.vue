<template>
    <div class="plugin-detail-view-container">
        <div id="plugin-detail-page">
            <button class="back-btn" @click="backToList">
                <i class="fas fa-arrow-left"></i> 返回应用市场
            </button>

            <div class="detail-header">
                <div class="plugin-icon-lg">
                    <i :class="plugin.logo"></i>
                </div>
                <div class="plugin-info-lg">
                    <h1>{{ plugin.name }}</h1>
                    <div class="plugin-author">由 CodeForces 开发</div>
                    <div>{{ plugin.description }}</div>

                    <div class="plugin-actions">
                        <button :disabled="isDownloading" :class="installBtnClass" v-if="!installed" class="action-btn"
                            @click="handleDownload">
                            <i class="fas fa-download"></i>
                            {{ isDownloading ? `${downloadProgress}%` : '安装' }}
                        </button>
                        <template v-else>
                            <button v-if="!isEnable" class="action-btn install-btn" @click="handleEnablePlugin">
                                启用
                            </button>
                            <button v-else class="action-btn install-btn" @click="handleDisablePlugin">
                                禁用
                            </button>
                            <button class="action-btn uninstall-btn" @click="handleUninstall">
                                <i class="fa-solid fa-circle-minus"></i>
                                卸载
                            </button>
                        </template>
                    </div>
                </div>
            </div>

            <div class="detail-content">
                <div class="main-content">
                    <div class="section">
                        <h2 class="section-title">应用详情</h2>
                        <p>
                            {{ plugin.description }}
                        </p>

                        <h3 style="margin: 15px 0 8px; font-size: 16px">主要功能</h3>
                        <ul style="padding-left: 20px; line-height: 1.7">
                            <li>高效完成特定任务</li>
                            <li>支持多种操作方式</li>
                            <li>自定义设置选项</li>
                            <li>快捷键操作</li>
                            <li>支持多种文件格式</li>
                        </ul>
                    </div>

                    <!-- <div class="section">
                        <h2 class="section-title">应用截图</h2>
                        <div class="screenshots">
                            <div class="screenshot"></div>
                            <div class="screenshot"></div>
                            <div class="screenshot"></div>
                        </div>
                    </div> -->

                    <div class="section">
                        <h2 class="section-title">详细信息</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">版本号</div>
                                <div class="info-value">v{{ plugin.version }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">更新日期</div>
                                <div class="info-value">2025-08-10</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">文件大小</div>
                                <div class="info-value">{{ size }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">开发者</div>
                                <div class="info-value">CodeForces</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">支持系统</div>
                                <div class="info-value">Windows/MacOS/Linux</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">评分</div>
                                <div class="info-value">
                                    {{ plugin.rating }}/10 (1,258个评分)
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">下载量</div>
                                <div class="info-value">
                                    {{ formatDownloads }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar">
                        <div class="section sidebar-card">
                            <h2 class="section-title">标签</h2>
                            <div class="tags">
                                <div class="tag">{{ plugin.category }}</div>
                                <div class="tag">高效工具</div>
                                <div class="tag">实用工具</div>
                                <div class="tag">必备应用</div>
                                <div class="tag">生产力</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { getPluginInfoById } from '../../../api/plugin'
//router实例
const router = useRouter();

//从route得到的pluginId，用于请求服务器插件信息，在router配置里设置了props为true会自动注入到props里，实际是从route传过来的
const { pluginId } = defineProps(["pluginId"]);

const plugin = ref({});
const pluginMetadata = ref({})
//通过pluginId请求插件信息
getPluginInfoById(pluginId).then((data) => {
    plugin.value = data
})

//插件是否已安装
const installed = ref(false);
//插件是否已启用
const isEnable = ref(false)
isInstalled(pluginId)

//判断当前插件是否已安装
async function isInstalled(pluginId) {
    const installedPlugins = await window.ipcApi.pluginList()
    if (pluginId in installedPlugins) {
        installed.value = true
        pluginMetadata.value = installedPlugins[pluginId]
        console.log(pluginMetadata.value)
        //如果已经安装，判断插件是否运行
        isEnable.value = !pluginMetadata.value.disabled
        console.log(isEnable.value)
    } else {
        installed.value = false
    }
}

const emit = defineEmits(["back-to-list", "toggle-favorite"]);



//格式化下载量
const formatDownloads = computed(() => {
    if (plugin.value.download >= 10000) {
        return `${(plugin.value.download / 10000).toFixed(1)}万`;
    }
    return plugin.value.download;
});
const isDownloading = ref(false)

const installBtnClass = computed(() => ({
    'install-btn': !isDownloading.value,
    'downloading-btn': isDownloading.value,
}))

const size = computed(() => {
    let bytes = plugin.value.size
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    // 计算最合适的单位索引
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // 格式化为保留指定位数的小数，并移除多余的零
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)).toString() + ' ' + units[i];
})
const downloadProgress = ref(0)

//通知主进程下载插件
async function handleDownload() {
    isDownloading.value = true
    window.ipcApi.onPluginDownloadProgress((progress) => {
        downloadProgress.value = progress
    })
    await window.ipcApi.pluginFetchInstall(pluginId)
}

async function handleEnablePlugin() {
    await window.ipcApi.pluginEnable(pluginId)
    await isInstalled(pluginId)
}

async function handleDisablePlugin() {
    await window.ipcApi.pluginDisable(pluginId)
    await isInstalled(pluginId)
}

//卸载插件
async function handleUninstall() {
    await window.ipcApi.pluginRemove(pluginId)
    ElMessage({
        message: `插件${plugin.value.name} 卸载成功`,
        type: 'success',
        offset: 30
    })
    installed.value = false

}

//返回插件市场
function backToList(): void {
    router.go(-1);
}
//切换收藏状态
function toggleFavorite(): void {
    emit("toggle-favorite", plugin.value);
}
</script>

<style scoped>
#plugin-detail-page {
    animation: slideIn 0.4s;
    padding: 30px;
}

.back-btn {
    border: none;
    display: flex;
    align-items: center;
    color: var(--primary-color);
    font-size: 15px;
    cursor: pointer;
    padding: 10px 0;
    font-weight: 500;
    transition: all 0.3s;
}

.back-btn i {
    margin-right: 6px;
    font-size: 18px;
}

.back-btn:hover {
    opacity: 0.8;
}

.detail-header {
    background: linear-gradient(135deg, #4776e6, #8e54e9);
    border-radius: 12px;
    color: white;
    padding: 25px;
    display: flex;
    position: relative;
    overflow: hidden;
    margin-bottom: 25px;
}

.detail-header::before {
    content: "";
    position: absolute;
    top: -40px;
    right: -40px;
    width: 180px;
    height: 180px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

/* 详情页应用图标 */
.plugin-icon-lg {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin-right: 20px;
    flex-shrink: 0;
}

.plugin-info-lg h1 {
    font-size: 24px;
    margin-bottom: 8px;
}

.plugin-author {
    margin-bottom: 12px;
    opacity: 0.9;
    font-size: 14px;
}

.plugin-info-lg p {
    font-size: 14px;
    line-height: 1.5;
}

.plugin-actions {
    display: flex;
    gap: 12px;
    margin-top: 18px;
}

.action-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    font-size: 14px;
}

.install-btn {
    border: 0;
    background: white;
    color: var(--primary-color);
    font-weight: 600;
}

.install-btn:hover {
    color: white;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    background-color: var(--primary-color);
}

.downloading-btn {
    border: 0;
    background: var(--dark-gray);
    font-weight: 600;
    color: white;
    cursor: not-allowed;
}

.uninstall-btn {
    border: 0;
    background: white;
    color: var(--danger-color);
    font-weight: 600;
}

.uninstall-btn:hover {
    background: var(--danger-color);
    color: white;
    font-weight: 600;
}

.action-btn i {
    margin-right: 6px;
    font-size: 16px;
}

.section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow);
    margin: 10px 0;
}

.section-title {
    font-size: 18px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--medium-gray);
    font-weight: 600;
}

.screenshots {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
}

.screenshot {
    min-width: 240px;
    height: 150px;
    background: #ddd;
    border-radius: 8px;
    flex-shrink: 0;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
}

.info-item {
    margin-bottom: 12px;
}

.info-label {
    font-weight: 500;
    color: var(--dark-gray);
    font-size: 13px;
}

.info-value {
    font-size: 14px;
    font-weight: 500;
    margin-top: 4px;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0;
}

.tag {
    background: var(--light-gray);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
}

.review {
    padding: 12px 0;
    border-bottom: 1px solid var(--medium-gray);
    font-size: 14px;
}

.review:last-child {
    border-bottom: none;
}

.review-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
}

.reviewer {
    font-weight: 500;
}

.rating {
    color: #ffdc00;
    font-size: 14px;
}

.sidebar-card {
    margin-bottom: 20px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--medium-gray);
    font-size: 14px;
}

.stat-item:last-child {
    border-bottom: none;
}

.stat-label {
    color: var(--dark-gray);
}

.stat-value {
    font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .detail-content {
        grid-template-columns: 1fr;
    }

    .screenshot {
        min-width: 180px;
        height: 120px;
    }

    .plugin-icon-lg {
        width: 60px;
        height: 60px;
        font-size: 28px;
    }

    .plugin-info-lg h1 {
        font-size: 20px;
    }

    .plugin-actions {
        flex-wrap: wrap;
    }
}
</style>
