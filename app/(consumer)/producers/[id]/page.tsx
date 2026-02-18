import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProducer, getProducerListings } from '@/lib/api';
import { ProductCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, Shield, MapPin } from 'lucide-react';

interface ProducerPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProducerPage({ params }: ProducerPageProps) {
  const { id } = await params;
  const [producer, listings] = await Promise.all([
    getProducer(id),
    getProducerListings(id),
  ]);

  if (!producer) {
    notFound();
  }

  const initials = producer.businessName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Enrich listings with producer and batch data for ProductCard
  const productsWithDetails = listings.map((product) => ({
    ...product,
    producer,
    batch: {
      id: product.batchId,
      producerId: producer.id,
      region: producer.address.state,
      harvestDate: new Date().toISOString(),
      extractionDate: new Date().toISOString(),
      floralSourceTags: [],
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));

  return (
    <div className="flex flex-col">
      {/* Cover Image */}
      <div className="h-48 md:h-64 relative bg-gradient-to-br from-amber-200 to-amber-400">
        <Image
          src={producer.coverImage || '/images/AI_generated_honey.jpg'}
          alt={producer.businessName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="container px-4">
        {/* Back Link */}
        <Link
          href="/producers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mt-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to producers
        </Link>

        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <Avatar className="h-32 w-32 border-4 border-background ring-4 ring-primary/20">
              <AvatarImage src={producer.profileImage} alt={producer.businessName} />
              <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{producer.businessName}</h1>
                <Badge
                  className={`gap-1 ${
                    (producer.badgeLevel || 'verified') === 'premium'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {(producer.badgeLevel || 'verified') === 'premium' ? 'Premium' : 'Verified'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {producer.address.suburb}, {producer.address.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-12 max-w-3xl">
          <h2 className="text-lg font-semibold mb-3">About</h2>
          <p className="text-muted-foreground leading-relaxed">{producer.bio}</p>
        </div>

        {/* Listings */}
        <div className="pb-12">
          <h2 className="text-lg font-semibold mb-6">
            Products ({listings.length})
          </h2>
          {listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productsWithDetails.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No products available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

