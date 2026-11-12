import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Do NOT attach mock token to Keycloak direct requests or requests with existing Authorization
  if (req.url.includes(':8180') || req.headers.has('Authorization')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
