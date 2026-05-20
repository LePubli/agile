import { Process, Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'

export interface EmailJobData {
  to: string
  subject: string
  body: string
  html?: string
  tenantId?: string
  userId?: string
}

@Processor('emails')
export class EmailsProcessor {
  private readonly logger = new Logger(EmailsProcessor.name)

  @Process()
  async sendEmail(job: Job<EmailJobData>) {
    const { to, subject, body, html, tenantId, userId } = job.data

    this.logger.log(`Sending email to ${to} - Subject: ${subject}`)
    
    try {
      // TODO: Integrate with actual email provider (SendGrid, SES, etc.)
      // For now, just log the email details
      
      this.logger.debug({
        event: 'email_sent',
        to,
        subject,
        tenantId,
        userId,
        timestamp: new Date().toISOString(),
      })

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sentAt: new Date().toISOString(),
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`)
      throw error
    }
  }

  @Process('welcome')
  async sendWelcomeEmail(job: Job<EmailJobData & { userName: string }>) {
    const { to, userName } = job.data
    
    this.logger.log(`Sending welcome email to ${userName} (${to})`)
    
    // Welcome email specific logic
    return this.sendEmail(job)
  }

  @Process('password-reset')
  async sendPasswordResetEmail(job: Job<EmailJobData & { resetToken: string }>) {
    const { to, resetToken } = job.data
    
    this.logger.log(`Sending password reset email to ${to}`)
    
    // Password reset email specific logic
    return this.sendEmail(job)
  }

  @Process('notification')
  async sendNotificationEmail(job: Job<EmailJobData & { notificationType: string }>) {
    const { to, notificationType } = job.data
    
    this.logger.log(`Sending ${notificationType} notification to ${to}`)
    
    // Notification email specific logic
    return this.sendEmail(job)
  }
}
