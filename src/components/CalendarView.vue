<template>
  <div>
    <!-- File Upload -->
    <q-file
      v-model="file"
      label="Import ICS"
      accept=".ics"
      outlined
      class="q-mb-md"
      @update:model-value="handleFile"
    />

    <!-- Calendar -->
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import type {
  EventClickArg,
  EventInput,
  CalendarOptions
} from '@fullcalendar/core'

import { parseICS } from 'src/services/icsService'
import { useCalendarStore } from 'src/stores/calendarStore'

const store = useCalendarStore()

// ✅ REQUIRED for QFile (fixes your error permanently)
const file = ref<File | null>(null)

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],

  initialView: 'dayGridMonth',

  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },

  events: store.events,

  editable: true,
  selectable: true,

  eventClick(info: EventClickArg) {
    alert(`Event: ${info.event.title}`)
  }
}))

async function handleFile(selectedFile: File | null) {
  if (!selectedFile) return

  try {
    const text = await selectedFile.text()

    // ✅ MUST return EventInput[]
    const parsedEvents: EventInput[] = parseICS(text)

    store.addEvents(parsedEvents)

    // optional: reset file input
    file.value = null
  } catch (err) {
    console.error('Failed to parse ICS file:', err)
  }
}
</script>
