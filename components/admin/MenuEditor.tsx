"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale, LocalizedText } from "@/data/i18n";
import type { MenuCategory, MenuItem } from "@/data/menu";
import {
  EDIT_LOCALES,
  apiRequest,
  collectIds,
  formatIdr,
  newCategory,
  newItem,
  uniqueId,
} from "@/lib/admin-client";
import { ImageUploader } from "./ImageUploader";

type Props = {
  repo: string;
  branch: string;
  onLogout: () => void;
};

export function MenuEditor({ repo, branch, onLogout }: Props) {
  const [categories, setCategories] = useState<MenuCategory[] | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<{ categories: MenuCategory[] }>("/api/admin/menu");
      setCategories(data.categories);
      setDirty(false);
      setMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Menü yüklenemedi");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(
    () => ({
      categories: categories?.length ?? 0,
      items: (categories ?? []).reduce((total, category) => total + category.items.length, 0),
    }),
    [categories],
  );

  function commit(next: MenuCategory[]) {
    setCategories(next);
    setDirty(true);
    setMessage(null);
    setError(null);
  }

  function patchCategory(index: number, patch: Partial<MenuCategory>) {
    if (!categories) return;
    commit(categories.map((category, position) => (position === index ? { ...category, ...patch } : category)));
  }

  function patchItem(categoryIndex: number, itemIndex: number, patch: Partial<MenuItem>) {
    if (!categories) return;
    commit(
      categories.map((category, position) =>
        position !== categoryIndex
          ? category
          : {
              ...category,
              items: category.items.map((item, itemPosition) =>
                itemPosition === itemIndex ? { ...item, ...patch } : item,
              ),
            },
      ),
    );
  }

  function withLocale(text: LocalizedText, value: string): LocalizedText {
    return { ...text, [locale]: value };
  }

  function copyToAllLanguages(categoryIndex: number, itemIndex: number, field: "name" | "description") {
    if (!categories) return;
    const item = categories[categoryIndex]?.items[itemIndex];
    if (!item) return;
    const source = item[field][locale];
    patchItem(categoryIndex, itemIndex, { [field]: { en: source, id: source, ru: source, tr: source } });
  }

  function addItem(categoryIndex: number) {
    if (!categories) return;
    const taken = collectIds(categories);
    const id = uniqueId("yeni-kalem", taken);
    const category = categories[categoryIndex];
    if (!category) return;
    patchCategory(categoryIndex, { items: [...category.items, newItem(id)] });
  }

  function removeItem(categoryIndex: number, itemIndex: number) {
    if (!categories) return;
    const category = categories[categoryIndex];
    if (!category || category.items.length <= 1) {
      setError("Kategoride en az 1 kalem kalmalı.");
      return;
    }
    patchCategory(categoryIndex, { items: category.items.filter((_, position) => position !== itemIndex) });
  }

  function moveItem(categoryIndex: number, itemIndex: number, direction: -1 | 1) {
    if (!categories) return;
    const category = categories[categoryIndex];
    if (!category) return;
    const target = itemIndex + direction;
    if (target < 0 || target >= category.items.length) return;
    const items = [...category.items];
    const [moved] = items.splice(itemIndex, 1);
    items.splice(target, 0, moved);
    patchCategory(categoryIndex, { items });
  }

  function addCategory() {
    if (!categories) return;
    const id = uniqueId("yeni-kategori", collectIds(categories));
    commit([...categories, newCategory(id)]);
  }

  function removeCategory(categoryIndex: number) {
    if (!categories) return;
    if (categories.length <= 1) {
      setError("Menüde en az 1 kategori kalmalı.");
      return;
    }
    commit(categories.filter((_, position) => position !== categoryIndex));
  }

  async function handleSave() {
    if (!categories) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await apiRequest<{ commit: string; categories: number; items: number }>("/api/admin/menu", {
        method: "PUT",
        body: JSON.stringify({ categories }),
      });
      setDirty(false);
      setMessage(
        `Yayınlandı: ${result.categories} kategori / ${result.items} kalem · commit ${result.commit.slice(0, 7)} · site ~40 sn içinde güncellenir.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yayınlama başarısız");
    } finally {
      setSaving(false);
    }
  }

  if (!categories) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-slate-400">{error ?? "Menü yükleniyor…"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Menü yönetimi</h1>
          <p className="mt-1 text-xs text-slate-400">
            {totals.categories} kategori · {totals.items} kalem ·{" "}
            <span className="font-mono">
              {repo}@{branch}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Siteyi aç
          </a>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Geri al / yenile
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Yayınlanıyor…" : dirty ? "Yayınla •" : "Yayınla"}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Çıkış
          </button>
        </div>
      </header>

      {message ? (
        <p className="mt-4 rounded-lg bg-emerald-950 px-3 py-2 text-xs text-emerald-300">{message}</p>
      ) : null}
      {error ? <p className="mt-4 rounded-lg bg-rose-950 px-3 py-2 text-xs text-rose-300">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>Düzenlenen dil:</span>
        {EDIT_LOCALES.map((entry) => (
          <button
            key={entry.code}
            type="button"
            onClick={() => setLocale(entry.code)}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              locale === entry.code ? "bg-brand-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {entry.label}
          </button>
        ))}
        <span className="text-slate-500">· kaydetmeden önce dört dilin de dolu olması gerekir</span>
      </div>

      {categories.map((category, categoryIndex) => (
        <CategoryCard
          key={category.id}
          category={category}
          locale={locale}
          onPatchCategory={(patch) => patchCategory(categoryIndex, patch)}
          onPatchItem={(itemIndex, patch) => patchItem(categoryIndex, itemIndex, patch)}
          onAddItem={() => addItem(categoryIndex)}
          onRemoveItem={(itemIndex) => removeItem(categoryIndex, itemIndex)}
          onMoveItem={(itemIndex, direction) => moveItem(categoryIndex, itemIndex, direction)}
          onCopyToAll={(itemIndex, field) => copyToAllLanguages(categoryIndex, itemIndex, field)}
          onRemoveCategory={() => removeCategory(categoryIndex)}
        />
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="mt-6 w-full rounded-xl border border-dashed border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900"
      >
        + Kategori ekle
      </button>

      <p className="mt-6 text-xs text-slate-500">
        &quot;Yayınla&quot;, <span className="font-mono">data/menu.json</span> dosyasını GitHub&apos;a commit eder; Vercel
        otomatik build alır (~40 sn). Görseller de aynı şekilde repoya eklenir, yani her değişiklik geri alınabilir.
      </p>
    </div>
  );
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500";
const miniButtonClass =
  "rounded-md border border-slate-700 px-2 py-1 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-40";

type CategoryCardProps = {
  category: MenuCategory;
  locale: Locale;
  onPatchCategory: (patch: Partial<MenuCategory>) => void;
  onPatchItem: (itemIndex: number, patch: Partial<MenuItem>) => void;
  onAddItem: () => void;
  onRemoveItem: (itemIndex: number) => void;
  onMoveItem: (itemIndex: number, direction: -1 | 1) => void;
  onCopyToAll: (itemIndex: number, field: "name" | "description") => void;
  onRemoveCategory: () => void;
};

function CategoryCard({
  category,
  locale,
  onPatchCategory,
  onPatchItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onCopyToAll,
  onRemoveCategory,
}: CategoryCardProps) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-400">
          İkon
          <input
            value={category.icon}
            onChange={(event) => onPatchCategory({ icon: event.target.value })}
            className="mt-1 block w-16 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-lg"
          />
        </label>
        <label className="min-w-[200px] flex-1 text-xs text-slate-400">
          Kategori adı ({locale.toUpperCase()})
          <input
            value={category.name[locale]}
            onChange={(event) => onPatchCategory({ name: { ...category.name, [locale]: event.target.value } })}
            className={inputClass}
          />
        </label>
        <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-400">{category.id}</span>
        <button
          type="button"
          onClick={onRemoveCategory}
          className="rounded-lg border border-rose-900 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-950"
        >
          Kategoriyi sil
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {category.items.map((item, itemIndex) => (
          <ItemRow
            key={item.id}
            item={item}
            locale={locale}
            index={itemIndex}
            total={category.items.length}
            onPatch={(patch) => onPatchItem(itemIndex, patch)}
            onRemove={() => onRemoveItem(itemIndex)}
            onMove={(direction) => onMoveItem(itemIndex, direction)}
            onCopyToAll={(field) => onCopyToAll(itemIndex, field)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="mt-4 w-full rounded-lg border border-dashed border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-900"
      >
        + Kalem ekle
      </button>
    </section>
  );
}

type ItemRowProps = {
  item: MenuItem;
  locale: Locale;
  index: number;
  total: number;
  onPatch: (patch: Partial<MenuItem>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onCopyToAll: (field: "name" | "description") => void;
};

function ItemRow({ item, locale, index, total, onPatch, onRemove, onMove, onCopyToAll }: ItemRowProps) {
  const addOn = item.addOn;

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-slate-500">{item.id}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={miniButtonClass}>
            ↑
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className={miniButtonClass}>
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md border border-rose-900 px-2 py-1 font-semibold text-rose-300 transition hover:bg-rose-950"
          >
            Sil
          </button>
        </div>
      </div>

      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <label className="text-xs text-slate-400">
          Ad ({locale.toUpperCase()})
          <input
            value={item.name[locale]}
            onChange={(event) => onPatch({ name: { ...item.name, [locale]: event.target.value } })}
            className={inputClass}
          />
        </label>
        <label className="text-xs text-slate-400">
          Fiyat (IDR) · {formatIdr(item.price)}
          <input
            type="number"
            min={1000}
            step={1000}
            value={item.price}
            onChange={(event) => onPatch({ price: Number(event.target.value) || 0 })}
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-2 block text-xs text-slate-400">
        Açıklama ({locale.toUpperCase()})
        <textarea
          rows={2}
          value={item.description[locale]}
          onChange={(event) => onPatch({ description: { ...item.description, [locale]: event.target.value } })}
          className={`${inputClass} resize-y`}
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => onCopyToAll("name")} className={miniButtonClass}>
          Adı tüm dillere kopyala
        </button>
        <button type="button" onClick={() => onCopyToAll("description")} className={miniButtonClass}>
          Açıklamayı tüm dillere kopyala
        </button>
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-400">Görseller</p>
          <ImageUploader images={item.images} slug={item.id} onChange={(images) => onPatch({ images })} />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={Boolean(addOn)}
              onChange={(event) =>
                onPatch({
                  addOn: event.target.checked
                    ? {
                        label: {
                          en: "Add Ice Cream",
                          id: "Tambah Es Krim",
                          ru: "Добавить мороженое",
                          tr: "Dondurma Ekle",
                        },
                        price: 20000,
                      }
                    : undefined,
                })
              }
            />
            Ekstra seçenek (add-on)
          </label>

          {addOn ? (
            <div className="grid gap-2">
              <input
                value={addOn.label[locale]}
                onChange={(event) =>
                  onPatch({ addOn: { ...addOn, label: { ...addOn.label, [locale]: event.target.value } } })
                }
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                step={1000}
                value={addOn.price}
                onChange={(event) => onPatch({ addOn: { ...addOn, price: Number(event.target.value) || 0 } })}
                className={inputClass}
              />
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-xs text-slate-400">
            Renk (swatch)
            <input
              type="color"
              value={item.swatch ?? "#f43f5e"}
              onChange={(event) => onPatch({ swatch: event.target.value })}
              className="h-8 w-14 rounded border border-slate-700 bg-slate-950"
            />
          </label>
        </div>
      </div>
    </article>
  );
}
