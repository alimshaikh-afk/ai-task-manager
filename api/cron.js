export default async function handler(req, res) {
  const USER_EMAIL = 'alim.shaikh@penny.co';
  const FIREBASE_PROJECT_ID = 'ai-personal-assistant-225fe';
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  }

  try {
    // Use the correct Firestore REST API URL format
    const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT_ID + '/databases/(default)/documents/users/default_user';
    
    console.log('Fetching:', firestoreUrl);
    
    const firebaseRes = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Firebase status:', firebaseRes.status);

    if (!firebaseRes.ok) {
      const errorText = await firebaseRes.text();
      console.log('Firebase error body:', errorText);
      return res.status(500).json({ 
        error: 'Firebase fetch failed: ' + firebaseRes.status,
        details: errorText.slice(0, 500)
      });
    }

    const firebaseData = await firebaseRes.json();
    console.log('Firebase data keys:', Object.keys(firebaseData));

    // Parse Firestore document format
    let tasks = [];
    try {
      const tasksField = firebaseData.fields && firebaseData.fields.tasks;
      if (tasksField && tasksField.arrayValue && tasksField.arrayValue.values) {
        tasks = tasksField.arrayValue.values.map(item => {
          const f = item.mapValue && item.mapValue.fields;
          if (!f) return null;
          return {
            title: (f.title && f.title.stringValue) || 'Untitled',
            priority: (f.priority && f.priority.stringValue) || 'medium',
            dueDate: (f.dueDate && f.dueDate.stringValue) || null,
            category: (f.category && f.category.stringValue) || 'General',
            completed: (f.completed && f.completed.booleanValue) || false,
          };
        }).filter(t => t && !t.completed);
      }
    } catch (parseErr) {
      console.log('Parse error:', parseErr.message);
    }

    console.log('Tasks found:', tasks.length);

    const highPriority = tasks.filter(t => t.priority === 'high').length;

    // Determine label based on Bahrain time (UTC+3)
    const now = new Date();
    const bahrainHour = (now.getUTCHours() + 3) % 24;
    let label = '📋 Task Reminder';
    if (bahrainHour >= 9 && bahrainHour < 12) label = '☀️ Morning Check-in';
    else if (bahrainHour >= 13 && bahrainHour < 16) label = '⏰ Afternoon Reminder';
    else if (bahrainHour >= 16 && bahrainHour < 20) label = '🌙 Evening Wrap-up';

    // Build email HTML
    const taskItems = tasks.slice(0, 15).map(task => {
      const color = task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#ca8a04' : '#16a34a';
      const due = task.dueDate ? ' — Due: ' + task.dueDate : '';
      return '<li style="margin:8px 0;color:' + color + ';"><strong>' + task.title + '</strong> <span style="color:#6b7280;">(' + task.priority + due + ')</span></li>';
    }).join('');

    const html = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">'
      + '<h2 style="color:#1f2937;">' + label + '</h2>'
      + (highPriority > 0 ? '<p style="color:#dc2626;font-weight:600;">🔥 ' + highPriority + ' high priority task' + (highPriority > 1 ? 's' : '') + '</p>' : '')
      + '<p style="color:#374151;">You have <strong>' + tasks.length + '</strong> pending task' + (tasks.length !== 1 ? 's' : '') + ':</p>'
      + (tasks.length > 0 ? '<ul style="padding-left:20px;">' + taskItems + '</ul>' : '<p style="color:#6b7280;">No pending tasks — great job! 🎉</p>')
      + (tasks.length > 15 ? '<p style="color:#6b7280;font-size:13px;">...and ' + (tasks.length - 15) + ' more</p>' : '')
      + '<div style="margin-top:28px;"><a href="https://ai-task-manager-amber.vercel.app/" style="background:#9333ea;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">Open Task Manager →</a></div>'
      + '<p style="color:#9ca3af;font-size:12px;margin-top:20px;">Your AI Task Manager • ' + now.toLocaleString('en-US', { timeZone: 'Asia/Bahrain' }) + '</p>'
      + '</div>';

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Task Manager <onboarding@resend.dev>',
        to: [USER_EMAIL],
        subject: label + ' — ' + tasks.length + ' task' + (tasks.length !== 1 ? 's' : '') + ' pending',
        html: html
      })
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      return res.status(resendRes.status).json({
        error: 'Resend error: ' + (resendData.message || JSON.stringify(resendData))
      });
    }

    return res.status(200).json({
      success: true,
      tasksFound: tasks.length,
      highPriority: highPriority,
      emailSentTo: USER_EMAIL,
      label: label
    });

  } catch (err) {
    console.error('Cron error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
