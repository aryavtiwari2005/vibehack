import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ entry, onDelete, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const statusColors = {
    todo: "border-l-white/30",
    "in-progress": "border-l-[#FACC15]",
    done: "border-l-[#FACC15] bg-[#FACC15]/5",
  };

  const priorityLabels = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-[#FACC15]/20 text-[#FACC15]",
    low: "bg-white/10 text-white/40",
  };

  return (
    <div ref={setNodeRef} style={style} className={`border border-white/10 border-l-2 ${statusColors[entry.status]} p-4 flex items-center gap-3 hover:bg-white/5 transition-colors`} data-testid={`planner-entry-${entry.id}`}>
      <button {...attributes} {...listeners} className="text-white/20 hover:text-white/50 cursor-grab" data-testid={`drag-handle-${entry.id}`}>
        <GripVertical size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium truncate">{entry.title}</h4>
          <span className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 ${priorityLabels[entry.priority]}`}>{entry.priority}</span>
        </div>
        {entry.description && <p className="text-xs text-white/30 font-mono truncate">{entry.description}</p>}
        <p className="text-[10px] text-white/20 font-mono mt-1">{entry.scheduled_date}</p>
      </div>
      <select
        value={entry.status}
        onChange={(e) => onStatusChange(entry.id, e.target.value)}
        className="bg-transparent border border-white/15 text-xs text-white/60 font-mono px-2 py-1 focus:outline-none focus:border-[#FACC15]"
        data-testid={`status-select-${entry.id}`}
      >
        <option value="todo" className="bg-[#0A0A0A]">TODO</option>
        <option value="in-progress" className="bg-[#0A0A0A]">IN PROGRESS</option>
        <option value="done" className="bg-[#0A0A0A]">DONE</option>
      </select>
      <button onClick={() => onDelete(entry.id)} className="text-white/20 hover:text-red-400 transition-colors" data-testid={`delete-entry-${entry.id}`}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function Planner() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState("medium");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    API.get("/planner").then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addEntry = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/planner", { title, description, scheduled_date: date, priority });
      setEntries([...entries, data]);
      setTitle(""); setDescription(""); setShowForm(false);
    } catch { }
  };

  const deleteEntry = async (id) => {
    try {
      await API.delete(`/planner/${id}`);
      setEntries(entries.filter(e => e.id !== id));
    } catch { }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/planner/${id}`, { status });
      setEntries(entries.map(e => e.id === id ? { ...e, status } : e));
    } catch { }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setEntries((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#FACC15] border-t-transparent animate-spin" /></div>;

  const grouped = {
    todo: entries.filter(e => e.status === "todo"),
    "in-progress": entries.filter(e => e.status === "in-progress"),
    done: entries.filter(e => e.status === "done"),
  };

  return (
    <div data-testid="planner-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#FACC15] mb-2 font-mono">STUDY PLANNER</p>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tighter">Manage Your Schedule</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FACC15] text-[#0A0A0A] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 transition-colors font-['Outfit'] flex items-center gap-2"
          data-testid="add-task-button"
        >
          {showForm ? <><X size={14} /> CANCEL</> : <><Plus size={14} /> ADD TASK</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addEntry} className="border border-white/15 p-6 mb-8 space-y-4" data-testid="add-task-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15]" placeholder="Study task..." data-testid="task-title-input" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15]" data-testid="task-date-input" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-white/50 font-mono mb-2 block">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FACC15]" placeholder="Optional details..." data-testid="task-description-input" />
          </div>
          <div className="flex items-center gap-4">
            <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-transparent border border-white/15 text-sm text-white font-mono px-3 py-2 focus:outline-none focus:border-[#FACC15]" data-testid="task-priority-select">
              <option value="high" className="bg-[#0A0A0A]">HIGH</option>
              <option value="medium" className="bg-[#0A0A0A]">MEDIUM</option>
              <option value="low" className="bg-[#0A0A0A]">LOW</option>
            </select>
            <button type="submit" className="bg-[#FACC15] text-[#0A0A0A] px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#FACC15]/90 font-['Outfit']" data-testid="submit-task-button">
              CREATE TASK
            </button>
          </div>
        </form>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([status, items]) => (
          <div key={status} className="border border-white/15">
            <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-mono text-white/60">{status.replace("-", " ")}</span>
              <span className="text-xs text-[#FACC15] font-mono">{items.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {items.map(entry => (
                    <SortableItem key={entry.id} entry={entry} onDelete={deleteEntry} onStatusChange={updateStatus} />
                  ))}
                </SortableContext>
              </DndContext>
              {items.length === 0 && <p className="text-xs text-white/15 font-mono text-center py-8">No tasks</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
