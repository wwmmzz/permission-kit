<script setup lang="ts">
import { usePermission } from '@eycraf/permission-kit-vue'

const { can } = usePermission()
</script>

<template>
  <section>
    <h2>首页</h2>
    <p>这个页面展示 Vue 版本的三种权限用法：组件、指令、组合式 API。</p>

    <div class="demo-block">
      <h3>1. Can 组件</h3>
      <Can permission="user.create">
        <button type="button">新增用户</button>

        <template #fallback>
          <button type="button" disabled>无新增权限</button>
        </template>
      </Can>
    </div>

    <div class="demo-block">
      <h3>2. v-permission 指令</h3>
      <button type="button" v-permission="'user.delete'">
        删除用户：无权限时隐藏
      </button>

      <button type="button" v-permission:disabled="'user.delete'">
        删除用户：无权限时禁用
      </button>
    </div>

    <div class="demo-block">
      <h3>3. usePermission()</h3>
      <p>
        can('user.delete')：
        <strong>{{ can('user.delete') ? '有权限' : '无权限' }}</strong>
      </p>
    </div>
  </section>
</template>
