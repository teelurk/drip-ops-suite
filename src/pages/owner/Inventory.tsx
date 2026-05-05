import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Pencil, Trash2, RotateCcw, Plus, Minus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusOf = (qty: number) =>
  qty === 0 ? "OUT" : qty <= 3 ? "LOW" : "IN";

const InventoryPage = () => {
  const { inventory, restock, editItem, removeItem } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");
  const [brand, setBrand] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState<number | null>(null);

  const brands = Array.from(new Set(inventory.map((i) => i.brand))).sort();
  const cats = Array.from(new Set(inventory.map((i) => i.category)));

  const filtered = useMemo(() => {
    return inventory.filter((i) => {
      if (q && !`${i.brand} ${i.name}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "ALL" && i.category !== cat) return false;
      if (brand !== "ALL" && i.brand !== brand) return false;
      const s = statusOf(i.qty);
      if (status === "IN" && s !== "IN") return false;
      if (status === "LOW" && s !== "LOW") return false;
      if (status === "OUT" && s !== "OUT") return false;
      return true;
    });
  }, [inventory, q, cat, brand, status]);

  const selected = inventory.find((i) => i.id === open);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl tracking-wide">FULL INVENTORY</h1>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">SUMMIT BRANCH — {filtered.length} ITEMS</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="flex flex-1 items-center gap-2 border border-border bg-card px-3 sm:min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search inventory..."
            className="flex-1 bg-transparent py-3 text-sm outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="border border-border bg-card px-2 py-3 text-[10px] sm:text-xs tracking-widest">
            <option value="ALL">CATEGORY</option>
            {cats.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="border border-border bg-card px-2 py-3 text-[10px] sm:text-xs tracking-widest">
            <option value="ALL">BRAND</option>
            {brands.map((b) => <option key={b} value={b}>{b.toUpperCase()}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-border bg-card px-2 py-3 text-[10px] sm:text-xs tracking-widest">
            <option value="ALL">STATUS</option>
            <option value="IN">IN STOCK</option>
            <option value="LOW">LOW STOCK</option>
            <option value="OUT">OUT</option>
          </select>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {filtered.map((i, idx) => {
          const s = statusOf(i.qty);
          return (
            <motion.button
              key={i.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.01, 0.2) }}
              onClick={() => setOpen(i.id)}
              className="flex items-center gap-3 border border-border bg-card p-3 text-left"
            >
              <div className="h-12 w-12 flex-shrink-0 bg-muted flex items-center justify-center font-display text-base text-primary">
                {i.brand[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-widest text-primary truncate">{i.brand.toUpperCase()}</p>
                <p className="text-sm font-medium truncate">{i.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{i.category} • {i.sizes.join(", ")}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-display text-2xl leading-none">{i.qty}</span>
                <span className={`px-1.5 py-0.5 text-[9px] tracking-widest ${
                  s === "IN" ? "bg-primary text-primary-foreground" :
                  s === "LOW" ? "bg-warning text-warning-foreground" :
                  "bg-destructive text-destructive-foreground"
                }`}>
                  {s === "IN" ? "IN" : s === "LOW" ? "LOW" : "OUT"}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">IMG</th>
              <th className="p-3 text-left">BRAND</th>
              <th className="p-3 text-left">ITEM</th>
              <th className="p-3 text-left">CAT</th>
              <th className="p-3 text-left">SIZES</th>
              <th className="p-3 text-left">COLOR</th>
              <th className="p-3 text-left">QTY</th>
              <th className="p-3 text-left">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i, idx) => {
              const s = statusOf(i.qty);
              return (
                <motion.tr
                  key={i.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                  onClick={() => setOpen(i.id)}
                  className="border-b border-border/50 cursor-pointer hover:bg-off-white/[0.04]"
                >
                  <td className="p-3 text-muted-foreground">{i.id}</td>
                  <td className="p-3">
                    <div className="h-10 w-10 bg-muted flex items-center justify-center font-display text-sm text-primary">
                      {i.brand[0]}
                    </div>
                  </td>
                  <td className="p-3 text-[10px] tracking-widest text-primary">{i.brand.toUpperCase()}</td>
                  <td className="p-3 font-medium">{i.name}</td>
                  <td className="p-3 text-muted-foreground text-xs">{i.category}</td>
                  <td className="p-3 text-xs text-muted-foreground">{i.sizes.join(", ")}</td>
                  <td className="p-3 text-xs">{i.color}</td>
                  <td className="p-3 font-display text-lg">{i.qty}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-1 text-[10px] tracking-widest ${
                      s === "IN" ? "bg-primary text-primary-foreground" :
                      s === "LOW" ? "bg-warning text-warning-foreground" :
                      "bg-destructive text-destructive-foreground"
                    }`}>
                      {s === "IN" ? "IN STOCK" : s === "LOW" ? "LOW STOCK" : "OUT"}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ItemEditor
        key={selected?.id ?? "none"}
        item={selected}
        onClose={() => setOpen(null)}
        onSave={(changes) => {
          if (!selected) return;
          editItem(selected.id, changes);
          toast.success("Item updated");
          setOpen(null);
        }}
        onRestock={(amount) => {
          if (!selected) return;
          restock(selected.id, amount);
          toast.success(`Restocked +${amount}`);
        }}
        onDelete={() => {
          if (!selected) return;
          removeItem(selected.id);
          toast.success("Item removed from inventory");
          setOpen(null);
        }}
      />
    </div>
  );
};

interface EditorProps {
  item: ReturnType<typeof useApp>["inventory"][number] | undefined;
  onClose: () => void;
  onSave: (changes: Partial<{ brand: string; name: string; color: string; qty: number; price: number; sizes: string[] }>) => void;
  onRestock: (amount: number) => void;
  onDelete: () => void;
}

const ItemEditor = ({ item, onClose, onSave, onRestock, onDelete }: EditorProps) => {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);
  const [sizes, setSizes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [restockAmt, setRestockAmt] = useState(5);

  useEffect(() => {
    if (!item) return;
    setBrand(item.brand);
    setName(item.name);
    setColor(item.color);
    setQty(item.qty);
    setPrice(item.price ?? 0);
    setSizes(item.sizes.join(", "));
  }, [item]);

  const finished = item?.qty === 0;

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="bg-card border-border text-off-white overflow-y-auto w-full sm:max-w-md">
        {item && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display text-3xl text-off-white">EDIT ITEM</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-5">
              <div className="aspect-square w-full bg-muted flex items-center justify-center font-display text-7xl text-primary overflow-hidden">
                {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : item.brand[0]}
              </div>

              {finished && (
                <div className="border border-warning/40 bg-warning/10 p-3 text-[11px] tracking-widest text-warning">
                  ITEM FINISHED — RESTOCK TO RETURN TO STORE
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => setRestockAmt(Math.max(1, restockAmt - 1))} className="border border-border p-1 hover:bg-off-white/[0.06]"><Minus className="h-3 w-3" /></button>
                    <input
                      type="number"
                      value={restockAmt}
                      onChange={(e) => setRestockAmt(Math.max(1, +e.target.value || 1))}
                      className="w-16 border border-border bg-background px-2 py-1 text-center text-sm"
                    />
                    <button onClick={() => setRestockAmt(restockAmt + 1)} className="border border-border p-1 hover:bg-off-white/[0.06]"><Plus className="h-3 w-3" /></button>
                    <button
                      onClick={() => onRestock(restockAmt)}
                      className="ml-auto inline-flex items-center gap-2 bg-primary px-3 py-2 text-[10px] tracking-widest text-primary-foreground hover:bg-primary/90"
                    >
                      <RotateCcw className="h-3 w-3" /> RESTOCK
                    </button>
                  </div>
                </div>
              )}

              <Field label="Brand" value={brand} onChange={setBrand} />
              <Field label="Name" value={name} onChange={setName} />
              <Field label="Color" value={color} onChange={setColor} />
              <Field label="Sizes (comma separated)" value={sizes} onChange={setSizes} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Qty" type="number" value={String(qty)} onChange={(v) => setQty(+v || 0)} />
                <Field label="Price (ETB)" type="number" value={String(price)} onChange={(v) => setPrice(+v || 0)} />
              </div>

              <div className="flex flex-col gap-2 pt-3">
                <button
                  onClick={() => onSave({
                    brand, name, color, qty, price,
                    sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
                  })}
                  className="inline-flex items-center justify-center gap-2 bg-primary px-4 py-3 text-[11px] tracking-widest text-primary-foreground hover:bg-primary/90"
                >
                  <Pencil className="h-3 w-3" /> SAVE CHANGES
                </button>
                {!finished && (
                  <button
                    onClick={() => onRestock(5)}
                    className="inline-flex items-center justify-center gap-2 border border-border px-4 py-3 text-[11px] tracking-widest hover:bg-off-white/[0.06]"
                  >
                    <RotateCcw className="h-3 w-3" /> RESTOCK +5
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center justify-center gap-2 border border-destructive/40 px-4 py-3 text-[11px] tracking-widest text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" /> REMOVE ITEM
                </button>
              </div>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {item.brand} — {item.name} will be deleted from inventory. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <label className="block">
    <span className="text-[10px] tracking-widest text-muted-foreground">{label.toUpperCase()}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
    />
  </label>
);

export default InventoryPage;
