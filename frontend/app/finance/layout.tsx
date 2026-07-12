import FinanceQueryProvider from '@/components/finance/FinanceQueryProvider'

export const metadata = {
  title: 'Finance Module',
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <FinanceQueryProvider>{children}</FinanceQueryProvider>
}
