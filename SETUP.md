# ClockHub - Setup Guide

## Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.ytjoqjumlvfmzvzoarff:OgQmfQ725aJrAhz0@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# JWT Configuration
JWT_SECRET="tu_secreto_jwt_minimo_32_caracteres_aqui_12345"
JWT_EXPIRES_IN="15m"

# Refresh Token Configuration
REFRESH_TOKEN_SECRET="otro_secreto_refresh_minimo_32_caracteres_67890"
REFRESH_TOKEN_EXPIRY="7d"
REFRESH_TOKEN_LENGTH=64

# Application Settings
LOG_LEVEL="INFO"
PORT=3000
NODE_ENV="development"
SALT_ROUNDS=12
```

## Pasos para Iniciar

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Sincronizar base de datos:**
   ```bash
   npm run db:push
   ```

3. **Crear usuario de prueba (opcional):**
   ```bash
   npm run db:studio
   ```
   - Crear un usuario en la tabla `users` con email y password hasheado

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación:**
   - Login: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/auth/login/route.ts  # API endpoint login
│   ├── login/page.tsx           # Página de login
│   └── dashboard/page.tsx       # Página protegida
├── components/
│   └── LoginForm.tsx            # Formulario de login
├── hooks/
│   └── useAuth.ts               # Hook de autenticación
├── services/
│   ├── authService.ts           # Lógica de login
│   ├── bcryptService.ts         # Hashing de passwords
│   ├── jwt/jwtServices.ts       # Generación/verificación JWT
│   ├── jwt/errorHandler.ts      # Manejo errores JWT
│   └── refreshtokenservice.ts   # Refresh tokens
└── types/
    └── indextypes.ts            # Tipos TypeScript
```

## Flujo de Login

1. Usuario ingresa email/password en `/login`
2. `LoginForm` llama a `useAuth.login()`
3. Hook hace POST a `/api/auth/login`
4. API valida credenciales con `authService.login()`
5. Se generan access token (JWT) y refresh token
6. Refresh token se guarda en cookie httpOnly
7. Access token se retorna y guarda en localStorage
8. Usuario redirigido a `/dashboard`

## Seguridad

- Passwords hasheados con bcrypt
- Access tokens JWT con expiración corta (15 min)
- Refresh tokens en cookies httpOnly
- Validación Zod en todas las entradas
- CORS configurado por Next.js
