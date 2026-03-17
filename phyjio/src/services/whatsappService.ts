import { Linking } from 'react-native';
import Share from 'react-native-share';

export type MessageTemplate =
  | 'delay'
  | 'absence_today'
  | 'absence_tomorrow'
  | 'charges'
  | 'appointment_confirm'
  | 'bill_ready';

export interface WhatsAppPayload {
  template: MessageTemplate;
  patientName?: string;
  relativeName?: string;
  phoneNumber?: string;
  delayMinutes?: number;
  absenceReason?: string;
  visitDate?: string;
  billAmount?: number;
  charges?: {
    perVisit: number;
    monthly: number;
    bankName: string;
    accountNo: string;
    ifscCode: string;
    upiId: string;
    accountName: string;
  };
}

export function buildWhatsAppMessage(payload: WhatsAppPayload): string {
  const name = payload.patientName ?? payload.relativeName ?? 'Patient';

  switch (payload.template) {
    case 'delay':
      return (
        `🙏 *Dear ${name},*\n\n` +
        `I hope you are well. This is to inform you that I am currently running approximately *${payload.delayMinutes ?? '?'} minutes late* for today's home visit session.\n\n` +
        `I will be with you shortly. Kindly bear with me.\n\n` +
        `_Thank you for your patience._\n\n` +
        `*PhyJio — Home Physiotherapy*`
      );

    case 'absence_today':
      return (
        `🙏 *Dear ${name},*\n\n` +
        `Due to *${payload.absenceReason ?? 'unavoidable circumstances'}*, I will *not be able to visit today*.\n\n` +
        `I sincerely apologize for the inconvenience. I will resume your sessions from tomorrow as scheduled.\n\n` +
        `_Please contact me if you need anything urgently._\n\n` +
        `*PhyJio — Home Physiotherapy*`
      );

    case 'absence_tomorrow':
      return (
        `🙏 *Dear ${name},*\n\n` +
        `Due to *${payload.absenceReason ?? 'unavoidable circumstances'}*, I will *not be able to visit tomorrow*${payload.visitDate ? ` (${payload.visitDate})` : ''}.\n\n` +
        `I sincerely apologize for the inconvenience. I will resume your sessions as soon as possible.\n\n` +
        `_Please contact me if you need anything urgently._\n\n` +
        `*PhyJio — Home Physiotherapy*`
      );

    case 'charges': {
      const c = payload.charges;
      if (!c) return '';
      return (
        `💼 *PhyJio — Home Visit Charges*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 *Session Charges:*\n` +
        `• Per Visit: *₹${c.perVisit}*\n` +
        `• Monthly Package: *₹${c.monthly}*\n\n` +
        `🏦 *Bank Details:*\n` +
        `• Bank: *${c.bankName}*\n` +
        `• Account: *${c.accountNo}*\n` +
        `• IFSC: *${c.ifscCode}*\n` +
        `• Account Name: *${c.accountName}*\n\n` +
        `📱 *UPI ID:* \`${c.upiId}\`\n\n` +
        `_Kindly make the payment within 5 days of receiving the bill._\n\n` +
        `*Thank you for trusting PhyJio!* 🙏`
      );
    }

    case 'appointment_confirm':
      return (
        `✅ *Appointment Confirmed*\n\n` +
        `Dear *${name}*,\n\n` +
        `Your home physiotherapy session has been confirmed for:\n` +
        `📅 *Date:* ${payload.visitDate ?? 'As scheduled'}\n\n` +
        `📋 *Please prepare:*\n` +
        `• Clean mat or flat surface\n` +
        `• Loose, comfortable clothing\n` +
        `• Any prescribed medications nearby\n` +
        `• Water for the patient\n\n` +
        `_Please call if you need to reschedule._\n\n` +
        `*PhyJio — Home Physiotherapy* 🩺`
      );

    case 'bill_ready':
      return (
        `🧾 *PhyJio — Invoice Ready*\n\n` +
        `Dear *${name}*,\n\n` +
        `Your physiotherapy invoice is ready.\n\n` +
        `💰 *Total Amount Due: ₹${payload.billAmount ?? 0}*\n\n` +
        `Please find the detailed bill attached. Kindly arrange payment at your earliest convenience.\n\n` +
        `_Thank you for choosing PhyJio!_\n\n` +
        `*PhyJio — Home Physiotherapy* 🩺`
      );

    default:
      return '';
  }
}

export async function sendWhatsApp(payload: WhatsAppPayload): Promise<void> {
  const message = buildWhatsAppMessage(payload);
  const encoded = encodeURIComponent(message);

  if (payload.phoneNumber) {
    const url = `whatsapp://send?phone=91${payload.phoneNumber}&text=${encoded}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return;
    }
  }

  // Fallback: share
  await Share.share({ message });
}

export function previewMessage(payload: WhatsAppPayload): string {
  return buildWhatsAppMessage(payload);
}
