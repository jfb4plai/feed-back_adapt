import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-8">

          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3">FEED-BACK ADAPT</h1>
            <p className="text-slate-500 text-lg">
              Feedback pédagogique adaptatif pour les mathématiques
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Fédération Wallonie-Bruxelles · Fondamental &amp; Secondaire · FR / NL / EN
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left space-y-4">
            <h2 className="font-semibold text-slate-700">Comment ça fonctionne</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold">1.</span>
                <p>L&apos;enseignant crée une session et donne le code 4 lettres à l&apos;élève</p>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold">2.</span>
                <p>L&apos;élève répond aux questions sur sa tablette, sans connexion requise</p>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold">3.</span>
                <p>L&apos;IA classifie l&apos;erreur et génère un feedback adapté au type d&apos;obstacle cognitif</p>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold">4.</span>
                <p>L&apos;enseignant suit les résultats en temps réel depuis son tableau de bord</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-left">
            {[
              { color: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Épistémologique', desc: 'Savoir antérieur obstacle' },
              { color: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Didactique', desc: 'Mauvaise lecture du contrat' },
              { color: 'bg-cyan-50 border-cyan-200 text-cyan-700', label: 'Ontogénique', desc: 'Stade de développement' },
              { color: 'bg-violet-50 border-violet-200 text-violet-700', label: 'Linguistique', desc: 'Interférence CLIL' },
            ].map(t => (
              <div key={t.label} className={`rounded-xl border p-3 ${t.color}`}>
                <p className="font-medium">{t.label}</p>
                <p className="opacity-70 mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Espace enseignant
            </Link>
            <Link
              href="/register"
              className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-4">
        PLAI · Pôle Liégeois d&apos;Accompagnement vers une École Inclusive
        <p className="mt-1">
          Code :{' '}
          <a href="https://polyformproject.org/licenses/noncommercial/1.0.0" target="_blank" rel="noopener noreferrer" className="underline">PolyForm Noncommercial 1.0.0</a>
          {' · '}Contenus :{' '}
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr" target="_blank" rel="noopener noreferrer" className="underline">CC BY-NC-SA 4.0</a>
          {' · '}Jean-François Beguin, jfb4plai.com
        </p>
      </footer>
    </div>
  );
}
