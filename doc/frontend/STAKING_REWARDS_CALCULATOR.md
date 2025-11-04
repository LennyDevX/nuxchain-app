# 📊 Staking Rewards Calculator Component

## Overview
El componente **StakingRewardsCalculator** es una herramienta interactiva que permite a los usuarios calcular sus ganancias estimadas antes de realizar staking. Se encuentra en la columna derecha de la página de Staking en desktop.

## 📍 Ubicación
- **Archivo**: `src/components/staking/StakingRewardsCalculator.tsx`
- **Integrado en**: `src/pages/Staking.tsx` (columna derecha, solo desktop)
- **Visibility**: Desktop solamente (responsive)

## ✨ Características Principales

### 1. **Amount Slider** 💰
- Rango: 1 - 100,000 POL
- Incrementos: 100 POL
- Display en tiempo real del monto ingresado
- Validación automática

### 2. **Lockup Period Selection** 📅
Cuatro opciones con APY diferente:
- **Short Term (30 días)**: 87.6% APY - Low Risk
- **Medium Term (90 días)**: 122.6% APY - Medium Risk
- **Long Term (180 días)**: 148.9% APY - Medium Risk
- **Premium (365 días)**: 184% APY - High Risk

### 3. **Skills Application** ⚡
Aplicar habilidades de NFT para incrementar APY:
- **Stake Boost I**: +5% APY
- **Stake Boost II**: +10% APY
- **Stake Boost III**: +20% APY
- **Auto Compound**: +15% APY (especial: Bonus automático)
- **Lock Reducer**: Sin bonus APY (solo flexibilidad)
- **Fee Reducer I**: Sin bonus APY (solo reducción de comisiones)
- **Fee Reducer II**: Sin bonus APY (solo reducción de comisiones)

### 4. **Auto Compound Toggle** 🔄
- Activación con un click
- Bonus automático de +15% APY
- Reinversión cada 24h
- Indicador visual diferenciado

### 5. **Real-Time Calculations** 📈
Calcula y muestra en tiempo real:
- **Daily Reward**: Ganancia diaria
- **Monthly Reward**: Ganancia mensual (30 días)
- **Total Reward**: Ganancia total para el período seleccionado
- **Final Amount**: Monto total después del período (principal + rewards)
- **APY Breakdown**: Desglose de APY base vs bonificaciones por skills

## 🎨 Design Features

### Visual Hierarchy
```
┌─────────────────────────────────────────┐
│  📊 Rewards Calculator                  │
│  Estimate your earnings before staking  │
├─────────────────────────────────────────┤
│                                         │
│  💰 Amount to Stake: [Slider] 1000 POL │
│                                         │
│  📅 Lockup Period: [4 Buttons Grid]    │
│                                         │
│  ⚡ Apply Skills: [Checkboxes List]    │
│                                         │
│  🔄 Auto Compound: [Toggle Switch]     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  📊 Your Earnings:                      │
│  • Daily Reward      → 8.73 POL        │
│  • Monthly Reward    → 261 POL         │
│  • Total Reward      → 5,420 POL       │
│  💰 Final Amount     → 6,420 POL       │
│                                         │
│  [APY Breakdown Box]                    │
│                                         │
│  [Start Staking Now Button]             │
│                                         │
│  ⚠️ Warning: APY is variable           │
└─────────────────────────────────────────┘
```

### Color Coding
- **Sliders**: Purple accent
- **Period Buttons**: Gradient colors por riesgo
  - Short Term: Green gradient
  - Medium Term: Yellow/Orange gradient
  - Long Term: Orange/Red gradient
  - Premium: Red/Pink gradient
- **Skills Bonuses**: Blue accents
- **Auto Compound**: Emerald/Cyan gradient
- **Results**: Color-coded por tipo (Green, Blue, Cyan)
- **Final Amount**: Purple/Pink highlight (prominente)

## 🔧 Technical Implementation

### Data Structure
```typescript
interface RewardCalculation {
  dailyReward: bigint
  monthlyReward: bigint
  totalReward: bigint
  finalAmount: bigint
  apy: number
  baseAPY: number
  skillBonus: number
}
```

### Key Props
```typescript
interface StakingRewardsCalculatorProps {
  defaultAmount?: number  // Monto por defecto (default: 1000)
}
```

### Performance Optimizations
- ✅ `memo()` para evitar re-renders innecesarios
- ✅ `useMemo()` para cálculos complejos
- ✅ Estado local simplificado
- ✅ Lazy loading en Staking.tsx

## 🧮 Cálculos Internos

### Daily Reward Calculation
```
dailyReward = (baseAmount * (finalAPY / 365)) / 10000
```

### Monthly Reward Calculation
```
monthlyReward = dailyReward * 30
```

### Total Reward Calculation
```
totalReward = dailyReward * periodDays
```

### Final Amount Calculation
```
finalAmount = baseAmount + totalReward
```

### APY Calculation
```
finalAPY = baseAPY + (sum of selected skill bonuses) + (auto compound bonus if enabled)
```

## 📱 Responsive Behavior

- **Desktop (lg+)**: Mostrado en la columna derecha (1 columna)
- **Tablet/Mobile**: Oculto (implementar en future)
  - Alternativa: Mostrar en modal o como sección expandible

## 🚀 Usage en Staking.tsx

```tsx
<Suspense fallback={<LoadingSpinner />}>
  <StakingRewardsCalculator defaultAmount={100} />
</Suspense>
```

## 🎯 User Experience Benefits

✅ **Transparent**: Usuarios ven exactamente qué van a ganar
✅ **Interactive**: Experimentar con diferentes escenarios
✅ **Educational**: Aprenden sobre APY, skills, períodos
✅ **Confident**: Toman decisiones informadas
✅ **Engaging**: Actividad interactiva = mayor retención

## 🔄 Future Enhancements

- [ ] Integrar datos reales del contrato en lugar de APY hardcodeado
- [ ] Multi-skill scenarios y comparativas
- [ ] Historical APY trends chart
- [ ] Export de resultados a PDF
- [ ] Share calculator link con parámetros preset
- [ ] Mobile version con modal o drawer
- [ ] Real-time notifications de cambios en pool size/APY
- [ ] Compound visualization (gráfico de crecimiento)
- [ ] Fee breakdown (mostrar comisiones de withdrawal)

## 🐛 Known Limitations

- APY es hardcodeado (actualizar con datos de contrato)
- No considera cambios en pool size en tiempo real
- BigInt formatting está limitado a notación K para números grandes
- Skills aplicables son ficticios (ajustar a sistema real)
- CTA button "Start Staking Now" no está funcional (conectar con StakingForm)

## 📝 Integration Checklist

- [x] Componente creado con todas las features
- [x] Integrado en Staking.tsx
- [x] Sin errores de compilación
- [x] Lazy loading implementado
- [x] Responsive (desktop-first)
- [ ] Conectar CTA button con StakingForm
- [ ] Usar datos reales del contrato para APY
- [ ] Testing con diferentes scenarios
- [ ] Mobile version
