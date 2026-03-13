"use client";

import { FormEvent, useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch {
      setError("Failed to load tasks");
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create task");
      }
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete task");
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleInlineUpdate(task: Task, values: Partial<Pick<Task, "title" | "description">>) {
    const updated = { ...task, ...values };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  }

  async function handleSave(task: Task) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          title: task.title,
          description: task.description,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update task");
      }
      const saved = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-slate-100 px-4 py-10 font-sans text-zinc-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl bg-white/80 p-8 shadow-xl shadow-slate-200 backdrop-blur">
        <header className="flex flex-col gap-2 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Task Manager
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Simple CRUD app with Next.js and PostgreSQL.
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
          </span>
        </header>

        <section className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Title
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="e.g. Finish Next.js CRUD demo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Description
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="Optional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:mt-0"
            >
              {loading ? "Saving..." : "Add Task"}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Tasks
          </h2>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-10 text-sm text-zinc-500">
              No tasks yet. Create your first one above.
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                >
                  <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500/80 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                  <div className="flex-1 space-y-2">
                    <input
                      className="w-full rounded-md border border-transparent bg-transparent px-1 text-sm font-medium text-zinc-900 outline-none transition focus:border-zinc-300 focus:bg-white"
                      value={task.title}
                      onChange={(e) =>
                        handleInlineUpdate(task, { title: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full resize-none rounded-md border border-transparent bg-transparent px-1 text-sm text-zinc-600 outline-none transition focus:border-zinc-300 focus:bg-white"
                      rows={2}
                      value={task.description ?? ""}
                      placeholder="Add a description..."
                      onChange={(e) =>
                        handleInlineUpdate(task, { description: e.target.value })
                      }
                    />
                    <p className="pt-1 text-xs text-zinc-400">
                      Created{" "}
                      {new Date(task.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(task)}
                      className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
