<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { User } from '../../../../share/plugins/type'
import { ElNotification } from 'element-plus'

const userInfo = ref<User | undefined>(undefined)
const loading = ref(false)
const isLoginMode = ref(true)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 128, message: '密码长度6-128字符', trigger: 'blur' }
  ]
}

function notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
  ElNotification({
    message,
    type,
    duration: 2500,
    showClose: true
  })
}

async function login() {
  loading.value = true
  try {
    const succeed: boolean = await window.ipcApi.userLogin(form.username, form.password)
    if (succeed) {
      notify('登录成功', 'success')
      await getUserInfo()
    } else {
      notify('登录失败，用户名或密码错误', 'error')
    }
  } catch (e) {
    notify('登录异常：' + (e as any)?.message, 'error')
  } finally {
    loading.value = false
  }
}

async function register() {
  loading.value = true
  try {
    const succeed: boolean = await window.ipcApi.userRegister(form.username, form.password)
    if (succeed) {
      notify('注册成功，请登录', 'success')
      isLoginMode.value = true
    } else {
      notify('注册失败，用户名可能已存在', 'error')
    }
  } catch (e) {
    notify('注册异常：' + (e as any)?.message, 'error')
  } finally {
    loading.value = false
  }
}

async function logout() {
  loading.value = true
  try {
    await window.ipcApi.userLogout()
    notify('已登出', 'success')
    userInfo.value = undefined
  } catch (e) {
    notify('登出异常：' + (e as any)?.message, 'error')
  } finally {
    loading.value = false
  }
}

async function getUserInfo() {
  try {
    const user: User | undefined = await window.ipcApi.userInfo()
    userInfo.value = user
  } catch (e) {
    userInfo.value = undefined
  }
}

onMounted(() => {
  getUserInfo()
})
</script>

<template>
  <div style="max-width: 400px; margin: 40px auto;">
    <el-card>
      <template v-if="!userInfo">
        ai生成。用来快速测试。后续直接会在设置页做用户管理。
        <h2 style="text-align:center;">{{ isLoginMode ? '登录' : '注册' }}</h2>
        <el-form :model="form" :rules="rules" label-width="80px" status-icon>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" maxlength="20" show-word-limit autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" maxlength="128" show-word-limit
              autocomplete="current-password" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="isLoginMode ? login() : register()">
              {{ isLoginMode ? '登录' : '注册' }}
            </el-button>
            <el-button type="text" @click="isLoginMode = !isLoginMode">
              {{ isLoginMode ? '没有账号？注册' : '已有账号？登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <h2 style="text-align:center;">当前用户</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">{{ userInfo.name }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin: 20px 0; text-align:center;">
          <el-button type="danger" :loading="loading" @click="logout">登出</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped></style>