import MaintenancePage from './MaintenancePage';
import { MAINTENANCE_CONFIG } from '../config/maintenance';

export default function GiveawayMaintenance() {
  const cfg = MAINTENANCE_CONFIG.giveaway;
  return (
    <MaintenancePage
      title="Giveaway"
      message={cfg?.message ?? 'El sorteo estará disponible muy pronto. ¡Prepárate para ganar!'}
      estimatedTime={cfg?.estimatedTime ?? 1440}
      startTime={cfg?.startTime ?? new Date().toISOString()}
    />
  );
}
