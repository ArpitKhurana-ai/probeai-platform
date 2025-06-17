export function initializeBrevo() {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not found. Newsletter functionality will be disabled.');
    return;
  }
  
  console.log('Brevo API key configured');
}

export async function subscribeToNewsletter(email: string, name?: string) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('Brevo API not configured. Please check BREVO_API_KEY.');
  }

  try {
    const contactData = {
      email: email,
      attributes: name ? { FIRSTNAME: name } : {},
      ...(process.env.BREVO_LIST_ID && { listIds: [parseInt(process.env.BREVO_LIST_ID)] })
    };

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(contactData)
    });

    if (response.status === 400) {
      // Contact already exists, try to update
      const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          attributes: name ? { FIRSTNAME: name } : {},
          ...(process.env.BREVO_LIST_ID && { listIds: [parseInt(process.env.BREVO_LIST_ID)] })
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update contact: ${updateResponse.statusText}`);
      }
      
      console.log('Existing contact updated successfully');
      return { updated: true };
    }

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Contact created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error with newsletter subscription:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.warn('Brevo not configured for sending emails');
    return;
  }

  try {
    const emailData = {
      sender: { 
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || 'Probe AI'
      },
      to: [{ email, name: name || email }],
      subject: 'Welcome to Probe AI Newsletter!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Probe AI!</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Thank you for subscribing to our newsletter! You'll now receive:</p>
          <ul>
            <li>Latest AI tool discoveries</li>
            <li>Exclusive industry insights</li>
            <li>Expert reviews and comparisons</li>
            <li>Early access to new features</li>
          </ul>
          <p>Stay tuned for amazing AI content!</p>
          <p>Best regards,<br>The Probe AI Team</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            You received this email because you subscribed to our newsletter at Probe AI.
          </p>
        </div>
      `
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Welcome email sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failure
  }
}