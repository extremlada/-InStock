import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack } from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import hu from "date-fns/locale/hu";

const locales = { hu };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => 1,
  getDay,
  locales,
});

export default function CalendarWidget() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("calendar_events");
    return saved ? JSON.parse(saved) : [];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
  });

  // Esemény hozzáadása
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;
    const event = {
      ...newEvent,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
    };
    const updated = [...events, event];
    setEvents(updated);
    localStorage.setItem("calendar_events", JSON.stringify(updated));
    setDialogOpen(false);
    setNewEvent({ title: "", start: "", end: "" });
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <h2 style={{ margin: 0 }}>Naptár</h2>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Új esemény
        </Button>
      </Stack>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, background: "#fff", borderRadius: 12, padding: 8 }}
        messages={{
          next: "Következő",
          previous: "Előző",
          today: "Ma",
          month: "Hónap",
          week: "Hét",
          day: "Nap",
          agenda: "Agenda",
          date: "Dátum",
          time: "Idő",
          event: "Esemény",
          noEventsInRange: "Nincs esemény",
        }}
        eventPropGetter={event => ({
          style: {
            backgroundColor: "#3b82f6",
            color: "#fff",
            borderRadius: 6,
            border: "none",
            fontWeight: 600,
            fontSize: 15,
          }
        })}
      />

      {/* Új esemény dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Új esemény hozzáadása</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Esemény címe"
              value={newEvent.title}
              onChange={e => setNewEvent(ev => ({ ...ev, title: e.target.value }))}
              required
            />
            <TextField
              label="Kezdés"
              type="datetime-local"
              value={newEvent.start}
              onChange={e => setNewEvent(ev => ({ ...ev, start: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Befejezés"
              type="datetime-local"
              value={newEvent.end}
              onChange={e => setNewEvent(ev => ({ ...ev, end: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Mégse</Button>
          <Button variant="contained" onClick={handleAddEvent}>Hozzáadás</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}