import { Process, Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'

export interface EnrichmentJobData {
  entityId: string
  entityType: 'company' | 'person' | 'lead' | 'contact'
  sources?: ('clearbit' | 'hunter' | 'linkedin' | 'crunchbase' | 'custom')[]
  fields?: string[]
  tenantId?: string
  userId?: string
  webhookUrl?: string
}

export interface EnrichmentResult {
  success: boolean
  data?: any
  sourcesUsed: string[]
  fieldsEnriched: string[]
  confidence?: number
  error?: string
  completedAt: string
}

@Processor('enrichment')
export class EnrichmentProcessor {
  private readonly logger = new Logger(EnrichmentProcessor.name)

  @Process()
  async enrichData(job: Job<EnrichmentJobData>): Promise<EnrichmentResult> {
    const { entityId, entityType, sources = ['clearbit'], fields, tenantId, userId } = job.data

    this.logger.log(`Enriching ${entityType} ${entityId} using sources: ${sources.join(', ')}`)

    try {
      const enrichedData: any = {}
      const sourcesUsed: string[] = []
      const fieldsEnriched: string[] = []

      for (const source of sources) {
        try {
          this.logger.debug(`Fetching data from ${source}`)
          
          const sourceData = await this.fetchFromSource(source, entityType, entityId)
          
          if (sourceData) {
            Object.assign(enrichedData, sourceData.data)
            sourcesUsed.push(source)
            fieldsEnriched.push(...Object.keys(sourceData.data))
          }
        } catch (sourceError) {
          this.logger.warn(`Failed to fetch from ${source}: ${sourceError.message}`)
          // Continue with other sources
        }
      }

      if (sourcesUsed.length === 0) {
        throw new Error('No sources returned data')
      }

      this.logger.debug({
        event: 'enrichment_completed',
        entityId,
        entityType,
        tenantId,
        userId,
        sourcesUsed,
        fieldsEnriched: fieldsEnriched.length,
        timestamp: new Date().toISOString(),
      })

      return {
        success: true,
        data: enrichedData,
        sourcesUsed,
        fieldsEnriched: [...new Set(fieldsEnriched)],
        confidence: this.calculateConfidence(sourcesUsed, enrichedData),
        completedAt: new Date().toISOString(),
      }
    } catch (error) {
      this.logger.error(`Enrichment failed for ${entityId}: ${error.message}`)
      
      return {
        success: false,
        sourcesUsed: [],
        fieldsEnriched: [],
        error: error.message,
        completedAt: new Date().toISOString(),
      }
    }
  }

  private async fetchFromSource(
    source: string,
    entityType: string,
    entityId: string
  ): Promise<{ data: any } | null> {
    // TODO: Integrate with actual enrichment APIs
    
    switch (source) {
      case 'clearbit':
        return this.fetchFromClearbit(entityType, entityId)
      case 'hunter':
        return this.fetchFromHunter(entityType, entityId)
      case 'linkedin':
        return this.fetchFromLinkedin(entityType, entityId)
      case 'crunchbase':
        return this.fetchFromCrunchbase(entityType, entityId)
      case 'custom':
        return this.fetchFromCustom(entityType, entityId)
      default:
        return null
    }
  }

  private async fetchFromClearbit(entityType: string, entityId: string) {
    // Simulate Clearbit API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (entityType === 'company') {
      return {
        data: {
          companyName: 'Acme Corporation',
          domain: 'acme.com',
          industry: 'Technology',
          employeeCount: 250,
          revenue: '$10M-$50M',
          location: 'San Francisco, CA',
          description: 'Leading provider of innovative solutions',
          tags: ['B2B', 'SaaS', 'Enterprise'],
        },
      }
    } else if (entityType === 'person') {
      return {
        data: {
          fullName: 'John Doe',
          title: 'CEO',
          email: 'john@acme.com',
          phone: '+1-555-0100',
          linkedin: 'linkedin.com/in/johndoe',
          twitter: '@johndoe',
        },
      }
    }

    return null
  }

  private async fetchFromHunter(entityType: string, entityId: string) {
    // Simulate Hunter.io API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      data: {
        emailPattern: '{first}@acme.com',
        emailsFound: 15,
        webmail: false,
        disposable: false,
        acceptAll: false,
      },
    }
  }

  private async fetchFromLinkedin(entityType: string, entityId: string) {
    // Simulate LinkedIn API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    return {
      data: {
        profileUrl: `linkedin.com/company/acme`,
        followers: 5000,
        updates: 150,
      },
    }
  }

  private async fetchFromCrunchbase(entityType: string, entityId: string) {
    // Simulate Crunchbase API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      data: {
        fundingTotal: '$25M',
        lastFundingRound: 'Series B',
        investors: ['Sequoia', 'a16z', 'Y Combinator'],
        foundedYear: 2018,
      },
    }
  }

  private async fetchFromCustom(entityType: string, entityId: string) {
    // Custom enrichment logic
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      data: {
        customField: 'Custom value',
        processedAt: new Date().toISOString(),
      },
    }
  }

  private calculateConfidence(sourcesUsed: string[], data: any): number {
    const baseScore = Math.min(sourcesUsed.length * 0.3, 0.9)
    const dataCompleteness = Object.keys(data).length / 20 // Assume 20 fields max
    return Math.min(baseScore + dataCompleteness * 0.1, 1.0)
  }
}
