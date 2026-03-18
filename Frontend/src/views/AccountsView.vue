<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
</script>

<template>
  <div class="accounts-page fade-in">
    <section class="summary-section mb-6">
      <Card class="total-assets-card">
        <template #content>
          <p class="text-sm opacity-60 mb-1">總資產估算</p>
          <h1 class="text-4xl font-bold text-primary">$ 125,400</h1>
        </template>
      </Card>
    </section>

    <section class="account-list">
      <h3 class="mb-4 font-bold">我的帳戶</h3>
      
      <Card class="mb-3 cursor-pointer hover-effect">
        <template #content>
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-wallet text-2xl text-blue-500"></i>
              <div>
                <div class="font-bold">現金錢包</div>
                <div class="text-xs opacity-50">預設帳戶</div>
              </div>
            </div>
            <div class="font-bold">$ 5,200</div>
          </div>
        </template>
      </Card>

      <Card class="mb-3 cursor-pointer hover-effect">
        <template #content>
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-credit-card text-2xl text-green-500"></i>
              <div>
                <div class="font-bold">國泰世華銀行</div>
                <div class="text-xs opacity-50">薪轉戶</div>
              </div>
            </div>
            <div class="font-bold">$ 120,200</div>
          </div>
        </template>
      </Card>

      <Button label="新增帳戶" icon="pi pi-plus" class="w-full p-button-outlined mt-4" />
    </section>
  </div>
</template>

<style scoped>
.total-assets-card {
  background: linear-gradient(135deg, var(--app-primary-faded), transparent);
  border: none;
  border-left: 4px solid var(--app-primary);
}
.hover-effect:hover {
  transform: translateX(5px);
  transition: 0.3s;
}
</style>