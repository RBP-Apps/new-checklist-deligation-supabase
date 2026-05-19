const { createClient } = require('@supabase/supabase-js');

const supabaseURL = "https://vfmpphqxqennapykpokd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbXBwaHF4cWVubmFweWtwb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4ODk1NTgsImV4cCI6MjA5MTQ2NTU1OH0.1-IqbvalSG-zAzXYZlGsqmR3PVClmDz18LMiK-Q45xA";

const supabase = createClient(supabaseURL, supabaseKey);

async function check() {
    console.log("Checking tables...");
    const res1 = await supabase.from('new_licenses').select('*').limit(1);
    console.log("new_licenses response:", res1.error ? res1.error.message : "Success (exists!)");

    const res2 = await supabase.from('new_trainings').select('*').limit(1);
    console.log("new_trainings response:", res2.error ? res2.error.message : "Success (exists!)");
}

check();
