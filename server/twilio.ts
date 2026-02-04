// Twilio integration for SMS and WhatsApp notifications
import twilio from 'twilio';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.account_sid || !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret)) {
    throw new Error('Twilio not connected');
  }
  return {
    accountSid: connectionSettings.settings.account_sid,
    apiKey: connectionSettings.settings.api_key,
    apiKeySecret: connectionSettings.settings.api_key_secret,
    phoneNumber: connectionSettings.settings.phone_number
  };
}

export async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, {
    accountSid: accountSid
  });
}

export async function getTwilioFromPhoneNumber() {
  const { phoneNumber } = await getCredentials();
  return phoneNumber;
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();
    
    const formattedTo = to.startsWith('+') ? to : `+27${to.replace(/^0/, '')}`;
    
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
    });
    
    console.log(`[SMS] Sent to ${formattedTo}: ${message}`);
    return true;
  } catch (error) {
    console.error('[SMS] Failed to send:', error);
    return false;
  }
}

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();
    
    const formattedTo = to.startsWith('+') ? to : `+27${to.replace(/^0/, '')}`;
    
    await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedTo}`,
    });
    
    console.log(`[WhatsApp] Sent to ${formattedTo}: ${message}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send:', error);
    return false;
  }
}

export async function sendBookingConfirmation(
  clientPhone: string,
  clientName: string,
  accessCode: string,
  shopName: string,
  barberName: string,
  slotTime: string,
  bookingDate: string,
  notifySms: boolean,
  notifyWhatsapp: boolean
): Promise<void> {
  const dateLabel = bookingDate === 'today' ? 'today' : 'tomorrow';
  const message = `Hi ${clientName}! Your QueueCut booking is confirmed.\n\nAccess Code: ${accessCode}\nBarber: ${barberName}\nShop: ${shopName}\nTime: ${slotTime} ${dateLabel}\n\nSave this code to manage your booking!`;
  
  if (notifySms) {
    await sendSMS(clientPhone, message);
  }
  
  if (notifyWhatsapp) {
    await sendWhatsApp(clientPhone, message);
  }
}
