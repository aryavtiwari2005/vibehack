import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ entry, onDelete, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const statusBorder = { todo: "border-l-[#94A3B8]", "in-progress": "border-l-[#60A5FA]", done: "border-l-[#34D399]" };
  const priorityStyle = { high: "bg-red-50 text-red-500", medium: "bg-[#60A5FA]/10 text-[#60A5FA]", low: "bg-[#F1F5F9] text-[#94A3B8]" };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white rounded-lg border border-[#E2E8F0] border-l-[3px] ${statusBorder[entry.status]} p-3 flex items-center gap-3 hover:shadow-sm transition-all`} data-testid={`planner-entry-${entry.id}`}>
      <button {...attributes} {...listeners} className="text-[#CBD5E1] hover:text-[#64748B] cursor-grab" data-testid={`drag-handle-${entry.id}`}><GripVertical size={16} /></button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-sm font-medium text-[#1E293B] truncate">{entry.title}</h4>
          <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${priorityStyle[entry.priority]}`}>{entry.priority}</span>
        </div>
        {entry.description && <p className="text-xs text-[#94A3B8] font-mono truncate">{entry.description}</p>}
        <p className="text-[10px] text-[#CBD5E1] font-mono mt-0.5">{entry.scheduled_date}</p>
      </div>
      <select value={entry.status} onChange={(e) => onStatusChange(entry.id, e.target.value)}
        className="bg-[#F9FAFB] border border-[#E2E8F0] text-xs text-[#64748B] font-mono px-2 py-1 rounded focus:outline-none focus:border-[#60A5FA]"
        data-testid={`status-select-${entry.id}`}>
        <option value="todo">TODO</option>
        <option value="in-progress">IN PROGRESS</option>
        <option value="done">DONE</option>
      </select>
      <button onClick={() => onDelete(entry.id)} className="text-[#CBD5E1] hover:text-red-400 transition-colors" data-testid={`delete-entry-${entry.id}`}><Trash2 size={16} /></button>
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

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => { API.get("/planner").then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const addEntry = async (e) => {
    e.preventDefault();
    try { const { data } = await API.post("/planner", { title, description, scheduled_date: date, priority }); setEntries([...entries, data]); setTitle(""); setDescription(""); setShowForm(false); } catch { }
  };
  const deleteEntry = async (id) => { try { await API.delete(`/planner/${id}`); setEntries(entries.filter(e => e.id !== id)); } catch { } };
  const updateStatus = async (id, status) => { try { await API.put(`/planner/${id}`, { status }); setEntries(entries.map(e => e.id === id ? { ...e, status } : e)); } catch { } };
  const handleDragEnd = (event) => { const { active, over } = event; if (active.id !== over?.id) { setEntries((items) => { const o = items.findIndex(i => i.id === active.id); const n = items.findIndex(i => i.id === over.id); return arrayMove(items, o, n); }); } };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#60A5FA] border-t-transparent rounded-full animate-spin" /></div>;

  const grouped = { todo: entries.filter(e => e.status === "todo"), "in-progress": entries.filter(e => e.status === "in-progress"), done: entries.filter(e => e.status === "done") };
  const colColors = { todo: "bg-[#F1F5F9] text-[#64748B]", "in-progress": "bg-[#60A5FA]/10 text-[#60A5FA]", done: "bg-[#34D399]/10 text-[#34D399]" };

  return (
    <div data-testid="planner-page">
      <div className="flex items-start justify-between mb-8">
        <div className="animate-fade-in-up stagger-1">
          <p className="text-sm font-semibold text-[#1E3A8A] mb-1 font-['Outfit']">Study Planner</p>
          <h2 className="font-['Outfit'] text-3xl font-bold tracking-tight text-[#1E293B]">Manage Your Schedule</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1E3A8A] text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E3A8A]/90 btn-press font-['Outfit'] flex items-center gap-2 animate-fade-in-up stagger-2"
          data-testid="add-task-button">
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Task</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addEntry} className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-8 space-y-4 animate-scale-in" data-testid="add-task-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA]" placeholder="Study task..." data-testid="task-title-input" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA]" data-testid="task-date-input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] font-mono mb-2 block">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#F9FAFB] border border-[#E2E8F0] px-4 py-2.5 text-sm font-mono text-[#1E293B] rounded-lg focus:outline-none focus:border-[#60A5FA]" placeholder="Optional details..." data-testid="task-description-input" />
          </div>
          <div className="flex items-center gap-4">
            <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-[#F9FAFB] border border-[#E2E8F0] text-sm text-[#1E293B] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-[#60A5FA]" data-testid="task-priority-select">
              <option value="high">HIGH</option><option value="medium">MEDIUM</option><option value="low">LOW</option>
            </select>
            <button type="submit" className="bg-[#34D399] text-[#1E293B] px-6 py-2 text-xs font-semibold rounded-lg hover:bg-[#34D399]/90 btn-press font-['Outfit']" data-testid="submit-task-button">Create Task</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Object.entries(grouped).map(([status, items]) => (
          <div key={status} className="bg-white rounded-xl border border-[#E2E8F0]">
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${colColors[status]}`}>{status.replace("-", " ").toUpperCase()}</span>
              <span className="text-xs text-[#1E3A8A] font-mono font-semibold">{items.length}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[180px]">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {items.map(entry => <SortableItem key={entry.id} entry={entry} onDelete={deleteEntry} onStatusChange={updateStatus} />)}
                </SortableContext>
              </DndContext>
              {items.length === 0 && <p className="text-xs text-[#CBD5E1] font-mono text-center py-8">No tasks</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
