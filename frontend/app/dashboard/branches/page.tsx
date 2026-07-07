import BranchQueryProvider from '@/components/branches/BranchQueryProvider'
import BranchPageClient from '@/components/branches/BranchPageClient'

export default function BranchesPage() {
  return (
    <BranchQueryProvider>
      <BranchPageClient />
    </BranchQueryProvider>
  )
}
