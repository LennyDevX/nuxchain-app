# Nuxchain Airdrop Registration System

## 📋 Overview

Sistema de registro para el airdrop de 20 POL tokens de Nuxchain. Los usuarios se registran con su nombre, email y wallet address para recibir tokens que pueden usar para hacer staking en la plataforma.

## ✨ Features

### User Experience
- ✅ Formulario simple y moderno con validación en tiempo real
- ✅ Conexión de wallet integrada (auto-fill de dirección)
- ✅ Validación de duplicados (wallet y email únicos)
- ✅ Animaciones fluidas y responsive design
- ✅ Feedback visual inmediato (success/error states)
- ✅ Modal de confirmación con detalles del airdrop
- ✅ Optimizado para mobile-first

### Technical Features
- ✅ TypeScript con type safety completo
- ✅ Integración con Wagmi v2 para wallet connection
- ✅ Firebase Firestore para persistencia de datos
- ✅ Validación client-side y server-side
- ✅ Lazy loading y code splitting
- ✅ SEO optimizado

## 🗂️ File Structure

```
src/
├── pages/
│   └── Airdrop.tsx                    # Página principal del airdrop
├── components/
│   └── forms/
│       └── airdrop-service.ts         # Servicio de Firestore
├── router/
│   └── routes.tsx                     # Configuración de rutas
└── styles/
    └── globals.css                    # Animaciones CSS

api/
└── types/
    └── index.ts                       # TypeScript interfaces

doc/
└── AIRDROP_FIRESTORE_SETUP.md         # Configuración de Firestore
```

## 🚀 Quick Start

### 1. Configure Firebase (if not already done)

Las variables de entorno necesarias en `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Set Up Firestore Security Rules

Ver instrucciones detalladas en [AIRDROP_FIRESTORE_SETUP.md](./AIRDROP_FIRESTORE_SETUP.md)

### 3. Access the Page

La página está disponible en: `/airdrop`

## 📱 User Flow

1. **Usuario visita `/airdrop`**
   - Ve información del airdrop de 20 POL
   - Lee los beneficios y características

2. **Completa el formulario**
   - Ingresa nombre (mínimo 3 caracteres)
   - Ingresa email válido
   - Conecta wallet o ingresa dirección manualmente

3. **Validación automática**
   - Verifica formato de email
   - Valida dirección de wallet (0x... format)
   - Comprueba duplicados en Firestore

4. **Registro exitoso**
   - Modal de confirmación aparece
   - Datos guardados en Firestore
   - Usuario recibe feedback positivo

5. **Siguiente paso (futuro)**
   - Smart contract distribuye 20 POL tokens
   - Usuario puede hacer staking en `/staking`

## 🔒 Security

### Client-side Validation
- Validación de formato de email con regex
- Validación de wallet address (checksum-compatible)
- Longitud mínima de nombre (3 caracteres)
- Verificación de duplicados antes de submit

### Server-side Security
- Firestore Security Rules validan todos los campos
- Solo operaciones CREATE permitidas para usuarios
- Timestamps generados server-side
- No se permite lectura pública de registros

### Data Privacy
- No se almacenan datos sensibles
- Emails y wallets en lowercase para consistencia
- Solo admin puede ver/modificar registros

## 🎨 Design Features

### TailwindCSS Best Practices
- Gradient backgrounds con `backdrop-blur`
- Glass morphism effects
- Responsive spacing con sistema de breakpoints
- Dark theme optimizado
- Accesibilidad con focus states

### Animations
- Fade in transitions
- Scale animations para modal
- Pulse effect para status indicators
- Smooth hover states
- Loading spinners

### Mobile Optimization
- Touch-friendly buttons (min 44px)
- Responsive grid layouts
- Optimized font sizes
- Reduced motion support
- Fast tap response

## 📊 Data Structure

### Firestore Collection: `nuxchainAirdropRegistrations`

```typescript
interface AirdropRegistration {
  name: string;           // "John Doe"
  email: string;          // "john@example.com" (lowercase)
  wallet: string;         // "0x1234...5678" (lowercase)
  createdAt: Timestamp;   // Firestore server timestamp
  status: string;         // "pending" | "approved" | "distributed"
  airdropAmount: string;  // "20"
}
```

## 🔄 Future Enhancements

### Phase 1 (Current)
- ✅ User registration form
- ✅ Firestore persistence
- ✅ Duplicate detection
- ✅ Wallet connection

### Phase 2 (Next)
- [ ] Smart contract integration
- [ ] Automatic token distribution
- [ ] Transaction confirmation on-chain
- [ ] Email notifications

### Phase 3 (Future)
- [ ] Admin dashboard para gestión
- [ ] Analytics y estadísticas
- [ ] Referral system
- [ ] Multi-tier airdrops

## 🛠️ Maintenance

### View Registrations (Admin Only)

Usa Firebase Console para ver registros:
1. Ve a Firestore Database
2. Busca collection `nuxchainAirdropRegistrations`
3. Filtra por `status: pending` para ver nuevos registros

### Export Data

```typescript
// Script de ejemplo para exportar registros
import { collection, getDocs } from 'firebase/firestore';

const querySnapshot = await getDocs(
  collection(db, 'nuxchainAirdropRegistrations')
);

const registrations = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

console.log(JSON.stringify(registrations, null, 2));
```

### Update Status

```typescript
// Actualizar status de registro (solo admin)
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'nuxchainAirdropRegistrations', registrationId), {
  status: 'distributed'
});
```

## 📝 TypeScript Types

Ver definiciones completas en `api/types/index.ts`:

```typescript
export interface AirdropRegistration {
  name: string;
  email: string;
  wallet: string;
  timestamp?: number;
  createdAt?: any;
}

export interface AirdropRegistrationRequest {
  name: string;
  email: string;
  wallet: string;
}

export interface AirdropRegistrationResponse {
  success: boolean;
  id?: string;
  message?: string;
}
```

## 🐛 Troubleshooting

### Error: "This wallet is already registered"
- La wallet ya existe en Firestore
- Cada wallet solo puede registrarse una vez

### Error: "This email is already registered"
- El email ya existe en Firestore
- Cada email solo puede registrarse una vez

### Error: "Database connection not initialized"
- Verifica variables de entorno de Firebase
- Revisa que Firebase esté correctamente configurado

### Error: "Access denied"
- Verifica Firestore Security Rules
- Asegúrate de que las reglas permitan CREATE

## 📞 Support

Para problemas o preguntas:
1. Revisa esta documentación
2. Verifica la configuración de Firebase
3. Consulta los logs del navegador
4. Revisa Firestore Security Rules

---

**Desarrollado por:** Nuxchain Team  
**Versión:** 1.0.0  
**Última actualización:** Enero 2026
