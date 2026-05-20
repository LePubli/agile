'use client'

import { DashboardLayout } from '@/components/dashboard-layout'

export default function DashboardFiles() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Manage your files and media assets
          </p>
        </div>
        
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto w-max">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m0-3v12" />
            </svg>
            <h3 className="mt-2 text-sm font-medium">No files uploaded</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by uploading a file or dragging and dropping.
            </p>
            <div className="mt-6">
              <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                Upload File
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
