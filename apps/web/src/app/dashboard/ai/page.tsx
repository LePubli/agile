'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import AITasksPage from '../../ai-tasks/page'

export default function DashboardAI() {
  return (
    <DashboardLayout>
      <AITasksPage />
    </DashboardLayout>
  )
}
