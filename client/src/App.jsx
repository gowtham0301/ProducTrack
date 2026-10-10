
import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./services/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Load tasks from MongoDB through the API
  async function loadTasks() {
    try {
      setLoading(true);

      const data = await getTasks();
      setTasks(data);

      setError("");
    } catch (err) {
      setError(err.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Dashboard statistics
  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Create a task
  async function addTask(event) {
    event.preventDefault();

    const title = newTask.trim();

    setError("");
    setNotice("");

    if (!title) {
      setError("Please enter a task title.");
      return;
    }

    if (title.length > 120) {
      setError("Task title cannot exceed 120 characters.");
      return;
    }

    if (saving || loading) return;

    try {
      setSaving(true);

      const response = await createTask(title);
      const createdTask = response.task ?? response;

      if (!createdTask?.id) {
        throw new Error(
          "The server returned an invalid task response."
        );
      }

      setTasks((current) => [...current, createdTask]);
      setNewTask("");
      setNotice("Task created successfully.");
    } catch (err) {
      setError(err.message || "Failed to add task.");
    } finally {
      setSaving(false);
    }
  }

  // Update a task's status
  async function handleStatusChange(id, status) {
    if (busyTaskId !== null || saving) return;

    setError("");
    setNotice("");

    try {
      setBusyTaskId(id);

      const response = await updateTask(id, { status });
      const updatedTask = response.task ?? response;

      setTasks((current) =>
        current.map((task) =>
          task.id === id ? updatedTask : task
        )
      );

      setNotice("Task status updated successfully.");
    } catch (err) {
      // Refresh tasks in case the server updated the data
      // but the response was lost.
      try {
        await loadTasks();
      } catch {
        // The original update error is shown below.
      }

      setError(
        err.message || "Failed to update task status."
      );
    } finally {
      setBusyTaskId(null);
    }
  }

  // Delete a task
  async function handleDelete(id) {
    if (busyTaskId !== null || saving) return;

    setError("");
    setNotice("");

    try {
      setBusyTaskId(id);

      await deleteTask(id);

      setTasks((current) =>
        current.filter((task) => task.id !== id)
      );

      if (editingTaskId === id) {
        cancelEditing();
      }

      setNotice("Task deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    } finally {
      setBusyTaskId(null);
    }
  }

  // Start editing a task
  const startEditing = (task) => {
    setError("");
    setNotice("");
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  // Save an edited task title
  async function saveTaskTitle(id) {
    const trimmedTitle = editingTitle.trim();

    setError("");
    setNotice("");

    if (!trimmedTitle) {
      setError("Task title cannot be empty.");
      return;
    }

    if (trimmedTitle.length > 120) {
      setError("Task title cannot exceed 120 characters.");
      return;
    }

    if (busyTaskId !== null || saving) return;

    try {
      setBusyTaskId(id);

      const response = await updateTask(id, {
        title: trimmedTitle,
      });

      const updatedTask = response.task ?? response;

      setTasks((current) =>
        current.map((task) =>
          task.id === id ? updatedTask : task
        )
      );

      cancelEditing();
      setNotice("Task title updated successfully.");
    } catch (err) {
      setError(
        err.message || "Failed to update task title."
      );
    } finally {
      setBusyTaskId(null);
    }
  }

  // Clear search and status filters
  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("All");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h3 className="brand">
          DevTrack<span>.</span>
        </h3>

        <p className="menu-label">WORKSPACE</p>

        <div className="nav-item active">
          ▦ &nbsp; Dashboard
        </div>

        <div className="nav-item">
          ▤ &nbsp; My Projects
        </div>

        <div className="nav-item">
          ✓ &nbsp; My Tasks
        </div>

        <div className="sidebar-footer">
          <div className="avatar">G</div>

          <div>
            <strong>Developer</strong>
            <small>Personal workspace</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Workspace / Dashboard</span>

          <span className="today-badge">
            ● Your productivity space
          </span>
        </header>

        <section className="welcome">
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Welcome back, Developer 👋</h1>
          <p>Make progress today, one task at a time.</p>
        </section>

        {/* Dashboard statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <span>Total tasks</span>
            <h2>{tasks.length}</h2>
            <small>Across all statuses</small>
          </div>

          <div className="stat-card">
            <span>Completed</span>
            <h2>{completed}</h2>
            <small>
              {tasks.length === 0
                ? "No tasks yet"
                : `${Math.round(
                    (completed / tasks.length) * 100
                  )}% of all tasks`}
            </small>
          </div>

          <div className="stat-card">
            <span>In progress</span>
            <h2>{inProgress}</h2>
            <small>Currently being worked on</small>
          </div>
        </section>

        {/* Main task section */}
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h3>My Tasks</h3>
              <p>Manage your daily development work.</p>
            </div>

            <span className="task-count">
              {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>

          {/* Create task form */}
          <form className="task-form" onSubmit={addTask}>
            <input
              className="form-control"
              value={newTask}
              onChange={(event) =>
                setNewTask(event.target.value)
              }
              placeholder="What do you need to work on?"
              aria-label="New task title"
              maxLength={120}
              disabled={loading || saving}
            />

            <button
              className="btn btn-primary"
              type="submit"
              disabled={
                loading || saving || !newTask.trim()
              }
            >
              {saving ? "Adding..." : "+ Add task"}
            </button>
          </form>

          {/* Success notification */}
          {notice && (
            <div
              className="alert alert-success notification"
              role="status"
            >
              <span>{notice}</span>

              <button
                type="button"
                className="notification-close"
                aria-label="Dismiss success message"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}

          {/* Error notification */}
          {error && (
            <div
              className="alert alert-danger notification"
              role="alert"
            >
              <span>{error}</span>

              <button
                type="button"
                className="notification-close"
                aria-label="Dismiss error message"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}

          {/* Search and status filters */}
          <div className="task-filters">
            <div className="search-box">
              <input
                type="search"
                className="form-control"
                placeholder="Search tasks..."
                aria-label="Search tasks by title"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="filter-box">
              <select
                className="form-select"
                aria-label="Filter tasks by status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary reset-filters"
              onClick={resetFilters}
              disabled={
                !searchTerm && statusFilter === "All"
              }
            >
              Reset
            </button>
          </div>

          {/* Task list */}
          <div className="task-list">
            {loading && (
              <p className="empty-state" role="status">
                Loading tasks...
              </p>
            )}

            {!loading &&
              filteredTasks.map((task) => (
                <div className="task-row" key={task.id}>
                  <div className="task-details">
                    {/* Edit mode */}
                    {editingTaskId === task.id ? (
                      <div className="edit-task-form">
                        <input
                          className="form-control"
                          type="text"
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(
                              event.target.value
                            )
                          }
                          maxLength={120}
                          aria-label="Edit task title"
                          autoFocus
                          disabled={busyTaskId !== null}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              saveTaskTitle(task.id);
                            }

                            if (event.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                        />

                        <div className="edit-actions">
                          <button
                            className="btn btn-sm btn-success"
                            type="button"
                            onClick={() =>
                              saveTaskTitle(task.id)
                            }
                            disabled={
                              busyTaskId !== null ||
                              saving
                            }
                          >
                            {busyTaskId === task.id
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            onClick={cancelEditing}
                            disabled={
                              busyTaskId !== null
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal task display */
                      <div className="task-title">
                        <strong>{task.title}</strong>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          type="button"
                          onClick={() =>
                            startEditing(task)
                          }
                          disabled={
                            busyTaskId !== null || saving
                          }
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {/* Task status */}
                    <select
                      className="form-select status-select"
                      aria-label={`Status for ${task.title}`}
                      value={task.status}
                      onChange={(event) =>
                        handleStatusChange(
                          task.id,
                          event.target.value
                        )
                      }
                      disabled={
                        busyTaskId !== null ||
                        saving ||
                        editingTaskId === task.id
                      }
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>

                  {/* Delete task */}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    disabled={
                      busyTaskId !== null || saving
                    }
                  >
                    {busyTaskId === task.id
                      ? "Processing..."
                      : "Delete"}
                  </button>
                </div>
              ))}

            {/* Empty workspace */}
            {!loading &&
              !error &&
              tasks.length === 0 && (
                <p className="empty-state">
                  No tasks yet. Add your first task above!
                </p>
              )}

            {/* No search/filter matches */}
            {!loading &&
              !error &&
              tasks.length > 0 &&
              filteredTasks.length === 0 && (
                <p className="empty-state">
                  No tasks match your search or selected
                  filter.
                </p>
              )}
          </div>
        </section>

        <p className="footer-note">
          DevTrack · Stay consistent. Keep building.
        </p>
      </main>
    </div>
  );
}

export default App;
