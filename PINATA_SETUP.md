# Configuración de Pinata para NFT Creation

## Problema
Si ves el error `Failed to upload image to IPFS` con código 401, significa que las credenciales de Pinata no están configuradas correctamente.

## Solución

### Paso 1: Crear cuenta en Pinata
1. Ve a [https://app.pinata.cloud/](https://app.pinata.cloud/)
2. Crea una cuenta gratuita o inicia sesión

### Paso 2: Generar API Key
1. Una vez logueado, ve a **API Keys** en el menú lateral
2. Haz clic en **New Key**
3. Configura los permisos:
   - ✅ **pinFileToIPFS** (requerido para subir imágenes)
   - ✅ **pinJSONToIPFS** (requerido para subir metadata)
   - ✅ **unpin** (opcional, para gestión de archivos)
4. Dale un nombre a tu key (ej: "NFT App Key")
5. Haz clic en **Create Key**

### Paso 3: Copiar el JWT
1. **IMPORTANTE**: Copia el JWT inmediatamente, solo se muestra una vez
2. El JWT es un token largo que empieza con `eyJ...`

### Paso 4: Configurar el archivo .env
1. Abre tu archivo `.env`
2. Encuentra la línea `VITE_PINATA_JWT=`
3. Pega tu JWT después del signo igual:
   ```
   VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Paso 5: Reiniciar el servidor
1. Detén tu servidor de desarrollo (Ctrl+C)
2. Reinicia con `npm run dev` o `yarn dev`

## Verificación
Después de configurar correctamente:
- El error 401 debería desaparecer
- Podrás subir imágenes y crear NFTs sin problemas
- Los archivos se almacenarán en IPFS a través de Pinata

## Notas importantes
- **Nunca compartas tu JWT** en repositorios públicos
- El JWT no expira, pero puedes regenerarlo si es necesario
- Pinata tiene un plan gratuito con límites generosos para desarrollo
- Los archivos subidos a IPFS son permanentes y públicos

## Troubleshooting
- Si sigues viendo errores 401, verifica que copiaste el JWT completo
- Asegúrate de que no hay espacios extra antes o después del JWT
- Verifica que los permisos `pinFileToIPFS` y `pinJSONToIPFS` estén habilitados