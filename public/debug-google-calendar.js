// Debug Google Calendar Auto-Sync
// Copy and paste this into browser console (F12) to check status

console.log("🔍 Google Calendar Auto-Sync Debug");
console.log("=====================================");

// Check tokens
const tokens = localStorage.getItem("google_calendar_tokens");
console.log("1. Tokens:", tokens ? "✅ Found" : "❌ Not found");
if (tokens) {
  try {
    const parsed = JSON.parse(tokens);
    console.log("   - access_token:", parsed.access_token ? "✅ Exists" : "❌ Missing");
    console.log("   - expiry_date:", parsed.expiry_date);
    if (parsed.expiry_date) {
      const isExpired = Date.now() > parsed.expiry_date;
      console.log("   - Is expired:", isExpired ? "❌ YES" : "✅ NO");
    }
  } catch (e) {
    console.error("   ❌ Invalid JSON format");
  }
}

// Check auto-sync preference
const autoSync = localStorage.getItem("google_calendar_auto_sync");
console.log("2. Auto-sync setting:", autoSync === "true" ? "✅ Enabled" : "❌ Disabled");

// Check if both are ready
const isReady = tokens && autoSync === "true";
console.log("3. Ready to auto-sync:", isReady ? "✅ YES" : "❌ NO");

console.log("=====================================");

if (!tokens) {
  console.log("💡 Solution: Go to /user page and click 'Connect Google Calendar'");
} else if (autoSync !== "true") {
  console.log("💡 Solution: Disconnect and reconnect Google Calendar to enable auto-sync");
}

// Test sync function
if (isReady) {
  console.log("✅ Auto-sync is configured correctly!");
  console.log("💡 Next steps:");
  console.log("   1. Try adding a new subject");
  console.log("   2. Check browser console for:");
  console.log("      - '🔄 Auto-syncing subject to Google Calendar'");
  console.log("      - '✅ Subject auto-synced to Google Calendar'");
  console.log("   3. Check Network tab for POST to /api/google-calendar/export-subject");
  console.log("   4. Check Google Calendar for new events");
}
