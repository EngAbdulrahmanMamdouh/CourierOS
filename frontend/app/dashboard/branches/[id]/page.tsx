import BranchDetailPageClient from '@/components/branches/BranchDetailPageClient'
import BranchQueryProvider from '@/components/branches/BranchQueryProvider'

export default function BranchDetailPage({ params }: any) {
  return (
    <BranchQueryProvider>
      <BranchDetailPageClient branchId={Number(params.id)} />
    </BranchQueryProvider>
  )
}
