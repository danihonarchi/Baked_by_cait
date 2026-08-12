import { flavors } from "@/lib/flavors";
import ProductFlipCard from "@/components/ProductFlipCard";

export default function FlavorCase() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {flavors.map((f, i) => (
        <ProductFlipCard key={f.id} product={f} delay={i * 0.06} />
      ))}
    </div>
  );
}
