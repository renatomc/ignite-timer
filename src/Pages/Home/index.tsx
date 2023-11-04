import { createContext, useState } from 'react'
import { HandPalm, Play } from 'phosphor-react'
import { FormProvider, useForm } from 'react-hook-form'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { NewCycleForm } from './NewCycleForm'
import { CountDown } from './CountDown'

import {
  HomeContainer,
  StartCountDownButton,
  StopCountDownButton,
} from './styles'

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CyclesContextType {
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCycleAsFinished: () => void
  clearActiveCycleId: () => void
  changeAmountSecondsPassed: (seconds: number) => void
}

export const CyclesContext = createContext({} as CyclesContextType)

const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(1, 'O ciclo precisa ser de no mínimo 1 minutos')
    .max(60, 'O ciclo precisa ser de no máximo 60 minutos'),
})

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const newCycleForm = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { handleSubmit, watch, reset } = newCycleForm

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function markCycleAsFinished() {
    setCycles((prevState) =>
      prevState.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return {
            ...cycle,
            finishedDate: new Date(),
          }
        }
        return cycle
      }),
    )
    clearActiveCycleId()
  }

  console.log({ cycles })

  function handleCreateNewTask(data: NewCycleFormData) {
    const id = String(new Date().getTime())
    const newCycke: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    setCycles((prevState) => [...prevState, newCycke])
    setActiveCycleId(id)
    changeAmountSecondsPassed(0)
    reset()
  }

  function clearActiveCycleId() {
    setActiveCycleId(null)
  }

  function changeAmountSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  function handleInterruptCycle() {
    const cyclesWithInterrupted = cycles.map((cycle) => {
      if (cycle.id === activeCycleId) {
        return {
          ...cycle,
          interruptedDate: new Date(),
        }
      }
      return cycle
    })

    setCycles(cyclesWithInterrupted)
    clearActiveCycleId()
  }

  const task = watch('task')
  const isSubmitDisabled = !task

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewTask)}>
        <CyclesContext.Provider
          value={{
            activeCycle,
            activeCycleId,
            markCycleAsFinished,
            clearActiveCycleId,
            amountSecondsPassed,
            changeAmountSecondsPassed,
          }}
        >
          <FormProvider {...newCycleForm}>
            <NewCycleForm />
          </FormProvider>
          <CountDown />
        </CyclesContext.Provider>
        <>
          {activeCycle ? (
            <StopCountDownButton type="button" onClick={handleInterruptCycle}>
              <HandPalm size={24} />
              Interromper
            </StopCountDownButton>
          ) : (
            <StartCountDownButton type="submit" disabled={isSubmitDisabled}>
              <Play size={24} />
              Começar
            </StartCountDownButton>
          )}
        </>
      </form>
    </HomeContainer>
  )
}
