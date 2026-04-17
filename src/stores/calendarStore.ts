import { defineStore } from 'pinia'
import type { EventInput } from '@fullcalendar/core'

// ✅ Safe loader (handles corrupted JSON)
function loadEvents(): EventInput[] {
  try {
    return JSON.parse(localStorage.getItem('events') || '[]')
  } catch {
    return []
  }
}

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: loadEvents()
  }),

  actions: {
    setEvents(events: EventInput[]) {
      this.events = events
      localStorage.setItem('events', JSON.stringify(events))
    },

    addEvents(newEvents: EventInput[]) {
      this.events = [...this.events, ...newEvents]
      localStorage.setItem('events', JSON.stringify(this.events))
    },

    clearEvents() {
      this.events = []
      localStorage.removeItem('events')
    }
  }
})
