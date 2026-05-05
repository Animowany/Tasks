import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const STATUS_LABELS = {
  todo: 'Do zrobienia',
  in_progress: 'W trakcie',
  done: 'Wykonane',
};

const STATUS_OPTIONS = [
  { value: 'todo', label: STATUS_LABELS.todo },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'done', label: STATUS_LABELS.done },
];

const STATUSES = ['todo', 'in_progress', 'done'];

const stopDragEvent = (event) => {
  event.stopPropagation();
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SortableTask({ task, onEdit, onDelete, isEditing, editValues, onEditChange, onSave, onCancel }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`cursor-grab rounded-3xl bg-white p-6 shadow-sm active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">ID {task.id}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{task.title}</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            Status:<span className="font-semibold text-slate-900">{STATUS_LABELS[task.status]}</span>
          </div>
        </div>

        <p className="text-sm text-slate-500">Utworzone: {formatDate(task.created_at)}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" onPointerDown={stopDragEvent} onKeyDown={stopDragEvent}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          Edytuj
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Usuń
        </button>
      </div>

      {isEditing ? (
        <div
          className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5"
          onPointerDown={stopDragEvent}
          onKeyDown={stopDragEvent}
        >
          <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Nowy tytuł</span>
              <input
                value={editValues.title}
                onChange={(e) => onEditChange({ ...editValues, title: e.target.value })}
                className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={editValues.status}
                onChange={(e) => onEditChange({ ...editValues, status: e.target.value })}
                className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSave(task)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Zapisz zmiany
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Anuluj
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Column({ id, title, tasks, onEdit, onDelete, isEditing, editValues, onEditChange, onSave, onCancel }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4 rounded-3xl bg-white px-6 py-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{tasks.length} {tasks.length === 1 ? 'zadanie' : 'zadań'}</p>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-4 min-h-[400px] rounded-3xl p-4 transition ${isOver ? 'bg-slate-200 ring-2 ring-slate-300' : 'bg-slate-100'}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              isEditing={isEditing === task.id}
              editValues={editValues}
              onEditChange={onEditChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center min-h-[200px] text-slate-400 text-sm">
            Przeciągnij tutaj zadanie
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', status: 'todo' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editValues, setEditValues] = useState({ title: '', status: 'todo' });
  const [activeId, setActiveId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.data || []);
    } catch (exception) {
      setError('Couldn`t fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setForm({ title: '', status: 'todo' });
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title || form.title.trim().length === 0) {
      errors.title = 'Tytuł nie może być pusty';
    }
    if (form.title && form.title.trim().length < 3) {
      errors.title = 'Tytuł musi mieć co najmniej 3 znaki';
    }
    if (form.title && form.title.trim().length > 255) {
      errors.title = 'Tytuł może mieć maksymalnie 255 znaków';
    }
    if (!form.status || !STATUSES.includes(form.status)) {
      errors.status = 'Wybierz prawidłowy status';
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await axios.post('/api/tasks', form);
      resetForm();
      await fetchTasks();
    } catch (exception) {
      if (exception.response?.data?.message) {
        setError(exception.response.data.message);
      } else {
        setError('Couldn`t add task.');
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditValues({ title: task.title, status: task.status });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditValues({ title: '', status: 'todo' });
  };

  const saveTask = async (task) => {
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/tasks/${task.id}`, editValues);
      await fetchTasks();
      cancelEditing();
    } catch (exception) {
      const payload = exception.response?.data;
      if (payload?.message) {
        setError(payload.message);
      } else {
        setError('Couldn`t save task.');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async () => {
    if (!taskToDelete) return;
    
    setSaving(true);
    setError('');

    try {
      await axios.delete(`/api/tasks/${taskToDelete.id}`);
      setTaskToDelete(null);
      await fetchTasks();
    } catch (exception) {
      setError('Couldn`t delete task.');
    } finally {
      setSaving(false);
    }
  };

  const persistTaskOrder = async (orderedTasks, affectedStatuses, fallbackTasks) => {
    setSaving(true);
    setError('');

    try {
      const affectedTasks = orderedTasks.filter((task) => affectedStatuses.includes(task.status));
      await Promise.all(affectedTasks.map((task) => (
        axios.put(`/api/tasks/${task.id}`, {
          status: task.status,
          position: task.position,
        })
      )));
      await fetchTasks();
    } catch (exception) {
      setTasks(fallbackTasks);
      const payload = exception.response?.data;
      if (payload?.message) {
        setError(payload.message);
      } else {
        setError('Couldn`t save task order.');
      }
    } finally {
      setSaving(false);
    }
  };

  const buildOrderedTasks = (groupedTasks) => (
    STATUSES.flatMap((status) => (
      groupedTasks[status].map((task, index) => ({
        ...task,
        status,
        position: index,
      }))
    ))
  );

  const tasksByStatus = useMemo(() => {
    const grouped = {};
    STATUSES.forEach(status => {
      grouped[status] = tasks
        .filter(task => task.status === status)
        .sort((first, second) => (first.position ?? 0) - (second.position ?? 0));
    });
    return grouped;
  }, [tasks]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    const activeStatus = activeTask.status;
    const overTask = tasks.find(task => task.id === overId);
    const newStatus = STATUSES.includes(overId) ? overId : overTask?.status;

    if (!newStatus || activeId === overId) {
      return;
    }

    const grouped = {};
    STATUSES.forEach((status) => {
      grouped[status] = tasks.filter((task) => task.status === status);
    });

    let affectedStatuses = [activeStatus];

    if (overTask && overTask.status === activeStatus) {
      const oldIndex = grouped[activeStatus].findIndex((task) => task.id === activeId);
      const newIndex = grouped[activeStatus].findIndex((task) => task.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      grouped[activeStatus] = arrayMove(grouped[activeStatus], oldIndex, newIndex);
    } else {
      grouped[activeStatus] = grouped[activeStatus].filter((task) => task.id !== activeId);

      const targetIndex = overTask
        ? grouped[newStatus].findIndex((task) => task.id === overId)
        : grouped[newStatus].length;

      grouped[newStatus].splice(
        targetIndex >= 0 ? targetIndex : grouped[newStatus].length,
        0,
        { ...activeTask, status: newStatus }
      );

      affectedStatuses = [...new Set([activeStatus, newStatus])];
    }

    const nextTasks = buildOrderedTasks(grouped);
    const previousTasks = tasks;

    setTasks(nextTasks);
    persistTaskOrder(nextTasks, affectedStatuses, previousTasks);
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Tasks</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Zarządzaj swoją listą zadań</h1>
            <p className="mt-2 text-slate-600">Przeciągaj zadania między listami, aby zmienić ich statusy. Zmieniaj im kolejność według priorytetu.</p>
          </div>
          <form className="grid gap-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr]" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Tytuł zadania</span>
              <input
                value={form.title}
                onChange={(event) => {
                  setForm((current) => ({ ...current, title: event.target.value }));
                  if (validationErrors.title) {
                    setValidationErrors(prev => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="np. Dorobienie funkcji X w projekcie Y"
                className={`rounded-2xl border ${validationErrors.title ? 'border-red-400' : 'border-slate-200'} bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none`}
              />
              {validationErrors.title && (
                <span className="text-xs text-red-600">{validationErrors.title}</span>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={form.status}
                onChange={(event) => {
                  setForm((current) => ({ ...current, status: event.target.value }));
                  if (validationErrors.status) {
                    setValidationErrors(prev => ({ ...prev, status: '' }));
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">&nbsp;</span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-[50px] w-full items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Dodaj zadanie
              </button>
            </div>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-4">
                {error}
              </div>
            )}
          </form>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {STATUSES.map((status) => (
              <Column
                key={status}
                id={status}
                title={STATUS_LABELS[status]}
                tasks={tasksByStatus[status] || []}
                onEdit={startEditing}
                onDelete={setTaskToDelete}
                isEditing={editingTaskId}
                editValues={editValues}
                onEditChange={setEditValues}
                onSave={saveTask}
                onCancel={cancelEditing}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rounded-3xl bg-white p-6 shadow-lg opacity-90 max-w-sm">
                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex flex-col gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">ID {activeTask.id}</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">{activeTask.title}</h3>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                      Status:<span className="font-semibold text-slate-900">{STATUS_LABELS[activeTask.status]}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">Utworzone: {formatDate(activeTask.created_at)}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {taskToDelete ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
            <div
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
              onPointerDown={stopDragEvent}
              onKeyDown={stopDragEvent}
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Usuń zadanie</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{taskToDelete.title}</h2>
              <p className="mt-3 text-sm text-slate-600">
                Tej operacji nie można cofnąć.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
                  disabled={saving}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={deleteTask}
                  disabled={saving}
                  className="rounded-2xl border border-red-200 bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
