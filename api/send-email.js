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

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({
      error: 'RESEND_API_KEY is not set in Vercel environment variables. Add it in Vercel → Settings → Environment Variables, then redeploy.'
    });
  }

  const { to, subject, tasks, highPriority, label } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing to or subject' });
  }

  const pendingTasks = tasks || [];
  const hp = highPriority || 0;
  const lbl = label || 'Task Reminder';

  const taskItems = pendingTasks.slice(0, 15).map(task => {
    const color = task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#ca8a04' : '#16a34a';
    const due = task.dueDate ? ' — Due: ' + task.dueDate : '';
    return '<li style="margin:8px 0;color:' + color + ';"><strong>' + task.title + '</strong> (' + task.priority + due + ')</li>';
  }).join('');

  const html = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">'
    + '<h2 style="color:#1f2937;">' + lbl + '</h2>'
    + (hp > 0 ? '<p style="color:#dc2626;font-weight:600;">🔥 ' + hp + ' high priority task' + (hp > 1 ? 's' : '') + '</p>' : '')
    + '<p style="color:#374151;">You have <strong>' + pendingTasks.length + '</strong> pending task' + (pendingTasks.length !== 1 ? 's' : '') + ':</p>'
    + (pendingTasks.length > 0 ? '<ul style="padding-left:20px;">' + taskItems + '</ul>' : '<p style="color:#6b7280;">No pending tasks — great job!</p>')
    + (pendingTasks.length > 15 ? '<p style="color:#6b7280;font-size:13px;">...and ' + (pendingTasks.length - 15) + ' more</p>' : '')
    + '<div style="margin-top:28px;"><a href="https://ai-task-manager-amber.vercel.app/" style="background:#9333ea;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">Open Task Manager →</a></div>'
    + '<p style="color:#9ca3af;font-size:12px;margin-top:20px;">Sent by your AI Task Manager</p>'
    + '</div>';

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Task Manager <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      return res.status(resendRes.status).json({
        error: 'Resend API error: ' + (resendData.message || resendData.name || JSON.stringify(resendData))
      });
    }

    return res.status(200).json({ success: true, id: resendData.id });

  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
