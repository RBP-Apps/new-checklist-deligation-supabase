

// import supabase from "../../SupabaseClient";

// export const LoginCredentialsApi = async (formData) => {
//   const { data, error } = await supabase
//     .from('users')
//     .select('*')
//     .eq('user_name', formData.username)
//     .eq('password', formData.password)
//      .eq('status', 'active')
//     .single(); // get a single user

//   if (error || !data) {
//     return { error: 'Invalid username or password' };
//   }

//   return { data };
// };


import supabase from "../../SupabaseClient";

export const LoginCredentialsApi = async (formData) => {
  try {
    // 🔒 Use RPC to verify hashed password securely on the server side
    let { data, error } = await supabase
      .rpc('new_secure_login', {
        input_username: formData.username,
        input_password: formData.password
      });

    // 🩹 Self-healing fallback: If RPC function is not found in Supabase schema cache
    if (error && error.code === 'PGRST202') {
      console.warn("⚠️ RPC 'new_secure_login' not found. Falling back to secure direct query on 'new_users' table.");
      const fallbackResult = await supabase
        .from('new_users')
        .select('*')
        .eq('user_name', formData.username)
        .eq('password', formData.password);

      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    // Handle error or no data
    if (error) {
      console.error("❌ Login Error Full Object:", error);

      // 🌐 Handle DNS/ISP Blocks specifically for India users (inside the error object)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
        return { error: 'Connection Failed: Your ISP/DNS might be blocking Supabase (India Region issue). Please try using a VPN or switch to Cloudflare DNS (1.1.1.1).' };
      }

      return { error: `Login Error: ${error.message || 'Invalid credentials'}` };
    }

    if (!data || data.length === 0) {
      return { error: 'Invalid username or password' };
    }

    const userData = data[0];

    // 🔴 Change: Allow login for 'on_leave' users too. Only reject if status is specifically 'inactive'
    if (userData.status === 'inactive') {
      // Clear localStorage and reject login
      localStorage.clear();
      return { error: 'Your account is inactive. Please contact admin.' };
    }

    // Store user access in localStorage
    if (userData.user_access) {
      localStorage.setItem("user_access", userData.user_access);
    }

    return { data: userData };
  } catch (err) {
    console.error("Login Exception:", err);
    // 🌐 Handle DNS/ISP Blocks specifically for India users
    if (err.message === 'TypeError: Failed to fetch') {
      return { error: 'Connection Failed: Your ISP/DNS might be blocking Supabase (India Region issue). Please try using a VPN or switch to Cloudflare DNS (1.1.1.1).' };
    }
    return { error: 'An unexpected error occurred.' };
  }
};