import {
  ReactNode,
  createContext,
  useState,
  useReducer,
  useEffect,
} from 'react'
import { Cycle, cyclesReducer } from '../reducers/cycles/reducer'
import {
  addNewCycleAction,
  clearCycleIdAction,
  markCurrentCycleAsFinishedAction,
  markCurrentCycleAsInterruptAction,
} from '../reducers/cycles/actions'

interface CreateCycleData {
  task: string
  minutesAmount: number
}

interface CyclesContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCycleAsFinished: () => void
  clearActiveCycleId: () => void
  interruptCycle: () => void
  changeAmountSecondsPassed: (seconds: number) => void
  createNewCycle: (data: CreateCycleData) => void
}

export const CyclesContext = createContext({} as CyclesContextType)

interface CyclsContextProviderProps {
  children: ReactNode
}

export function CyclesContextProvider({ children }: CyclsContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    (initialState) => {
      const storedStateAsJson = localStorage.getItem(
        '@ignite-timer:cycles-state-1.0.0',
      )

      if (storedStateAsJson) {
        return JSON.parse(storedStateAsJson)
      }

      return initialState
    },
  )

  const { cycles, activeCycleId } = cyclesState
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  useEffect(() => {
    const stateJson = JSON.stringify(cyclesState)
    localStorage.setItem('@ignite-timer:cycles-state-1.0.0', stateJson)
  }, [cyclesState])

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function clearActiveCycleId() {
    dispatch(clearCycleIdAction())
  }

  function markCycleAsFinished() {
    dispatch(markCurrentCycleAsFinishedAction())
  }

  function changeAmountSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime())
    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    dispatch(addNewCycleAction(newCycle))

    changeAmountSecondsPassed(0)
  }

  function interruptCycle() {
    dispatch(markCurrentCycleAsInterruptAction())
  }

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        markCycleAsFinished,
        clearActiveCycleId,
        amountSecondsPassed,
        changeAmountSecondsPassed,
        interruptCycle,
        createNewCycle,
      }}
    >
      {children}
    </CyclesContext.Provider>
  )
}
