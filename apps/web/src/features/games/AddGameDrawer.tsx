import { RiCloseLargeLine } from '@remixicon/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useEffect,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'

import { SidePanel } from '../../shared/ui/SidePanel/SidePanel'
import { addLibraryGame } from './api'
import styles from './AddGameDrawer.module.css'
import { PlatformLogo } from './PlatformLogo'
import { gameLibraryQueryKey } from './queries'
import type {
  GameSearchResult,
  MediaFormat,
  PlayStatus,
} from './types'

type AddGameDrawerProps = {
  game: GameSearchResult | null
  isOpen: boolean
  onClose: () => void
  returnFocusRef: RefObject<HTMLElement | null>
}

const mediaFormats: Array<{
  value: Exclude<MediaFormat, 'unknown'>
  label: string
}> = [
  { value: 'physical', label: 'Físico' },
  { value: 'digital', label: 'Digital' },
]

const playStatuses: Array<{ value: PlayStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'playing', label: 'Jugando' },
  { value: 'played', label: 'Jugado' },
  { value: 'completed', label: 'Completado' },
]

export function AddGameDrawer({
  game,
  isOpen,
  onClose,
  returnFocusRef,
}: AddGameDrawerProps) {
  const queryClient = useQueryClient()
  const [platformId, setPlatformId] = useState('')
  const [owned, setOwned] = useState(false)
  const [mediaFormat, setMediaFormat] =
    useState<Exclude<MediaFormat, 'unknown'>>('physical')
  const [playStatus, setPlayStatus] = useState<PlayStatus>('pending')
  const addMutation = useMutation({
    mutationFn: addLibraryGame,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: gameLibraryQueryKey })
      onClose()
    },
  })

  useEffect(() => {
    if (!isOpen) return
    setPlatformId('')
    setOwned(false)
    setMediaFormat('physical')
    setPlayStatus('pending')
    addMutation.reset()
  }, [game?.igdb_id, isOpen])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!game || !platformId) return

    addMutation.mutate({
      igdb_game_id: game.igdb_id,
      igdb_platform_id: Number(platformId),
      media_format: mediaFormat,
      owned,
      play_status: playStatus,
    })
  }

  return (
    <SidePanel
      isOpen={isOpen && game !== null}
      label={game ? `Configurar ${game.title}` : 'Configurar videojuego'}
      onClose={onClose}
      returnFocusRef={returnFocusRef}
    >
      {game && (
        <>
          <header className={styles.header}>
            <div>
              <p>Añadir a la biblioteca</p>
              <h2>{game.title}</h2>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Cerrar configuración"
              autoFocus
              onClick={onClose}
            >
              <RiCloseLargeLine aria-hidden="true" />
            </button>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <fieldset>
              <legend>Plataforma</legend>
              <div className={styles.platformChoices}>
                {game.platforms.map((platform) => (
                  <label className={styles.platformChoice} key={platform.igdb_id}>
                    <input
                      type="radio"
                      name="platform"
                      value={platform.igdb_id}
                      checked={platformId === platform.igdb_id.toString()}
                      onChange={(event) => setPlatformId(event.target.value)}
                    />
                    <span className={styles.platformControl}>
                      <PlatformLogo platform={platform} />
                      <span>{platform.abbreviation ?? platform.name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Propiedad</legend>
              <div className={styles.choiceGrid}>
                <Choice
                  name="owned"
                  value="yes"
                  label="Lo tengo"
                  checked={owned}
                  onChange={() => setOwned(true)}
                />
                <Choice
                  name="owned"
                  value="no"
                  label="No lo tengo"
                  checked={!owned}
                  onChange={() => setOwned(false)}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>Formato</legend>
              <div className={styles.choiceGrid}>
                {mediaFormats.map((format) => (
                  <Choice
                    name="media-format"
                    value={format.value}
                    label={format.label}
                    checked={mediaFormat === format.value}
                    onChange={() => setMediaFormat(format.value)}
                    key={format.value}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Estado</legend>
              <div className={styles.statusGrid}>
                {playStatuses.map((status) => (
                  <Choice
                    name="play-status"
                    value={status.value}
                    label={status.label}
                    checked={playStatus === status.value}
                    onChange={() => setPlayStatus(status.value)}
                    key={status.value}
                  />
                ))}
              </div>
            </fieldset>

            {addMutation.isError && (
              <p className={styles.error} role="alert">
                {addMutation.error.message}
              </p>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!platformId || addMutation.isPending}
            >
              {addMutation.isPending ? 'Añadiendo…' : 'Añadir a la biblioteca'}
            </button>
          </form>
        </>
      )}
    </SidePanel>
  )
}

type ChoiceProps = {
  name: string
  value: string
  label: string
  checked: boolean
  onChange: () => void
}

function Choice({ name, value, label, checked, onChange }: ChoiceProps) {
  return (
    <label className={styles.choice}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  )
}