import { CircuitAnimation } from './CircuitAnimation'
import type { CircuitState } from './circuitScene'

export function LoginCircuit({ phase }: { phase: CircuitState['phase'] }) {
  return <CircuitAnimation variant="login" phase={phase} />
}
