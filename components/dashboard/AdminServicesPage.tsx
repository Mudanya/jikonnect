"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: { services: number };
}

interface Service {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  skillLevels: string[];
  category: { name: string; icon: string | null };
  _count: { professionals: number };
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "",
    description: "",
    order: 0,
  });

  const [serviceForm, setServiceForm] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    skillLevels: [""],
  });
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        fetch("/api/admin/service-categories", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/admin/services", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      const catData = await catRes.json();
      const svcData = await svcRes.json();
      if (catData.success) setCategories(catData.data);
      if (svcData.success) setServices(svcData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    const res = await fetch("/api/admin/service-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryForm),
    });
    const data = await res.json();
    if (data.success) {
      setCategories([...categories, data.data]);
      setShowCategoryModal(false);
      setCategoryForm({
        name: "",
        slug: "",
        icon: "",
        description: "",
        order: 0,
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete category?")) return;
    const res = await fetch(`/api/admin/service-categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json()
    toast.success(data.message)
    setCategories(categories.filter((c) => c.id !== id));
    setServices(services.filter((s) => s.categoryId !== id));
  };

  const handleCreateService = async () => {
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...serviceForm,
        skillLevels: serviceForm.skillLevels.filter((s) => s.trim()),
      }),
    });
    const data = await res.json();
    if (data.success) {
      setServices([...services, data.data]);
      setShowServiceModal(false);
      setServiceForm({
        name: "",
        slug: "",
        description: "",
        categoryId: "",
        skillLevels: [""],
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Delete service?")) return;
    await fetch(`/api/admin/services/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setServices(services.filter((s) => s.id !== id));
  };

  const filteredServices = selectedCategory
    ? services.filter((s) => s.categoryId === selectedCategory)
    : services;

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Service Management</h1>

      {/* Categories */}
      <div className="mb-12">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Categories ({categories.length})
          </h2>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-jiko-secondary hover:bg-jiko-secondary/80  cursor-pointer  text-jiko-primary rounded-lg"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-sm text-gray-500">
                      {cat._count?.services} services
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Services ({filteredServices.length})
          </h2>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowServiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-jiko-secondary hover:bg-jiko-secondary/80  cursor-pointer  text-jiko-primary rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Providers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y max-w-1/2 overflow-hidden">
              {filteredServices.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{svc.name}</div>
                    <div className="text-sm text-gray-500">{svc.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    {svc.category.icon} {svc.category.name}
                  </td>
                  <td className="px-6 py-4">{svc._count?.professionals}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">Add Category</h2>
              <button onClick={() => setShowCategoryModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Slug"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, slug: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Icon 🏠"
                value={categoryForm.icon}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, icon: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="flex-1 px-4 py-2 bg-jiko-secondary hover:bg-jiko-secondary/80  cursor-pointer  text-jiko-primary rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">Add Service</h2>
              <button onClick={() => setShowServiceModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Slug"
                value={serviceForm.slug}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, slug: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={serviceForm.categoryId}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, categoryId: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Skill Levels
                </label>
                {serviceForm.skillLevels.map((level, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={level}
                      onChange={(e) => {
                        const newLevels = [...serviceForm.skillLevels];
                        newLevels[i] = e.target.value;
                        setServiceForm({
                          ...serviceForm,
                          skillLevels: newLevels,
                        });
                      }}
                      placeholder="Basic Worker"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    {i > 0 && (
                      <button
                        onClick={() =>
                          setServiceForm({
                            ...serviceForm,
                            skillLevels: serviceForm.skillLevels.filter(
                              (_, idx) => idx !== i
                            ),
                          })
                        }
                        className="p-2 text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setServiceForm({
                      ...serviceForm,
                      skillLevels: [...serviceForm.skillLevels, ""],
                    })
                  }
                  className="text-sm text-primary"
                >
                  + Add Level
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowServiceModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateService}
                className="flex-1 px-4 py-2 bg-jiko-secondary hover:bg-jiko-secondary/80  cursor-pointer  text-jiko-primary rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
