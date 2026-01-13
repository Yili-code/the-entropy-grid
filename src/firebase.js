// Firebase 配置和初始化
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 配置物件
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 驗證必要的環境變數（開發模式下）
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName] || import.meta.env[varName].trim() === ''
);

if (missingVars.length > 0 && import.meta.env.DEV) {
  console.warn('Firebase 環境變數未設置：', missingVars.join(', '));
  console.warn('請檢查 .env 文件並填入 Firebase 配置值');
  console.warn('參考 .env.example 文件以了解需要哪些變數');
}

// 初始化 Firebase
let app = null;
let auth = null;
let db = null;
let storage = null;

try {
  // 檢查是否所有必要的配置都存在
  if (missingVars.length === 0) {
    app = initializeApp(firebaseConfig);
    
    // 初始化 Firebase 服務
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    if (import.meta.env.DEV) {
      console.log('Firebase 初始化成功');
      console.log('專案 ID:', firebaseConfig.projectId);
    }
  } else {
    // 開發模式下，如果配置缺失，顯示警告但不拋出錯誤
    if (import.meta.env.DEV) {
      console.warn('Firebase 未初始化：缺少必要的環境變數');
      console.warn('應用程式可以運行，但 Firebase 功能將無法使用');
    }
  }
} catch (error) {
  console.error('Firebase 初始化失敗:', error);
  console.error('請檢查 Firebase 配置是否正確');
  if (import.meta.env.DEV) {
    console.error('錯誤詳情:', error.message);
  }
  // 在開發模式下不拋出錯誤，允許應用程式繼續運行
  if (!import.meta.env.DEV) {
    throw error;
  }
}

export { auth, db, storage };
export default app;
