import { useEffect, useRef } from 'react'

function useWakeLock(time: number) {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null)
    const timeoutIdRef = useRef(0)

    useEffect(() => {
        const releaseWakeLock = () => {
            clearTimeout(timeoutIdRef.current)

            if (wakeLockRef.current === null) {
                return
            }

            wakeLockRef.current.release()
                .catch(console.warn)
        }

        navigator.wakeLock?.request('screen')
            .then(currentWakeLock => {
                clearTimeout(timeoutIdRef.current)

                wakeLockRef.current = currentWakeLock

                timeoutIdRef.current = setTimeout(releaseWakeLock, time)
            })
            .catch(console.warn) // the wake lock request usually fails system related, e.g. when low on battery

        return releaseWakeLock
    }, [ time ])
}

export default useWakeLock