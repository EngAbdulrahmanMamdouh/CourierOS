import FinanceQueryProvider from '@/components/finance/FinanceQueryProvider'

export const metadata = {
  title: 'Finance Dashboard',
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <FinanceQueryProvider>{children}</FinanceQueryProvider>
}
