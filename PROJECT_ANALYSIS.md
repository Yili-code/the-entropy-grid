# The Entropy Grid 專案分析

## 專案概述

這個專案是一個習慣追蹤工具，用 React Flow 把習慣畫成節點圖。跟一般待辦清單不一樣的是，它可以看到習慣之間的關聯，而且每天會自動重置完成狀態，不用手動操作。

## 技術實現

### 主要技術選型

**React Flow** 用來畫圖，習慣變成節點，可以拖來拖去，也能用線連起來。選它主要是因為內建很多交互功能，不用自己寫拖拽邏輯。

**LocalStorage** 存數據，關閉瀏覽器後還在。做了自動保存和手動保存兩種方式，自動保存會在數據變動時寫入，手動保存有個按鈕可以隨時存。

**日期檢查** 這部分比較麻煩。因為要每天自動重置 checkbox，所以做了兩層檢查：應用打開時比較上次開啟日期，運行時每分鐘檢查一次是否跨過午夜。雖然每分鐘檢查有點浪費，但至少不會漏掉。

**UI 風格** 選了 Cyberpunk 風格，主要是想讓視覺效果更突出。用了 SVG 濾鏡做霓虹發光，CSS 做掃描線和噪點紋理。代價是 CSS 寫起來比較複雜，渲染負擔也比較重。

### 遇到的技術問題

**無限循環問題** 這個最頭痛。一開始 `useEffect` 依賴回調函數，回調函數又依賴 `nodes`，`nodes` 更新觸發回調重新創建，回調改變又觸發 `useEffect`，就無限循環了。後來用 `useRef` 追蹤初始化狀態，比較函數引用，只在真正改變時才更新。

```javascript
const isInitializedRef = React.useRef(false);
const prevCallbacksRef = React.useRef({});

const callbacksChanged = 
  prevCallbacksRef.current.onChange !== onColorChange || ...

if (!isInitializedRef.current || !callbacksChanged) {
  return;
}
```

**函數序列化** React 的函數不能直接存到 LocalStorage，所以序列化時要把函數拿掉，讀取時再重新綁定。用解構賦值把函數分離出來，剩下的數據存起來，讀取時再把最新的函數引用綁回去。

```javascript
// 存的時候
const { onChange: _onChange, ...cleanData } = node.data;

// 讀的時候
data: { ...node.data, onChange: onColorChange, ... }
```

**狀態更新** 所有 `setNodes` 都用函數式更新 `(prevState) => newState`，避免閉包陷阱。這樣確保更新時用的是最新狀態，不是過時的值。

**性能優化** 事件處理函數都用 `useCallback` 包起來，減少不必要的重新渲染。定時器記得清理，避免內存洩漏。

**數據兼容** 讀取舊數據時，新字段可能不存在，所以用 `??` 和 `||` 給默認值。數組字段用 `Array.isArray()` 檢查，確保類型正確。

## 技術決策與權衡

**LocalStorage vs IndexedDB** 選了 LocalStorage，因為數據量不大，而且同步操作比較簡單。缺點是容量有限，如果以後數據多了可能要換 IndexedDB。

**日期檢查方式** 用定時器每分鐘檢查，雖然有點浪費但比較可靠。本來想用事件驅動，但瀏覽器沒有跨天事件，所以還是用定時器。可以考慮加上 `visibilitychange` API，頁面可見時再檢查一次。

**保存策略** 做了自動保存和手動保存兩種。自動保存用戶體驗好，但頻繁寫入可能影響性能。之後可以加防抖優化。

**函數綁定** 初始化時和回調改變時都會重新綁定。用 `useRef` 比較引用，避免不必要的更新。

**UI 風格** 選 Cyberpunk 主要是為了視覺效果，但 CSS 寫起來確實複雜，渲染負擔也重。如果追求性能可能簡約風格更好。

## 值得強調的技術亮點

### 1. React Hooks 無限循環的解決

開發時遇到一個很典型的問題：`useEffect` 依賴回調函數，回調函數依賴 `nodes`，`nodes` 更新又觸發回調重新創建，就無限循環了。調試了很久才發現是依賴項的問題。

解決方法是用 `useRef` 追蹤狀態，比較函數引用，只在真正改變時才更新。這讓我對 React Hooks 的生命週期有了更深的理解。

### 2. 函數序列化的處理

React 函數不能直接存到 LocalStorage，所以序列化時要把函數分離，讀取時再重新綁定。這個機制確保了數據能正確保存和恢復，同時功能不會丟失。

### 3. 日期感知系統

每天自動重置是個需求，但實現起來比想像中複雜。因為應用可能關閉，所以啟動時要檢查，運行時也要監控。用了 ISO 日期格式確保一致性，重置時批量更新所有節點狀態。

## 可能的技術問題

**為什麼選 React Flow 而不是 D3.js？** 主要是開發效率的考量。React Flow 內建拖拽、連接這些功能，跟 React 整合也好。D3.js 更靈活但得從零寫交互邏輯，這個專案重點在習慣管理邏輯，不是圖表渲染性能，所以選了 React Flow。

**LocalStorage 數據完整性怎麼保證？** 序列化時用解構把函數分離，讀取時再綁回去。所有必要字段都有默認值，數組用 `Array.isArray()` 檢查。自動保存和手動保存用同一套邏輯，確保一致性。所有操作都包在 try-catch 裡，出錯就用默認數據。

**多設備同步怎麼做？** 目前 LocalStorage 只能本地存，跨不了設備。短期可以導出 JSON 文件手動同步，中期用 Firebase 或 Supabase 這類 BaaS，長期可以自己寫後端 API 加 WebSocket 做實時同步。還得考慮衝突解決，可能用 Last-Write-Wins 或 Operational Transform。

## 其他技術細節

代碼方面，事件處理函數都用 `useCallback` 包起來，減少重新渲染。錯誤處理都包在 try-catch 裡。組件設計比較模組化，加新功能還算方便。

用戶體驗上，保存成功會有視覺反饋，動畫過渡也比較流暢。

技術棧：React 19.2.0、React Flow 11.11.4、Vite 7.2.5，狀態管理用 Hooks，數據存 LocalStorage，樣式用內聯 CSS，沒有額外依賴。

