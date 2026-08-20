import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import styles from './GameDistributionCard.module.css'

export type DistributionSegment = {
  label: string
  value: number
  color: string
}

type GameDistributionCardProps = {
  title: string
  segments: [DistributionSegment, DistributionSegment]
  emptyMessage: string
}

export function GameDistributionCard({
  title,
  segments,
  emptyMessage,
}: GameDistributionCardProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const primaryPercentage =
    total === 0 ? 0 : Math.round((segments[0].value / total) * 100)
  const chartData =
    total === 0
      ? [{ label: 'Sin datos', value: 1, color: 'var(--color-line)' }]
      : segments

  return (
    <section className={styles.card} aria-labelledby={`${slug(title)}-title`}>
      <h2 id={`${slug(title)}-title`}>{title}</h2>

      <figure
        className={styles.figure}
        aria-label={`${title}: ${segments
          .map((segment) => `${segment.label}, ${segment.value}`)
          .join('; ')}`}
      >
        <div className={styles.chart} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="94%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((segment) => (
                  <Cell fill={segment.color} key={segment.label} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <strong>{total === 0 ? '—' : `${primaryPercentage}%`}</strong>
        </div>

        <figcaption>
          {total === 0 && <p className={styles.empty}>{emptyMessage}</p>}
          <ul>
            {segments.map((segment) => (
              <li key={segment.label}>
                <span
                  className={styles.marker}
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span>{segment.label}</span>
                <strong>{segment.value}</strong>
              </li>
            ))}
          </ul>
        </figcaption>
      </figure>
    </section>
  )
}

function slug(value: string) {
  return value.toLocaleLowerCase('es').replaceAll(' ', '-')
}
