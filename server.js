import express from "express";
import axios from "axios";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import cron from "node-cron";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/proxy", async (req, res) => {
  try {
    const response = await axios.get("https://script.google.com/a/macros/botivate.in/s/AKfycbxjYYdBHyeK1n65Er6c76ymzKvBvZr8ixit2_OUTRA/dev");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Phone number formatter
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
};

// Send template helper using Axios
const sendWhatsAppTemplate = async (phoneNumber, templateName, parameters = [], languageCode = 'en_US') => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      console.error('Invalid phone number:', phoneNumber);
      return false;
    }

    const apiURL = process.env.VITE_WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
    const phoneId = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.VITE_WHATSAPP_ACCESS_TOKEN;

    if (!accessToken || !phoneId) {
      console.error(`Meta Template API Error: Credentials not configured for ${templateName}`);
      return false;
    }

    const url = `${apiURL}/${phoneId}/messages`;

    const response = await axios.post(url, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: [
          {
            type: "body",
            parameters: parameters.map(val => ({
              type: "text",
              text: String(val || 'N/A')
            }))
          }
        ]
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`✅ WhatsApp template "${templateName}" sent successfully to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error(`Error sending WhatsApp template "${templateName}" to ${phoneNumber}:`, error.response ? error.response.data : error.message);
    return false;
  }
};

// JSON string name parser
const parseName = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && val.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(val);
      return parsed.given_by || parsed.name || parsed.user_name || val;
    } catch (e) {
      return val;
    }
  }
  return val;
};

// Daily reminders function
const sendDailyReminders = async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key must be set in environment variables.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch all users
  console.log("🔍 Fetching active users...");
  const { data: users, error: usersError } = await supabase
    .from('new_users')
    .select('user_name, number');

  if (usersError) {
    throw new Error(`Error fetching users: ${usersError.message}`);
  }

  // 2. Fetch pending tasks from all 5 tables
  console.log("🔍 Querying pending tasks across all modules...");
  const [
    checklistRes,
    delegationRes,
    eaRes,
    maintenanceRes,
    repairRes
  ] = await Promise.all([
    supabase.from('new_checklist').select('name').is('submission_date', null).is('status', null),
    supabase.from('new_delegation').select('name').is('submission_date', null).neq('status', 'done'),
    supabase.from('new_ea_tasks').select('doer_name').in('status', ['pending', 'extend', 'extended', 'Pending']),
    supabase.from('new_maintenance_tasks').select('name').is('submission_date', null),
    supabase.from('new_repair_tasks').select('assigned_person').eq('status', 'Pending')
  ]);

  const checklists = checklistRes.data || [];
  const delegations = delegationRes.data || [];
  const eaTasks = eaRes.data || [];
  const maintenanceTasks = maintenanceRes.data || [];
  const repairTasks = repairRes.data || [];

  // 3. Aggregate pending counts in memory
  const pendingCounts = {};
  for (const user of users) {
    if (user.user_name) {
      pendingCounts[user.user_name] = {
        name: user.user_name,
        number: user.number,
        checklist: 0,
        delegation: 0,
        ea: 0,
        maintenance: 0,
        repair: 0,
        total: 0
      };
    }
  }

  for (const item of checklists) {
    const name = parseName(item.name);
    if (pendingCounts[name]) {
      pendingCounts[name].checklist++;
      pendingCounts[name].total++;
    }
  }

  for (const item of delegations) {
    const name = parseName(item.name);
    if (pendingCounts[name]) {
      pendingCounts[name].delegation++;
      pendingCounts[name].total++;
    }
  }

  for (const item of eaTasks) {
    const name = parseName(item.doer_name);
    if (pendingCounts[name]) {
      pendingCounts[name].ea++;
      pendingCounts[name].total++;
    }
  }

  for (const item of maintenanceTasks) {
    const name = parseName(item.name);
    if (pendingCounts[name]) {
      pendingCounts[name].maintenance++;
      pendingCounts[name].total++;
    }
  }

  for (const item of repairTasks) {
    const name = parseName(item.assigned_person);
    if (pendingCounts[name]) {
      pendingCounts[name].repair++;
      pendingCounts[name].total++;
    }
  }

  const results = [];

  // 4. Send reminders to users with at least 1 pending task
  for (const username in pendingCounts) {
    const user = pendingCounts[username];
    if (user.total > 0 && user.number) {
      const modules = [];
      if (user.checklist > 0) modules.push(`Checklist (${user.checklist})`);
      if (user.delegation > 0) modules.push(`Delegation (${user.delegation})`);
      if (user.ea > 0) modules.push(`EA (${user.ea})`);
      if (user.maintenance > 0) modules.push(`Maintenance (${user.maintenance})`);
      if (user.repair > 0) modules.push(`Repair (${user.repair})`);

      const focusTasksText = `Pending tasks in: ${modules.join(', ')}`;
      const appLink = 'https://new-checklist-deligation-supabase-q.vercel.app/login';

      console.log(`✉️ Sending reminder to ${user.name} (${user.number}) - Total pending: ${user.total}`);

      const success = await sendWhatsAppTemplate(
        user.number,
        'daily_reminder',
        [
          user.name,
          String(user.total),
          String(user.checklist + user.maintenance + user.repair), // Today's/Active Tasks
          String(user.total),
          focusTasksText,
          appLink
        ],
        'en_US'
      );

      results.push({ user: user.name, number: user.number, pendingCount: user.total, success });
    }
  }

  console.log(`📊 Daily task reminder complete. Sent ${results.filter(r => r.success).length} messages.`);
  return results;
};

// Expose manual trigger route for testing and admin triggering
app.get("/api/cron/trigger-reminders", async (req, res) => {
  try {
    console.log("⏰ Manual daily reminders trigger started...");
    const results = await sendDailyReminders();
    res.json({ success: true, message: "Daily reminders process complete", results });
  } catch (error) {
    console.error("❌ Daily reminders trigger failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// Schedule daily reminder cron job at 9:00 AM IST
cron.schedule('0 9 * * *', async () => {
  console.log("⏰ Running scheduled daily task reminder cron job...");
  try {
    await sendDailyReminders();
  } catch (err) {
    console.error("❌ Error in scheduled daily task reminder cron job:", err);
  }
}, {
  timezone: "Asia/Kolkata"
});

app.listen(5000, () => console.log("Server running on port 5000"));
