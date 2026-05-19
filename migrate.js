const fs = require('fs');
const path = require('path');

const tableMap = {
  'users': 'new_users',
  'checklist': 'new_checklist',
  'delegation': 'new_delegation',
  'delegation_done': 'new_delegation_done',
  'departments': 'new_departments',
  'dropdown_options': 'new_dropdown_options',
  'ea_tasks': 'new_ea_tasks',
  'ea_tasks_done': 'new_ea_tasks_done',
  'holidays': 'new_holidays',
  'maintenance_tasks': 'new_maintenance_tasks',
  'notifications': 'new_notifications',
  'repair_tasks': 'new_repair_tasks',
  'user_notifications': 'new_user_notifications',
  'working_day_calender': 'new_working_day_calender',
  'assign_from': 'new_assign_from'
};

const bucketMap = {
  'audio-recordings': 'new_audio-recordings',
  'checklist': 'new_checklist',
  'ea': 'new_ea',
  'maintenance': 'new_maintenance',
  'parts': 'new_parts',
  'profiles': 'new_profiles',
  'repair': 'new_repair',
  'task-instructions': 'new_task-instructions'
};

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
};

const srcDir = path.join(__dirname, 'src');
console.log('🔍 Scanning files in:', srcDir);
const files = walk(srcDir);
console.log(`Found ${files.length} source files.`);

let totalTableChanges = 0;
let totalBucketChanges = 0;
let totalFunctionChanges = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Table Replacements (from('users'), table: 'users', tableName = 'users', etc.)
  const tableRegex = /\b(from|table|tableName)\s*([:=({]|===|==)\s*(['"])(users|checklist|delegation|delegation_done|departments|dropdown_options|ea_tasks|ea_tasks_done|holidays|maintenance_tasks|notifications|repair_tasks|user_notifications|working_day_calender|assign_from)\b\3/g;
  content = content.replace(tableRegex, (match, p1, p2, quote, table) => {
    totalTableChanges++;
    const replacement = `${p1}${p2}${quote}${tableMap[table]}${quote}`;
    console.log(`[TABLE] In ${path.relative(__dirname, file)}: "${match}" -> "${replacement}"`);
    return replacement;
  });

  // 2. Storage Bucket Replacements (storage.from('checklist'), etc.)
  const bucketRegex = /\bstorage\s*\.\s*from\s*\(\s*(['"])(audio-recordings|checklist|ea|maintenance|parts|profiles|repair|task-instructions)\b\1\s*\)/g;
  content = content.replace(bucketRegex, (match, quote, bucket) => {
    totalBucketChanges++;
    const replacement = `storage.from(${quote}${bucketMap[bucket]}${quote})`;
    console.log(`[BUCKET] In ${path.relative(__dirname, file)}: "${match}" -> "${replacement}"`);
    return replacement;
  });

  // 3. secure_login -> new_secure_login
  if (content.includes('secure_login') && !content.includes('new_secure_login')) {
    content = content.replace(/secure_login/g, 'new_secure_login');
    totalFunctionChanges++;
    console.log(`[FUNCTION] In ${path.relative(__dirname, file)}: "secure_login" -> "new_secure_login"`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('\n======================================');
console.log('MIGRATION REPORT:');
console.log(`- Total Table Changes: ${totalTableChanges}`);
console.log(`- Total Bucket Changes: ${totalBucketChanges}`);
console.log(`- Total Function Changes: ${totalFunctionChanges}`);
console.log('======================================');
