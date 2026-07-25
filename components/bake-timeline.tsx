import { formatBakeTime, type TimelineStep } from '@/lib/bake-status'

export function BakeTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="bake-timeline">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li key={step.id} className={`bake-step bake-step-${step.state}`}>
            <div className="bake-rail">
              <span className="bake-dot" aria-hidden="true" />
              {!isLast ? <span className="bake-line" aria-hidden="true" /> : null}
            </div>
            <div className="bake-copy">
              <p className="bake-label">
                {step.label}
                {step.state === 'current' ? <span> Current</span> : null}
              </p>
              <p className="bake-detail">{step.detail}</p>
              {step.at ? (
                <p className="bake-time">{formatBakeTime(step.at)}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
