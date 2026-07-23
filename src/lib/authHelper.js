import { verify } from './jwt';

export function getSession(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    return verify(token);
  } catch (e) {
    return null;
  }
}

export function isAdmin(session) {
  if (!session) return false;
  return session.id_rol === 1 || session.email === 'admin@nexa.com';
}
