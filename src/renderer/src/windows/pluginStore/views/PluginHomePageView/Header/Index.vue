<template>
    <nav class="nav-bar">
        <div class="logo">
            <i class="fas fa-plug"></i>
            <span>插件市场</span>
        </div>
        <div class="upload-btn" @click="invokeFileChooseDialog">上传插件</div>
        <input ref="fileInput" style="display: none" type="file" @change="handlePluginUpload" />
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="搜索插件..." />
        </div>
    </nav>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";

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
        alert("请选择文件");
        return;
    }

    const formData = new FormData();
    formData.append("plugin", file);

    try {
        const response = await fetch("http://localhost:8080/plugin", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            console.log("上传成功:", result);
            alert(`文件 ${result.originalname} 上传成功`);
        } else {
            throw new Error(result.error || "上传失败");
        }
    } catch (error) {
        console.error("上传错误:", error);
        alert("上传失败: " + error.message);
    }
}
</script>

<style scoped>
/* 导航栏样式 */
.nav-bar {
    background: var(--white);
    box-shadow: var(--shadow);
    padding: 15px 40px;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
}

.upload-btn {
    padding: 7px 12px;
    background: var(--white);
    border: 1px solid var(--medium-gray);
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s;
    white-space: nowrap;
    color: var(--primary-color);
}

.upload-btn:hover {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
}

.logo {
    display: flex;
    align-items: center;
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-color);
    margin-right: 30px;
}

.logo i {
    margin-right: 8px;
    font-size: 28px;
}

.nav-tabs {
    display: flex;
    list-style: none;
}

.nav-tabs li {
    padding: 8px 15px;
    border-radius: 4px;
    margin-right: 10px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
}

.nav-tabs li.active,
.nav-tabs li:hover {
    background: rgba(30, 128, 255, 0.1);
    color: var(--primary-color);
}

.search-bar {
    position: relative;
    margin-left: auto;
}

.search-bar input {
    width: 280px;
    padding: 10px 15px 10px 40px;
    border: 1px solid var(--medium-gray);
    border-radius: 20px;
    outline: none;
    transition: all 0.3s;
}

.search-bar input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(30, 128, 255, 0.15);
}

.search-bar i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--dark-gray);
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

    .nav-tabs li {
        font-size: 14px;
        padding: 6px 10px;
    }
}

@media (max-width: 480px) {
    .nav-bar {
        flex-wrap: wrap;
    }

    .nav-tabs {
        order: 3;
        width: 100%;
        margin-top: 10px;
        justify-content: center;
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
