import { Leaf, MapPin, Shield, Truck } from 'lucide-react';

const items = [
  { icon: Shield, title: 'Verified producers', desc: 'Every seller checked' },
  { icon: MapPin, title: 'Traceable origin', desc: 'Batch provenance' },
  { icon: Truck, title: 'Direct shipping', desc: 'Farm to your door' },
  { icon: Leaf, title: 'Pure & natural', desc: 'No additives' },
];

export function TrustRow() {
  return (
    <section className="border-b bg-background">
      <div className="fluid-container py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition
                         hover:-translate-y-[1px] hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-inset ring-primary/10">
                <it.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{it.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {it.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
