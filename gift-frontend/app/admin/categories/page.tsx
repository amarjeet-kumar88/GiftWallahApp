// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { FolderTree, Loader2, Plus, Trash2, Edit3 } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug?: string;
  parent?: Category | string | null;
};

type FormState = {
  name: string;
  slug: string;
  parentId: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  parentId: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient.get("/admin/categories");
      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.categories ?? payload;
      setCategories(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to load categories."
      );
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      slug: cat.slug || "",
      parentId:
        typeof cat.parent === "string"
          ? cat.parent
          : (cat.parent as any)?._id || "",
    });
  };

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    try
    {
      setIsSaving(true);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        parentId: form.parentId || null,
      };

      let res;
      if (editingId) {
        res = await apiClient.patch(`/admin/categories/${editingId}`, payload);
      } else {
        res = await apiClient.post("/admin/categories", payload);
      }

      // refresh
      await fetchCategories();
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to save category."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Products linked to it may break."
      )
    )
      return;

    try {
      setIsDeletingId(id);
      await apiClient.delete(`/admin/categories/${id}`);
      await fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to delete category."
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  // --------- UI ----------

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading categories...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-slate-700">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
            <FolderTree className="h-4 w-4 text-brand-primary" />
            Categories
          </h1>
          <p className="text-[11px] text-slate-500 md:text-xs">
            Manage category tree & parent-child structure.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1 rounded bg-brand-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700 md:text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New Category
        </button>
      </div>

      {/* Form */}
      <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm md:p-4 md:text-sm">
        <h2 className="mb-2 text-xs font-semibold text-slate-800 md:text-sm">
          {editingId ? "Edit Category" : "Create Category"}
        </h2>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Name
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Slug (optional)
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.slug}
              onChange={(e) => handleFormChange("slug", e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
              Parent (optional)
            </label>
            <select
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              value={form.parentId}
              onChange={(e) =>
                handleFormChange("parentId", e.target.value)
              }
            >
              <option value="">No parent</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded border border-slate-300 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100 md:text-xs"
            >
              Cancel edit
            </button>
          )}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit}
            className="rounded bg-brand-primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 md:text-xs"
          >
            {isSaving
              ? editingId
                ? "Updating..."
                : "Creating..."
              : editingId
              ? "Update"
              : "Create"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm md:p-4 md:text-sm">
        <h2 className="mb-2 text-xs font-semibold text-slate-800 md:text-sm">
          All Categories
        </h2>

        {categories.length === 0 ? (
          <p className="text-[11px] text-slate-500 md:text-xs">
            No categories yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px] md:text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="border-b border-slate-200 px-2 py-2 text-left">
                    Name
                  </th>
                  <th className="border-b border-slate-200 px-2 py-2 text-left">
                    Slug
                  </th>
                  <th className="border-b border-slate-200 px-2 py-2 text-left">
                    Parent
                  </th>
                  <th className="border-b border-slate-200 px-2 py-2 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const parentName =
                    typeof c.parent === "object"
                      ? (c.parent as any)?.name
                      : categories.find((p) => p._id === c.parent)?.name;

                  return (
                    <tr key={c._id} className="border-b border-slate-100">
                      <td className="px-2 py-2 align-top font-semibold text-slate-900">
                        {c.name}
                      </td>
                      <td className="px-2 py-2 align-top text-slate-500">
                        {c.slug || "—"}
                      </td>
                      <td className="px-2 py-2 align-top text-slate-500">
                        {parentName || "—"}
                      </td>
                      <td className="px-2 py-2 align-top text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 hover:bg-slate-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isDeletingId === c._id}
                            onClick={() => handleDelete(c._id)}
                            className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
