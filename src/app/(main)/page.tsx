import { redirect } from 'next/navigation'

/** Sesi dicek di `(main)/layout`. */
export default function Home() {
    redirect('/dashboard')
}
