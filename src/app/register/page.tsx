import { RegisterForm } from '@/components/RegisterForm'

export const metadata = {
  title: 'ISE Lab OPAC — 蔵書登録',
}

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-xl font-bold">蔵書登録</h1>
      <RegisterForm />
    </main>
  )
}
