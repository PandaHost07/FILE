import type { AppState } from '@/types'

/** Snapshot aman untuk server: tanpa apiKeys, scene tanpa imageData (sama seperti partialize Zustand). */
export function buildCloudWorkspacePayload(
    state: Pick<
        AppState,
        'projects' | 'templates' | 'activeProjectId' | 'activeSceneId' | 'apiUsage'
    >
): Record<string, unknown> {
    const projects = state.projects.map((p) => ({
        ...p,
        scenes: Object.fromEntries(
            Object.entries(p.scenes).map(([id, scene]) => [
                id,
                { ...scene, imageData: null as string | null },
            ])
        ),
    }))

    return {
        version: 1,
        projects,
        templates: state.templates,
        activeProjectId: state.activeProjectId,
        activeSceneId: state.activeSceneId,
        apiUsage: state.apiUsage ?? {},
    }
}
