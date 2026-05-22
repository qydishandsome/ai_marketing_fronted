<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="https://img.icons8.com/clouds/100/null/brain.png" alt="logo" />
        <h2>AI 营销管理系统</h2>
        <p>基于大模型的数字化营销决策平台</p>
      </div>

      <el-form :model="loginForm" :rules="rules" ref="loginRef" size="large">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            立即登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>默认账号: admin / 123456</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const loginForm = ref({ username: 'admin', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = () => {
  if (loginForm.value.username === 'admin') {
    loading.value = true
    setTimeout(() => {
      localStorage.setItem('token', 'sample_token')
      ElMessage.success('登录成功')
      router.push('/')
      loading.value = false
    }, 1000)
  } else {
    ElMessage.error('用户名或密码错误')
  }
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .login-box {
    width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
      
      img { width: 80px; }
      h2 { font-size: 24px; color: #333; margin: 15px 0 5px; }
      p { font-size: 14px; color: #666; }
    }
    
    .login-btn { width: 100%; margin-top: 10px; }
    
    .login-footer {
      text-align: center;
      margin-top: 25px;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
