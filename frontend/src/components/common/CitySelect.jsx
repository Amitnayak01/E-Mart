import React, { useMemo, useState } from "react";
import { Search, MapPin } from "lucide-react";

const ODISHA_CITIES = [
  "Bhubaneswar","Cuttack","Rourkela","Sambalpur","Berhampur","Balasore","Baripada","Puri",
  "Bhadrak","Jeypore","Angul","Dhenkanal","Jharsuguda","Koraput","Rayagada","Keonjhar",
  "Paradeep","Jajpur","Bargarh","Sundargarh","Nayagarh","Phulbani","Kendrapara","Jagatsinghpur",
  "Ganjam","Kalahandi","Malkangiri","Nabarangpur","Nuapada","Sonepur","Boudh","Deogarh",
  "Talcher","Choudwar","Khurda","Gunupur","Aska","Hinjilicut","Athgarh","Banki","Basudevpur",
  "Pattamundai","Udala","Nilgiri","Dhamnagar","Rairangpur","Umarkote","Jatni","Pipili",
  "Kantabanji","Titlagarh","Patnagarh","Padampur","Bhanjanagar","Buguda","Kashinagar",
  "Gopalpur","Digapahandi","Polasara","Chhatrapur","Odagaon","Banapur","Balugaon","Chandbali",
  "Aul","Tangi","Chikiti","Daringbadi","Kotpad","Sunabeda","Laxmipur","Bissam Cuttack"
];

export default function CitySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return ODISHA_CITIES.filter((c) =>
      c.toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full rounded-xl border px-3 py-2 flex items-center justify-between bg-white"
      >
        <span className="flex items-center gap-2 text-slate-700">
          <MapPin className="w-4 h-4" />
          {value || "Select city"}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white shadow-soft border p-3">
          <div className="flex items-center gap-2 border rounded-xl px-2 py-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              placeholder="Search city..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>

          <div className="mt-2 max-h-52 overflow-y-auto space-y-1">
            {list.map((city) => (
              <button
                key={city}
                onClick={() => {
                  onChange(city);
                  setOpen(false);
                  setQ("");
                }}
                className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-100 text-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
