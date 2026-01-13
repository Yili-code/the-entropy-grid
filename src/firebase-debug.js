/**
 * Firebase 配置調試工具
 * 在瀏覽器控制台運行此腳本以檢查 Firebase 配置狀態
 */

export function checkFirebaseConfig() {
  console.log('🔍 Firebase 配置檢查');
  console.log('==================');
  
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const optionalEnvVars = [
    'VITE_FIREBASE_MEASUREMENT_ID'
  ];
  
  console.log('\n📋 必要的環境變數：');
  let allRequiredSet = true;
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    const isSet = value && value.trim() !== '';
    const status = isSet ? '✅' : '❌';
    console.log(`${status} ${varName}: ${isSet ? '已設置' : '未設置'}`);
    if (!isSet) allRequiredSet = false;
  });
  
  console.log('\n📋 可選的環境變數：');
  optionalEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    const isSet = value && value.trim() !== '';
    const status = isSet ? '✅' : '⚪';
    console.log(`${status} ${varName}: ${isSet ? '已設置' : '未設置（可選）'}`);
  });
  
  console.log('\n📊 配置狀態：');
  if (allRequiredSet) {
    console.log('✅ 所有必要的環境變數都已設置');
    console.log('💡 提示：如果 Firebase 仍然無法工作，請檢查：');
    console.log('   1. Firebase 專案是否已正確創建');
    console.log('   2. 配置值是否正確複製（沒有多餘的空格）');
    console.log('   3. 是否需要重啟開發伺服器（npm run dev）');
  } else {
    console.log('❌ 缺少必要的環境變數');
    console.log('💡 解決方法：');
    console.log('   1. 檢查 .env 文件是否存在');
    console.log('   2. 參考 .env.example 填入 Firebase 配置值');
    console.log('   3. 從 Firebase Console 獲取配置：');
    console.log('      https://console.firebase.google.com/');
    console.log('   4. 重啟開發伺服器（npm run dev）');
  }
  
  console.log('\n==================');
  
  return allRequiredSet;
}

// 如果在開發模式下，自動運行檢查
if (import.meta.env.DEV) {
  // 延遲執行，確保 DOM 已載入
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      checkFirebaseConfig();
    }, 1000);
  }
}
