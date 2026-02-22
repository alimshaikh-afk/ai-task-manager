export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, tasks, highPriority, label } = req.body;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: 'Resend API key not configured' });
    }

    let emailBody = `<h2>${label}</h2>`;
    
    if (highPriority > 0) {
      emailBody += `<p style="color: #dc2626; font-weight: bold;">🔥 ${highPriority} high priority task${highPriority > 1 ? 's' : ''}</p>`;
    }

    emailBody += `<p>You have ${tasks.length} pending task${tasks.length !== 1 ? 's' : ''}:</p><ul>`;
    
    tasks.slice(0, 10).forEach(task => {
      const priorityColor = task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#ca8a04' : '#16a34a';
      emailBody += `<li style="color: ${priorityColor}; margin: 8px 0;"><strong>${task.title}</strong> (${task.priority} priority)</li>`;
    });
    
    emailBody += '</ul>';
    if (tasks.length > 10) {
      emailBody += `<p>...and ${tasks.length - 10} more tasks</p>`;
    }

    emailBody += '<p style="margin-top: 20px;"><a href="https://ai-task-manager-amber.vercel.app/" style="background: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Task Manager</a></p>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Task Manager <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: emailBody
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
