<template>
  <section>
    <h2>用户页</h2>
    <p>进入这个页面需要路由权限：<code>user.view</code>。</p>

    <div class="demo-block">
      <Can permission="user.create">
        <button type="button">新增用户</button>
      </Can>

      <button type="button" v-permission:disabled="'user.delete'">
        删除用户
      </button>
    </div>
  </section>
</template>
