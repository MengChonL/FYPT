import { createClient } from '@supabase/supabase-js';

// 直接從 Vite 的環境變數讀取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 變數缺失，請檢查 Cloudflare 設置（須以 VITE_ 開頭）');
}

// 初始化一般用戶客戶端（受 RLS 限制，這是安全的）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 設定時區 (香港時間 UTC+8)
export const getLocalTimestamp = () => {
  const now = new Date();
  const localTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return localTime.toISOString().replace('Z', '+08:00');
};

// ===== 用戶與進度相關操作 (改用 supabase 而非 admin) =====

export const getUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// ... (將你原本函數中的 initSupabase(env) 全部移除，直接使用上面的 supabase)

export const updateProgress = async (userId, scenarioId, status) => {
  if (status === 'current') {
    const { data, error } = await supabase
      .from('users')
      .update({ current_scenario_code: scenarioId })
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
};

// 注意：deleteUserAndData 建議從前端移除，或確保資料庫 RLS 允許用戶刪除自己的資料