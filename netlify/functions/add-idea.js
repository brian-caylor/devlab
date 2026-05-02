// Netlify serverless function: POST /.netlify/functions/add-idea
// Accepts { "text": "My idea" } with Bearer token auth
// Reads devlab-data.json from GitHub, appends idea, commits back

const MAX_TEXT_LENGTH = 2000;

exports.handler = async (event) => {
  // Apple Shortcuts don't send Origin headers, so CORS isn't needed for Siri.
  // We expose the endpoint only to the site's own origin for any browser-based callers.
  const allowedOrigin = process.env.URL || '';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
  }

  // Auth check
  const secret = process.env.DEVLAB_IDEA_TOKEN;
  const auth = (event.headers.authorization || '').replace('Bearer ', '');
  if (!secret || auth !== secret) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // Parse body
  let text;
  try {
    const body = JSON.parse(event.body);
    text = (body.text || '').trim();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (!text) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'text is required' }) };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: `text exceeds ${MAX_TEXT_LENGTH} chars` }) };
  }

  // GitHub config from env — all required, no defaults to avoid cross-account writes
  const ghToken = process.env.DEVLAB_GH_TOKEN;
  const owner = process.env.DEVLAB_GH_OWNER;
  const repo = process.env.DEVLAB_GH_REPO;
  const path = 'devlab-data.json';

  if (!ghToken || !owner || !repo) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured: missing DEVLAB_GH_TOKEN / DEVLAB_GH_OWNER / DEVLAB_GH_REPO' }) };
  }

  const ghHeaders = {
    Authorization: `Bearer ${ghToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    // Read current file
    const getRes = await fetch(apiBase, { headers: ghHeaders });
    if (!getRes.ok) throw new Error(`GitHub GET ${getRes.status}`);
    const file = await getRes.json();

    // Decode and parse
    const raw = Buffer.from(file.content, 'base64').toString('utf-8');
    const data = JSON.parse(raw);

    // Add idea
    const idea = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      text,
      createdAt: new Date().toISOString(),
    };
    if (!data.ideas) data.ideas = [];
    data.ideas.unshift(idea);

    // Write back
    const encoded = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
    const summary = text.replace(/\s+/g, ' ').slice(0, 40);
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `devlab: idea via Siri — "${summary}${text.length > 40 ? '…' : ''}"`,
        content: encoded,
        sha: file.sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.message || `GitHub PUT ${putRes.status}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, idea }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
