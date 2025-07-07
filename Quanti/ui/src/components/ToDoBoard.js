import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Box, Paper, Typography, Button, TextField, Stack, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Sidebar from "./sidebar"

const initialData = {
  todo: [],
  inprogress: [],
  done: []
};

const statuses = [
  { key: "todo", label: "ToDo" },
  { key: "inprogress", label: "In Progress" },
  { key: "done", label: "Done" }
];

function getCurrentUser() {
  // Itt igazítsd a saját login logikádhoz!
  return localStorage.getItem("username") || localStorage.getItem("email") || "ismeretlen";
}

function ToDoBoard() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("todo_tasks");
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Új feladat űrlap állapot
  const [newTaskData, setNewTaskData] = useState({
    name: "",
    subject: "",
    assignee: "",
    assigner: getCurrentUser(),
    description: ""
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Drag & drop handler
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceList = Array.from(tasks[source.droppableId]);
    const [removed] = sourceList.splice(source.index, 1);
    const destList = Array.from(tasks[destination.droppableId]);
    destList.splice(destination.index, 0, removed);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList
    });
  };

  // Feladat törlése
  const handleDeleteTask = (statusKey, idx) => {
    setTasks(prev => {
      const newList = Array.from(prev[statusKey]);
      newList.splice(idx, 1);
      return { ...prev, [statusKey]: newList };
    });
  };

  // Feladat részletek megnyitása
  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // Új feladat hozzáadása
  const handleAddTask = () => {
    if (!newTaskData.name.trim()) return;
    setTasks(prev => ({
      ...prev,
      todo: [
        ...prev.todo,
        {
          id: Date.now().toString(),
          ...newTaskData
        }
      ]
    }));
    setNewTaskData({
      name: "",
      subject: "",
      assignee: "",
      assigner: getCurrentUser(),
      description: ""
    });
    setAddDialogOpen(false);
  };

  // Munkalapból generálás (példa)
  const handleCreateFromSheet = () => {
    setTasks(prev => ({
      ...prev,
      todo: [
        ...prev.todo,
        {
          id: Date.now().toString(),
          name: "Új feladat munkalapból",
          subject: "Munkalap tárgy",
          assignee: "",
          assigner: getCurrentUser(),
          description: "Ez egy automatikusan generált feladat munkalapból."
        }
      ]
    }));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      <Sidebar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>ToDo Board</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => setAddDialogOpen(true)}>Új feladat</Button>
          <Button variant="outlined" onClick={handleCreateFromSheet}>Munkalapból</Button>
        </Stack>
        <DragDropContext onDragEnd={onDragEnd}>
          <Stack direction="row" spacing={2}>
            {statuses.map(status => (
              <Droppable droppableId={status.key} key={status.key}>
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minWidth: 270,
                      minHeight: 400,
                      p: 2,
                      background: snapshot.isDraggingOver ? "#e0e7ef" : "#f8fafc"
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>{status.label}</Typography>
                    {tasks[status.key].map((task, idx) => (
                      <Draggable draggableId={task.id} index={idx} key={task.id}>
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              p: 1,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              background: "#fff",
                              boxShadow: 1,
                              cursor: "grab",
                              userSelect: "none"
                            }}
                            onClick={() => handleOpenTask(task)}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography fontWeight={600}>{task.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {task.subject}
                              </Typography>
                            </Box>
                            <IconButton size="small" onClick={e => { e.stopPropagation(); handleOpenTask(task); }}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={e => { e.stopPropagation(); handleDeleteTask(status.key, idx); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </Stack>
        </DragDropContext>

        {/* Új feladat dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
          <DialogTitle>Új feladat hozzáadása</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Feladat neve"
                value={newTaskData.name}
                onChange={e => setNewTaskData(d => ({ ...d, name: e.target.value }))}
                required
              />
              <TextField
                label="Tárgy"
                value={newTaskData.subject}
                onChange={e => setNewTaskData(d => ({ ...d, subject: e.target.value }))}
              />
              <TextField
                label="Assignee"
                value={newTaskData.assignee}
                onChange={e => setNewTaskData(d => ({ ...d, assignee: e.target.value }))}
              />
              <TextField
                label="Assigner"
                value={newTaskData.assigner}
                disabled
              />
              <TextField
                label="Leírás"
                value={newTaskData.description}
                onChange={e => setNewTaskData(d => ({ ...d, description: e.target.value }))}
                multiline
                minRows={2}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Mégse</Button>
            <Button variant="contained" onClick={handleAddTask}>Hozzáadás</Button>
          </DialogActions>
        </Dialog>

        {/* Feladat részletei modal */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
          <DialogTitle>Feladat részletei</DialogTitle>
          <DialogContent>
            {selectedTask && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography><b>Név:</b> {selectedTask.name}</Typography>
                <Typography><b>Tárgy:</b> {selectedTask.subject}</Typography>
                <Typography><b>Assignee:</b> {selectedTask.assignee}</Typography>
                <Typography><b>Assigner:</b> {selectedTask.assigner}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography><b>Leírás:</b></Typography>
                <Typography sx={{ whiteSpace: "pre-line" }}>{selectedTask.description}</Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Bezárás</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default ToDoBoard;