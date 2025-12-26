"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Save, Loader } from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

interface Availability {
  [key: string]: DayAvailability;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/provider/availability", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setAvailability(result.data || getDefaultAvailability());
      } else {
        setAvailability(getDefaultAvailability());
      }
    } catch (error) {
      console.error("Failed to load availability:", error);
      setAvailability(getDefaultAvailability());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAvailability = (): Availability => {
    const defaultAvailability: Availability = {};
    DAYS.forEach((day) => {
      defaultAvailability[day] = {
        enabled: day !== "Sunday", // Default: available Monday-Saturday
        slots: [
          {
            start: "09:00",
            end: "17:00",
            available: true,
          },
        ],
      };
    });
    return defaultAvailability;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/provider/availability", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability }),
      });

      if (response.ok) {
        toast.success("Availability saved successfully!");
      } else {
        toast.error("Failed to save availability");
      }
    } catch (error) {
      console.error("Failed to save availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        enabled: !availability[day].enabled,
      },
    });
  };

  const updateSlot = (
    day: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newSlots = [...availability[day].slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots: newSlots,
      },
    });
  };

  const addSlot = (day: string) => {
    const newSlots = [
      ...availability[day].slots,
      { start: "09:00", end: "17:00", available: true },
    ];
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots: newSlots,
      },
    });
  };

  const removeSlot = (day: string, index: number) => {
    const newSlots = availability[day].slots.filter((_, i) => i !== index);
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots:
          newSlots.length > 0
            ? newSlots
            : [{ start: "09:00", end: "17:00", available: true }],
      },
    });
  };

  const setQuickTemplate = (template: "business" | "24-7" | "weekends") => {
    const newAvailability: Availability = {};

    DAYS.forEach((day) => {
      switch (template) {
        case "business":
          newAvailability[day] = {
            enabled: !["Saturday", "Sunday"].includes(day),
            slots: [{ start: "09:00", end: "17:00", available: true }],
          };
          break;
        case "24-7":
          newAvailability[day] = {
            enabled: true,
            slots: [{ start: "00:00", end: "23:59", available: true }],
          };
          break;
        case "weekends":
          newAvailability[day] = {
            enabled: ["Saturday", "Sunday"].includes(day),
            slots: [{ start: "09:00", end: "17:00", available: true }],
          };
          break;
      }
    });

    setAvailability(newAvailability);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Availability Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              Set when you're available for bookings
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Save size={20} />
            <span>{saving ? "Saving..." : "Save Availability"}</span>
          </button>
        </div>

        {/* Quick Templates */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setQuickTemplate("business")}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-left"
            >
              <h3 className="font-bold text-gray-900 mb-1">Business Hours</h3>
              <p className="text-sm text-gray-600">Mon-Fri, 9 AM - 5 PM</p>
            </button>
            <button
              onClick={() => setQuickTemplate("24-7")}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-left"
            >
              <h3 className="font-bold text-gray-900 mb-1">24/7 Available</h3>
              <p className="text-sm text-gray-600">All days, all hours</p>
            </button>
            <button
              onClick={() => setQuickTemplate("weekends")}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-left"
            >
              <h3 className="font-bold text-gray-900 mb-1">Weekends Only</h3>
              <p className="text-sm text-gray-600">Sat-Sun, 9 AM - 5 PM</p>
            </button>
          </div>
        </div>

        {/* Day-by-Day Configuration */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Custom Schedule
          </h2>
          <div className="space-y-6">
            {DAYS.map((day) => (
              <div key={day} className="border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={availability[day]?.enabled || false}
                      onChange={() => toggleDay(day)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <h3 className="text-lg font-bold text-gray-900">{day}</h3>
                  </div>
                  {availability[day]?.enabled && (
                    <button
                      onClick={() => addSlot(day)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Time Slot
                    </button>
                  )}
                </div>

                {availability[day]?.enabled && (
                  <div className="space-y-3 ml-9">
                    {availability[day].slots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Clock size={18} className="text-gray-400" />
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            updateSlot(day, index, "start", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            updateSlot(day, index, "end", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {availability[day].slots.length > 1 && (
                          <button
                            onClick={() => removeSlot(day, index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!availability[day]?.enabled && (
                  <p className="text-sm text-gray-500 ml-9">Unavailable</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-3">
            Tips for Managing Availability
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Keep your availability up to date to get more bookings</li>
            <li>
              • You can add multiple time slots per day for flexible scheduling
            </li>
            <li>• Changes take effect immediately after saving</li>
            <li>• Clients can only book during your available hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
