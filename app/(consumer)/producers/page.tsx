import { getProducers } from '@/lib/api';
import { ProducerCard } from '@/components/shared';

export default async function ProducersPage() {
  const { data: producers } = await getProducers();

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Producers</h1>
        <p className="text-muted-foreground">
          Meet the verified Australian beekeepers behind your honey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {producers.map((producer) => (
          <ProducerCard key={producer.id} producer={producer} />
        ))}
      </div>
    </div>
  );
}

