// ==========================================
// db.js - 产品数据管理中心
// ==========================================

// 缓存时间 (1分钟)
const CACHE_DURATION = 1 * 60 * 1000;

window.perfumeDB = [];

document.addEventListener("DOMContentLoaded", () => {
  initProductData();
});

async function initProductData() {
  // ⚡️ [重要修改] 更新版本号 V4 -> V5
  // 这会强制浏览器忽略旧缓存，确保加载包含 Inventory 的新数据
  const cacheKey = "perfumeDB_Data_V5";
  const timeKey = "perfumeDB_Time_V5";

  localStorage.removeItem(cacheKey);
  localStorage.removeItem(timeKey);
  window.perfumeDB = [];
  console.warn("产品数据源已移除，商品目录不会加载。");
  runPageLogic();
}

function runPageLogic() {
  // 确保首页和购物车逻辑存在才执行
  if (typeof renderHome === "function") renderHome();
  if (typeof renderCart === "function") renderCart();
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // 🔹 注意：这里会将所有表头转为小写 (toLowerCase)
  // 所以表格里的 "Notes" -> "notes", "Inventory" -> "inventory"
  const headers = lines[0]
    .trim()
    .split(",")
    .map((h) => h.trim().toLowerCase());

  return lines
    .slice(1)
    .map((line) => {
      // 处理 CSV 中的逗号和引号
      const values = [];
      let current = "";
      let inQuote = false;
      for (let char of line) {
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === "," && !inQuote) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj = {};
      // 如果列数不匹配，跳过
      if (values.length < headers.length) return null;

      headers.forEach((header, index) => {
        let val = values[index] ? values[index].replace(/^"|"$/g, "") : "";

        // 🔴 [关键修改] 这里把 inventory 也强制转为数字类型
        // 这样在 index.html 里才能进行数学比较 (inventory < 50)
        if (
          header === "price" ||
          header === "stock" ||
          header === "inventory"
        ) {
          val = Number(val);
        }

        obj[header] = val;
      });
      return obj;
    })
    .filter((item) => item !== null);
}
