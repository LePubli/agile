import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  async sendEmail(emailData: EmailData): Promise<boolean> {
    const provider = this.configService.get<string>('EMAIL_PROVIDER', 'smtp');

    // Enregistrer l'email dans la base de données
    const emailLog = await this.prisma.emailLog.create({
      data: {
        to: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to,
        subject: emailData.subject,
        body: emailData.html,
        status: 'PENDING',
      },
    });

    try {
      // Émettre un événement pour envoyer l'email via la queue
      this.eventEmitter.emit('email.send', {
        emailId: emailLog.id,
        ...emailData,
      });

      return true;
    } catch (error) {
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <h1>Bienvenue sur NexusOS !</h1>
      <p>Bonjour ${userName},</p>
      <p>Merci de vous être inscrit sur NexusOS. Nous sommes ravis de vous accueillir.</p>
      <p>Commencez dès maintenant à explorer toutes les fonctionnalités de notre plateforme.</p>
      <p>Cordialement,<br>L'équipe NexusOS</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Bienvenue sur NexusOS',
      html,
      text: `Bonjour ${userName},\n\nMerci de vous être inscrit sur NexusOS.\n\nCordialement,\nL'équipe NexusOS`,
    });
  }

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Bonjour ${userName},</p>
      <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      <p>Ce lien expirera dans 1 heure.</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Réinitialisation de mot de passe - NexusOS',
      html,
      text: `Bonjour ${userName},\n\nVous avez demandé une réinitialisation de votre mot de passe.\n\nCliquez sur le lien suivant : ${resetUrl}\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.`,
    });
  }

  async sendVerificationEmail(userEmail: string, userName: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get<string>('API_URL')}/auth/verify-email?token=${verificationToken}`;
    
    const html = `
      <h1>Vérification de votre email</h1>
      <p>Bonjour ${userName},</p>
      <p>Merci de vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
      <p><a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Vérifier mon email</a></p>
      <p>Ce lien expirera dans 24 heures.</p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Vérifiez votre email - NexusOS',
      html,
      text: `Bonjour ${userName},\n\nMerci de vérifier votre adresse email en cliquant sur le lien suivant : ${verificationUrl}`,
    });
  }

  async sendNotificationEmail(
    userEmail: string,
    subject: string,
    message: string,
    actionUrl?: string,
  ): Promise<boolean> {
    const html = `
      <h1>${subject}</h1>
      <p>${message}</p>
      ${actionUrl ? `<p><a href="${actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Voir plus</a></p>` : ''}
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }
}
