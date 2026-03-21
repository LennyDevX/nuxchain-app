import MaintenancePage from './MaintenancePage'

export default function LaunchpadMaintenance() {
  return (
    <MaintenancePage
      title="Launchpad"
      message="The NUX Token Presale has concluded. The P2P Market is now open for peer-to-peer NUX trading!"
      estimatedTime={0}
      startTime={new Date().toISOString()}
    />
  )
}
