export const BAKE_STEPS = [
  {
    id: 'received',
    label: 'Preorder received',
    detail: 'We have your loaf on the bake list.',
  },
  {
    id: 'mixing',
    label: 'Mixing',
    detail: 'Dough is mixed and fermenting.',
  },
  {
    id: 'in_the_oven',
    label: 'In the oven',
    detail: 'Your loaf is baking.',
  },
  {
    id: 'resting',
    label: 'Resting',
    detail: 'Fresh out of the oven — cooling before pickup.',
  },
  {
    id: 'awaiting_pickup',
    label: 'Awaiting pickup',
    detail: 'Ready for you. Come grab it.',
  },
  {
    id: 'picked_up',
    label: 'Picked up',
    detail: 'Enjoy your loaf.',
  },
] as const

export type BakeStatus = (typeof BAKE_STEPS)[number]['id']

export type TimelineStep = {
  id: BakeStatus
  label: string
  detail: string
  state: 'complete' | 'current' | 'upcoming'
  at: string | null
}

export function isBakeStatus(value: string): value is BakeStatus {
  return BAKE_STEPS.some((step) => step.id === value)
}

export function nextBakeStatus(current: BakeStatus): BakeStatus | null {
  const index = BAKE_STEPS.findIndex((step) => step.id === current)
  if (index < 0 || index >= BAKE_STEPS.length - 1) return null
  return BAKE_STEPS[index + 1].id
}

export function buildBakeTimeline(
  status: BakeStatus,
  history: Partial<Record<BakeStatus, string>> = {},
): TimelineStep[] {
  const currentIndex = BAKE_STEPS.findIndex((step) => step.id === status)

  return BAKE_STEPS.map((step, index) => {
    const state =
      index < currentIndex
        ? 'complete'
        : index === currentIndex
          ? 'current'
          : 'upcoming'

    return {
      id: step.id,
      label: step.label,
      detail: step.detail,
      state,
      at: history[step.id] || null,
    }
  })
}

export function formatBakeTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
