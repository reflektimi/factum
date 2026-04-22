export const onRequest: PagesFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const backendUrl = `https://factum-5v5v.onrender.com/api/${params.path || ''}${url.search}`;
  const backendRequest = new Request(backendUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    redirect: 'manual',
    credentials: 'include',
  });
  const response = await fetch(backendRequest);
  return response;
};
