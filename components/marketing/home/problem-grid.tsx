import { AlertCircle, Shield, Truck } from 'lucide-react';

const problems = [
  {
    icon: AlertCircle,
    tone: 'destructive',
    title: 'Counterfeit products',
    desc: 'Imported honey often mislabeled as Australian.',
  },
  {
    icon: Truck,
    tone: 'primary',
    title: 'No direct access',
    desc: 'Producers can’t reach consumers directly.',
  },
  {
    icon: Shield,
    tone: 'primary',
    title: 'Lack of transparency',
    desc: 'No easy way to verify origin or authenticity.',
  },
] as const;

export function ProblemGrid() {
  return (
    <section className="bg-muted/30 py-14 md:py-20">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            The problem with honey today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Imported and blended honey dominates retail shelves, often
            misleading customers. Local producers lack a platform to sell
            directly, while consumers struggle to find genuine, traceable
            Australian honey.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border bg-background p-6 shadow-sm transition
                         hover:-translate-y-[1px] hover:shadow-md">
              <div
                className={[
                  'flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset',
                  p.tone === 'destructive'
                    ? 'bg-destructive/10 text-destructive ring-destructive/15'
                    : 'bg-primary/10 text-primary ring-primary/15',
                ].join(' ')}>
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
