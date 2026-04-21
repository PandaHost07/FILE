'use client'

import { useEffect, useRef } from 'react'
import useAppStore from '@/store/useAppStore'
import {
    loadApiKeysFromIDB,
    saveApiKeysToIDB,
    mergeApiKeysPreferCurrent,
} from '@/lib/apiKeysIDB'

/**
 * Cadangan API key ke IndexedDB (database di browser) dan pulihkan bila localStorage kosong.
 * Key tetap hanya di perangkat pengguna (bukan server).
 */
export function StorePersistence() {
    const savedJsonRef = useRef('')

    useEffect(() => {
        let cancelled = false
        let unsubZustand: (() => void) | undefined
        let unsubHydration: (() => void) | undefined

        const bootstrap = async () => {
            const idbKeys = await loadApiKeysFromIDB()
            if (cancelled) return
            const cur = useAppStore.getState().apiKeys
            if (idbKeys) {
                const merged = mergeApiKeysPreferCurrent(cur, idbKeys)
                if (JSON.stringify(merged) !== JSON.stringify(cur)) {
                    useAppStore.setState({ apiKeys: merged })
                }
            }
            if (cancelled) return
            savedJsonRef.current = JSON.stringify(useAppStore.getState().apiKeys)

            unsubZustand = useAppStore.subscribe((state) => {
                const json = JSON.stringify(state.apiKeys)
                if (json === savedJsonRef.current) return
                savedJsonRef.current = json
                void saveApiKeysToIDB(state.apiKeys)
            })
        }

        if (useAppStore.persist.hasHydrated()) {
            void bootstrap()
        } else {
            unsubHydration = useAppStore.persist.onFinishHydration(() => {
                void bootstrap()
            })
        }

        return () => {
            cancelled = true
            unsubHydration?.()
            unsubZustand?.()
        }
    }, [])

    return null
}
