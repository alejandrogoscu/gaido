import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiCloseLargeLine,
  RiFilter3Line,
} from '@remixicon/react'
import { useRef, useState, type KeyboardEvent } from 'react'

import { trapFocus } from '../../shared/ui/focusTrap'
import styles from './GameLibraryFilters.module.css'
import type { PlayStatus } from './types'

const playStatusLabels: Record<PlayStatus, string> = {
  pending: 'Pendiente',
  playing: 'Jugando',
  played: 'Jugado',
  completed: 'Completado',
}

const ownershipLabels = {
  owned: 'Lo tengo',
  'not-owned': 'No lo tengo',
} as const

export type OwnedFilter = 'all' | keyof typeof ownershipLabels

export type GameLibraryFilterValues = {
  platformId: string
  playStatus: 'all' | PlayStatus
  owned: OwnedFilter
}

export type GameLibraryPlatformOption = {
  igdbId: number
  name: string
}

export const emptyGameLibraryFilters: GameLibraryFilterValues = {
  platformId: 'all',
  playStatus: 'all',
  owned: 'all',
}

type FilterName = 'platform' | 'status' | 'ownership'
type OpenPanel = 'all' | FilterName | null

type GameLibraryFiltersProps = {
  values: GameLibraryFilterValues
  platforms: GameLibraryPlatformOption[]
  onChange: (values: GameLibraryFilterValues) => void
}

export function GameLibraryFilters({
  values,
  platforms,
  onChange,
}: GameLibraryFiltersProps) {
  const [draft, setDraft] = useState(values)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const [openedFromGlobal, setOpenedFromGlobal] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  function openAllFilters(trigger: HTMLButtonElement) {
    triggerRef.current = trigger
    setDraft(values)
    setOpenedFromGlobal(false)
    setOpenPanel('all')
  }

  function openDirectFilter(filter: FilterName, trigger: HTMLButtonElement) {
    triggerRef.current = trigger
    setDraft(values)
    setOpenedFromGlobal(false)
    setOpenPanel(filter)
  }

  function openFilterFromGlobal(filter: FilterName) {
    setOpenedFromGlobal(true)
    setOpenPanel(filter)
  }

  function closeAllFilters() {
    setOpenPanel(null)
    setOpenedFromGlobal(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function closeIndividualFilter() {
    if (openedFromGlobal) {
      setOpenedFromGlobal(false)
      setOpenPanel('all')
      return
    }

    closeAllFilters()
  }

  function applyFilters() {
    onChange(draft)
    closeAllFilters()
  }

  return (
    <>
      <div className={styles.controls} role="group" aria-label="Filtros">
        <button
          className={`${styles.control} ${styles.globalControl}`}
          type="button"
          aria-label="Abrir todos los filtros"
          onClick={(event) => openAllFilters(event.currentTarget)}
        >
          <RiFilter3Line aria-hidden="true" />
          Filtros
        </button>

        <FilterControl
          label="Plataforma"
          value={platformLabel(values.platformId, platforms)}
          isActive={values.platformId !== 'all'}
          onClick={openDirectFilter.bind(null, 'platform')}
        />
        <FilterControl
          label="Estado"
          value={
            values.playStatus === 'all'
              ? 'Estado'
              : playStatusLabels[values.playStatus]
          }
          isActive={values.playStatus !== 'all'}
          onClick={openDirectFilter.bind(null, 'status')}
        />
        <FilterControl
          label="Propiedad"
          value={
            values.owned === 'all'
              ? 'Propiedad'
              : ownershipLabels[values.owned]
          }
          isActive={values.owned !== 'all'}
          onClick={openDirectFilter.bind(null, 'ownership')}
        />
      </div>

      {openPanel === 'all' && (
        <GlobalFiltersPanel
          values={draft}
          platforms={platforms}
          onBack={closeAllFilters}
          onClear={() => setDraft(emptyGameLibraryFilters)}
          onOpenFilter={openFilterFromGlobal}
          onApply={applyFilters}
        />
      )}

      {openPanel && openPanel !== 'all' && (
        <IndividualFilterPanel
          filter={openPanel}
          values={draft}
          platforms={platforms}
          onChange={setDraft}
          onClose={closeIndividualFilter}
          onApply={applyFilters}
        />
      )}
    </>
  )
}

type FilterControlProps = {
  label: string
  value: string
  isActive: boolean
  onClick: (trigger: HTMLButtonElement) => void
}

function FilterControl({
  label,
  value,
  isActive,
  onClick,
}: FilterControlProps) {
  return (
    <button
      className={`${styles.control} ${styles.filterControl} ${
        isActive ? styles.activeControl : ''
      }`}
      type="button"
      aria-label={`Filtrar por ${label.toLocaleLowerCase('es')}: ${value}`}
      onClick={(event) => onClick(event.currentTarget)}
    >
      <span>{value}</span>
    </button>
  )
}

type GlobalFiltersPanelProps = {
  values: GameLibraryFilterValues
  platforms: GameLibraryPlatformOption[]
  onBack: () => void
  onClear: () => void
  onOpenFilter: (filter: FilterName) => void
  onApply: () => void
}

function GlobalFiltersPanel({
  values,
  platforms,
  onBack,
  onClear,
  onOpenFilter,
  onApply,
}: GlobalFiltersPanelProps) {
  return (
    <section
      className={styles.panel}
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de videojuegos"
      onKeyDown={(event) => handlePanelKeyDown(event, onBack)}
    >
      <header className={styles.panelHeader}>
        <button
          className={styles.navigationButton}
          type="button"
          aria-label="Volver a la biblioteca"
          autoFocus
          onClick={onBack}
        >
          <RiArrowLeftLine aria-hidden="true" />
        </button>
        <h2>Filtros</h2>
        <button
          className={styles.clearButton}
          type="button"
          onClick={onClear}
          disabled={hasNoFilters(values)}
        >
          Borrar
        </button>
      </header>

      <div className={styles.globalRows}>
        <GlobalFilterRow
          label="Plataforma"
          value={platformLabel(values.platformId, platforms, 'Todas')}
          onClick={() => onOpenFilter('platform')}
        />
        <GlobalFilterRow
          label="Estado"
          value={
            values.playStatus === 'all'
              ? 'Todos'
              : playStatusLabels[values.playStatus]
          }
          onClick={() => onOpenFilter('status')}
        />
        <GlobalFilterRow
          label="Propiedad"
          value={
            values.owned === 'all' ? 'Todos' : ownershipLabels[values.owned]
          }
          onClick={() => onOpenFilter('ownership')}
        />
      </div>

      <PanelFooter onApply={onApply} />
    </section>
  )
}

type GlobalFilterRowProps = {
  label: string
  value: string
  onClick: () => void
}

function GlobalFilterRow({ label, value, onClick }: GlobalFilterRowProps) {
  return (
    <button
      className={styles.globalRow}
      type="button"
      aria-label={`${label}: ${value}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className={styles.globalValue}>{value}</span>
      <RiArrowRightSLine aria-hidden="true" />
    </button>
  )
}

type IndividualFilterPanelProps = {
  filter: FilterName
  values: GameLibraryFilterValues
  platforms: GameLibraryPlatformOption[]
  onChange: (values: GameLibraryFilterValues) => void
  onClose: () => void
  onApply: () => void
}

function IndividualFilterPanel({
  filter,
  values,
  platforms,
  onChange,
  onClose,
  onApply,
}: IndividualFilterPanelProps) {
  const definition = filterDefinition(filter, platforms)
  const selectedValue = filterValue(filter, values)

  return (
    <section
      className={`${styles.panel} ${styles.individualPanel}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Filtrar por ${definition.title.toLocaleLowerCase('es')}`}
      onKeyDown={(event) => handlePanelKeyDown(event, onClose)}
    >
      <header className={styles.panelHeader}>
        <button
          className={styles.navigationButton}
          type="button"
          aria-label={`Cerrar filtro de ${definition.title.toLocaleLowerCase('es')}`}
          autoFocus
          onClick={onClose}
        >
          <RiCloseLargeLine aria-hidden="true" />
        </button>
        <h2>{definition.title}</h2>
      </header>

      <div
        className={styles.options}
        role="radiogroup"
        aria-label={definition.title}
      >
        {definition.options.map((option) => {
          const isSelected = option.value === selectedValue

          return (
            <button
              className={styles.option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(updateFilter(filter, option.value, values))}
              key={option.value}
            >
              <span>{option.label}</span>
              <span
                className={`${styles.indicator} ${
                  isSelected ? styles.selectedIndicator : ''
                }`}
                aria-hidden="true"
              >
                {isSelected && <RiCheckLine />}
              </span>
            </button>
          )
        })}
      </div>

      <PanelFooter onApply={onApply} />
    </section>
  )
}

function PanelFooter({ onApply }: { onApply: () => void }) {
  return (
    <footer className={styles.panelFooter}>
      <button type="button" onClick={onApply}>
        Ver resultados
      </button>
    </footer>
  )
}

function handlePanelKeyDown(
  event: KeyboardEvent<HTMLElement>,
  onEscape: () => void,
) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    onEscape()
    return
  }

  trapFocus(event, event.currentTarget)
}

function filterDefinition(
  filter: FilterName,
  platforms: GameLibraryPlatformOption[],
) {
  if (filter === 'platform') {
    return {
      title: 'Plataforma',
      options: [
        { value: 'all', label: 'Todas' },
        ...platforms.map((platform) => ({
          value: platform.igdbId.toString(),
          label: platform.name,
        })),
      ],
    }
  }

  if (filter === 'status') {
    return {
      title: 'Estado',
      options: [
        { value: 'all', label: 'Todos' },
        ...Object.entries(playStatusLabels).map(([value, label]) => ({
          value,
          label,
        })),
      ],
    }
  }

  return {
    title: 'Propiedad',
    options: [
      { value: 'all', label: 'Todos' },
      ...Object.entries(ownershipLabels).map(([value, label]) => ({
        value,
        label,
      })),
    ],
  }
}

function filterValue(filter: FilterName, values: GameLibraryFilterValues) {
  if (filter === 'platform') return values.platformId
  if (filter === 'status') return values.playStatus
  return values.owned
}

function updateFilter(
  filter: FilterName,
  value: string,
  values: GameLibraryFilterValues,
): GameLibraryFilterValues {
  if (filter === 'platform') return { ...values, platformId: value }
  if (filter === 'status') {
    return { ...values, playStatus: value as 'all' | PlayStatus }
  }
  return { ...values, owned: value as OwnedFilter }
}

function platformLabel(
  platformId: string,
  platforms: GameLibraryPlatformOption[],
  fallback = 'Plataforma',
) {
  return (
    platforms.find((platform) => platform.igdbId.toString() === platformId)
      ?.name ?? fallback
  )
}

function hasNoFilters(values: GameLibraryFilterValues) {
  return (
    values.platformId === 'all' &&
    values.playStatus === 'all' &&
    values.owned === 'all'
  )
}