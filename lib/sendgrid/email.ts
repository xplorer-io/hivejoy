import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface SellerRegistrationEmailData {
  businessName: string;
  email: string;
  abn?: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
  };
  bio: string;
  producerId: string;
  userId: string;
}

/**
 * Send email notification to agent when a new seller registers
 */
export async function sendSellerRegistrationEmail(
  data: SellerRegistrationEmailData,
  agentEmail?: string
): Promise<{ success: boolean; error?: string }> {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key is not configured. Email notification skipped.');
    return { success: false, error: 'SendGrid API key is not configured' };
  }

  // Use provided email, environment variable, or default to adarsha.aryal653@gmail.com
  const recipientEmail = agentEmail || process.env.SENDGRID_AGENT_EMAIL || 'adarsha.aryal653@gmail.com';

  if (!recipientEmail) {
    console.warn('Agent email is not configured. Email notification skipped.');
    return { success: false, error: 'Agent email is not configured' };
  }

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Seller Registration - Hive Joy</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🍯 New Seller Registration</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">A new seller has registered on Hive Joy and is awaiting verification.</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">Business Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 140px;">Business Name:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.businessName)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.email)}</td>
                </tr>
                ${data.abn ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">ABN:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.abn)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Address:</td>
                  <td style="padding: 8px 0; color: #1f2937;">
                    ${escapeHtml(data.address.street)}<br>
                    ${escapeHtml(data.address.suburb)}, ${escapeHtml(data.address.state)} ${escapeHtml(data.address.postcode)}<br>
                    ${escapeHtml(data.address.country)}
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">About the Business</h2>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">${escapeHtml(data.bio)}</p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Action Required:</strong> Please review this seller registration in the admin dashboard and verify their account.
              </p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hivejoy.netlify.app'}/admin/verifications" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Review in Admin Dashboard
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">
                <strong>Producer ID:</strong> ${data.producerId}<br>
                <strong>User ID:</strong> ${data.userId}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New Seller Registration - Hive Joy

A new seller has registered on Hive Joy and is awaiting verification.

Business Information:
- Business Name: ${data.businessName}
- Email: ${data.email}
${data.abn ? `- ABN: ${data.abn}` : ''}
- Address: ${data.address.street}, ${data.address.suburb}, ${data.address.state} ${data.address.postcode}, ${data.address.country}

About the Business:
${data.bio}

Action Required: Please review this seller registration in the admin dashboard and verify their account.

Review in Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://hivejoy.netlify.app'}/admin/verifications

Producer ID: ${data.producerId}
User ID: ${data.userId}
    `;

    const msg = {
      to: recipientEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hivejoy.com',
      subject: `🍯 New Seller Registration: ${data.businessName}`,
      text: emailText,
      html: emailHtml,
    };

    await sgMail.send(msg);

    return { success: true };
  } catch (error) {
    console.error('Error sending seller registration email:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common SendGrid errors
      if (errorMessage.includes('sender') || errorMessage.includes('from')) {
        errorMessage = 'Sender email not verified. Please verify your sender email in SendGrid dashboard (Settings → Sender Authentication).';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'Invalid API key or insufficient permissions. Check your SENDGRID_API_KEY.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Invalid API key. Check your SENDGRID_API_KEY in .env.local.';
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface VerificationRequestEmailData {
  businessName: string;
  email: string;
  abn?: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
  };
  bio?: string;
  producerId: string;
  userId: string;
  submissionId: string;
  documents: Array<{
    type: string;
    name: string;
    url: string;
  }>;
}

/**
 * Send email notification to admin when a seller submits verification proof
 */
export async function sendVerificationRequestEmail(
  data: VerificationRequestEmailData,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key is not configured. Email notification skipped.');
    return { success: false, error: 'SendGrid API key is not configured' };
  }

  if (!adminEmail) {
    console.warn('Admin email is not configured. Email notification skipped.');
    return { success: false, error: 'Admin email is not configured' };
  }

  try {
    const documentsList = data.documents
      .map(
        (doc) => `
        <li style="margin-bottom: 8px;">
          <strong>${escapeHtml(doc.type.replace(/_/g, ' '))}:</strong> 
          <a href="${escapeHtml(doc.url)}" style="color: #f59e0b; text-decoration: none;">${escapeHtml(doc.name)}</a>
        </li>
      `
      )
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Seller Verification Request - Hive Joy</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🍯 Seller Verification Request</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-top: 0;">A seller has submitted proof of authentic honey and is requesting verification.</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">Business Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 140px;">Business Name:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.businessName)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.email)}</td>
                </tr>
                ${data.abn ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">ABN:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(data.abn)}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Address:</td>
                  <td style="padding: 8px 0; color: #1f2937;">
                    ${escapeHtml(data.address.street)}<br>
                    ${escapeHtml(data.address.suburb)}, ${escapeHtml(data.address.state)} ${escapeHtml(data.address.postcode)}<br>
                    ${escapeHtml(data.address.country)}
                  </td>
                </tr>
              </table>
            </div>

            ${data.bio ? `
            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">About the Business</h2>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">${escapeHtml(data.bio)}</p>
            </div>
            ` : ''}

            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">Proof Documents Submitted</h2>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                ${documentsList}
              </ul>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Action Required:</strong> Please review the submitted documents and verify this seller in the admin dashboard.
              </p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hivejoy.netlify.app'}/admin/verifications/${data.submissionId}" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Review Verification Request
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">
                <strong>Submission ID:</strong> ${data.submissionId}<br>
                <strong>Producer ID:</strong> ${data.producerId}<br>
                <strong>User ID:</strong> ${data.userId}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Seller Verification Request - Hive Joy

A seller has submitted proof of authentic honey and is requesting verification.

Business Information:
- Business Name: ${data.businessName}
- Email: ${data.email}
${data.abn ? `- ABN: ${data.abn}` : ''}
- Address: ${data.address.street}, ${data.address.suburb}, ${data.address.state} ${data.address.postcode}, ${data.address.country}

${data.bio ? `About the Business:\n${data.bio}\n\n` : ''}Proof Documents Submitted:
${data.documents.map((doc) => `- ${doc.type.replace(/_/g, ' ')}: ${doc.name} (${doc.url})`).join('\n')}

Action Required: Please review the submitted documents and verify this seller in the admin dashboard.

Review Verification Request: ${process.env.NEXT_PUBLIC_APP_URL || 'https://hivejoy.netlify.app'}/admin/verifications/${data.submissionId}

Submission ID: ${data.submissionId}
Producer ID: ${data.producerId}
User ID: ${data.userId}
    `;

    const msg = {
      to: adminEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hivejoy.com',
      subject: `🍯 Verification Request: ${data.businessName} - Proof of Authentic Honey`,
      text: emailText,
      html: emailHtml,
    };

    await sgMail.send(msg);

    return { success: true };
  } catch (error) {
    console.error('Error sending verification request email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
