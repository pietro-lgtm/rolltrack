"use client";

import { useCart } from "@/components/cart/CartProvider";
import { addOns, type AddOn } from "@/data/services";

const CATEGORIES: { id: AddOn["category"]; label: string }[] = [
  { id: "media", label: "Media" },
  { id: "grabacion", label: "Grabación" },
  { id: "edicion", label: "Edición" },
  { id: "fotos", label: "Fotos" },
  { id: "eventos", label: "Eventos" },
];

function AddOnRow({ addOn }: { addOn: AddOn }) {
  const { add } = useCart();

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="leader flex-1">
        <span className="leader-name">
          {addOn.name}
          {addOn.recurring ? <span className="text-mid"> · mensual</span> : null}
        </span>
        <span className="leader-price">{addOn.priceLabel}</span>
      </div>
      <button
        type="button"
        onClick={() =>
          add({
            id: addOn.id,
            name: addOn.name,
            price: addOn.price,
            priceLabel: addOn.priceLabel,
          })
        }
        className="label-mono shrink-0 link-under"
      >
        [ + agregar ]
      </button>
    </div>
  );
}

export function AddOnsSection() {
  return (
    <div className="space-y-10">
      {CATEGORIES.map((category) => {
        const items = addOns.filter((a) => a.category === category.id);
        if (items.length === 0) return null;
        return (
          <div key={category.id}>
            <p className="label-mono mb-2 text-mid">{category.label}</p>
            <div className="divide-y-2 divide-ink/10 border-t-2 border-ink/10">
              {items.map((addOn) => (
                <AddOnRow key={addOn.id} addOn={addOn} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
