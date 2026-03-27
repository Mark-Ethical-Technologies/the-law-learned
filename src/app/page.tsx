export default function Home() {
  return (
    <main className="min-h-screen bg-brand-light flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          The Law Learned
        </h1>
        <p className="text-xl text-brand-navy/70 mb-8">
          Know the law. Change everything.
        </p>
        <div className="bg-white rounded-2xl shadow-sm border border-brand-navy/10 p-8">
          <p className="text-brand-navy/60 text-sm">
            Platform launching soon. Join the waitlist.
          </p>
        </div>
      </div>
    </main>
  );
}
