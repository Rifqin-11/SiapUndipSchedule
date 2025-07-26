// Test script to run the migration
// Run this by visiting /api/migrate in your browser or using curl

console.log("To migrate dummy data to MongoDB:");
console.log("1. Start your Next.js development server: npm run dev");
console.log("2. Visit http://localhost:3000/api/migrate in your browser");
console.log("3. Or run: curl -X POST http://localhost:3000/api/migrate");
console.log("");
console.log(
  "This will migrate the dummy data from constants/index.ts to your MongoDB database."
);
console.log(
  "After migration, all components will fetch data from the database instead of using dummy data."
);
