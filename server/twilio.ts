import twilio from 'twilio';

type TwilioCredentials = {
  mode: 'env' | 'replit';
  accountSid: string;
  authToken?: string;
  apiKey?: string;
  apiKeySecret?: string;
  phoneNumber: string;
};

let cachedCredentials: TwilioCredentials | null = null;

async function getCredentials(): Promise<TwilioCredentials> {
  if (cachedCredentials) return cachedCredentials;

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (hostname && xReplitToken) {
    const connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (connectionSettings?.settings?.account_sid && connectionSettings?.settings?.api_key && connectionSettings?.settings?.api_key_secret) {
      cachedCredentials = {
        mode: 'replit',
        accountSid: connectionSettings.settings.account_sid,
        apiKey: connectionSettings.settings.api_key,
        apiKeySecret: connectionSettings.settings.api_key_secret,
        phoneNumber: connectionSettings.settings.phone_number,
      };
      return cachedCredentials;
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    cachedCredentials = {
      mode: 'env',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    };
    return cachedCredentials;
  }

  throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables, or configure the Replit Twilio connector.');
}

export async function getTwilioClient() {
  const creds = await getCredentials();
  if (creds.mode === 'env') {
    return twilio(creds.accountSid, creds.authToken!);
  }
  return twilio(creds.apiKey!, creds.apiKeySecret!, {
    accountSid: creds.accountSid
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
  const today = new Date().toISOString().split('T')[0];
  const dateLabel = bookingDate === today ? 'today' : 'tomorrow';
  const message = `Hi ${clientName}! Your QueueCut booking is confirmed.\n\nAccess Code: ${accessCode}\nBarber: ${barberName}\nShop: ${shopName}\nTime: ${slotTime} ${dateLabel}\n\nSave this code to manage your booking!`;
  
  if (notifySms) {
    await sendSMS(clientPhone, message);
  }
  
  if (notifyWhatsapp) {
    await sendWhatsApp(clientPhone, message);
  }
}

export async function sendStatusUpdate(
  clientPhone: string,
  clientName: string,
  accessCode: string,
  status: string,
  shopName: string,
  barberName: string,
  slotTime: string,
  notifySms: boolean,
  notifyWhatsapp: boolean
): Promise<void> {
  let message = '';
  
  switch (status) {
    case 'cutting':
      message = `Hi ${clientName}! Your barber ${barberName} at ${shopName} has started your cut.\n\nAccess Code: ${accessCode}\nTime: ${slotTime}`;
      break;
    case 'completed':
      message = `Hi ${clientName}! Your cut with ${barberName} at ${shopName} is complete. Thanks for visiting!\n\nAccess Code: ${accessCode}\n\nWe'd love your feedback!`;
      break;
    case 'cancelled':
      message = `Hi ${clientName}, your booking at ${shopName} with ${barberName} at ${slotTime} has been cancelled.\n\nAccess Code: ${accessCode}\n\nPlease rebook at your convenience.`;
      break;
    default:
      return;
  }
  
  if (notifySms) {
    await sendSMS(clientPhone, message);
  }
  
  if (notifyWhatsapp) {
    await sendWhatsApp(clientPhone, message);
  }
}
