import React from "react";
import { Box, Typography, Paper, Chip, Stack, Grid } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ListAltIcon from "@mui/icons-material/ListAlt";

const statusMeta = {
  todo: {
    label: "ToDo",
    color: "#f59e42",
    icon: <HourglassEmptyIcon sx={{ color: "#f59e42" }} />
  },
  inprogress: {
    label: "In Progress",
    color: "#3b82f6",
    icon: <AssignmentIcon sx={{ color: "#3b82f6" }} />
  },
  done: {
    label: "Done",
    color: "#16a34a",
    icon: <CheckCircleIcon sx={{ color: "#16a34a" }} />
  }
};

export default function ToDoListOverview() {
  let tasks = { todo: [], inprogress: [], done: [] };
  try {
    const saved = localStorage.getItem("todo_tasks");
    if (saved) tasks = JSON.parse(saved);
  } catch {}

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#334155" }}>
        <ListAltIcon sx={{ mr: 1, color: "#3b82f6" }} />
        Folyamatban lévő munkák
      </Typography>
      <Grid container spacing={2}>
        {["todo", "inprogress", "done"].map(status => (
          <Grid item xs={12} md={4} key={status}>
            <Paper sx={{ p: 2, minHeight: 300, background: "#f8fafc", minWidth: '328.350px' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                {statusMeta[status].icon}
                <Typography variant="h6" sx={{ color: statusMeta[status].color, fontWeight: 700 }}>
                  {statusMeta[status].label}
                </Typography>
              </Stack>
              <Stack spacing={2}>
                {tasks[status].length === 0 ? (
                  <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>Nincs feladat.</Typography>
                ) : (
                  tasks[status].map((task, idx) => (
                    <Paper
                      key={task.id || idx}
                      sx={{
                        p: 1.5,
                        background: "#fff",
                        borderLeft: `6px solid ${statusMeta[status].color}`,
                        boxShadow: "0 2px 8px rgba(59,130,246,0.07)"
                      }}
                    >
                      <Typography fontWeight={600}>{task.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{task.subject}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="#64748b" sx={{ display: "block", mt: 0.5 }}>
                          {task.description}
                        </Typography>
                      )}
                      <Chip
                        label={statusMeta[status].label}
                        sx={{
                          background: statusMeta[status].color,
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          mt: 1
                        }}
                        size="small"
                      />
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}