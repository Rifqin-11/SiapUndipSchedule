// Critical above-the-fold server component

export default function AboveTheFoldContent({ userName }: { userName?: string }) {
  const firstName = userName?.split(" ")[0] || "User";
  
  return (
    <section className="flex flex-row justify-between items-center mt-6 mx-6">
      <div className="flex flex-col text-lg dark:text-white space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi {firstName}, here&apos;s your schedule
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </section>
  );
}