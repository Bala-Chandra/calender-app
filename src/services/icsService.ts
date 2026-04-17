import type { EventInput } from '@fullcalendar/core'

export function parseICS(text: string): EventInput[] {
  const events: EventInput[] = []

  const lines = text.split(/\r?\n/)
  let event: Partial<EventInput> = {}

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line === 'BEGIN:VEVENT') {
      event = {}
    }

    if (line.startsWith('SUMMARY:')) {
      event.title = line.replace('SUMMARY:', '').trim()
    }

    if (line.startsWith('DTSTART:')) {
      const dateStr = line.replace('DTSTART:', '').trim()
      const startDate = parseICSDate(dateStr)

      if (startDate) {
        event.start = startDate
      }
    }

    if (line.startsWith('DTEND:')) {
      const dateStr = line.replace('DTEND:', '').trim()
      const endDate = parseICSDate(dateStr)

      // ✅ CRITICAL FIX: DO NOT assign null
      if (endDate) {
        event.end = endDate
      }
    }

    if (line === 'END:VEVENT') {
      // minimal validation
      if (event.title && event.start) {
        events.push({
          id: generateId(),
          title: event.title,
          start: event.start,
          ...(event.end && { end: event.end }), // ✅ no null
          allDay: isAllDay(event.start as Date)
        })
      }
    }
  }

  return events
}

/**
 * ✅ Parse ICS date formats:
 * - 20260420T050000Z
 * - 20260420T050000
 * - 20260420 (all-day)
 */
function parseICSDate(dateStr: string): Date | null {
  try {
    // Remove timezone Z if present
    const clean = dateStr.replace('Z', '')

    // All-day format (YYYYMMDD)
    if (/^\d{8}$/.test(clean)) {
      const year = clean.substring(0, 4)
      const month = clean.substring(4, 6)
      const day = clean.substring(6, 8)

      return new Date(`${year}-${month}-${day}`)
    }

    // Date-time format
    const formatted = clean
      .replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
        '$1-$2-$3T$4:$5:$6'
      )

    const date = new Date(formatted)

    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * Simple ID generator
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Detect all-day event
 */
function isAllDay(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0
  )
}
