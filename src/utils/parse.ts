export function getPlainTextBody(rawBody: string | Buffer | undefined): string {
    if (!rawBody) {
        return '';
    }
    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    return bodyString.replace(/<[^>]*>?/gm, '').trim(); 
}