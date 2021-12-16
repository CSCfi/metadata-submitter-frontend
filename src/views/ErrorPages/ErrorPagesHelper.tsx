import { useEffect, useState } from "react"

export const GetCountdownTime = (value: number, delay: number): number => {
  const [time, setTime] = useState(value)
  useEffect(() => {
    const handler = setInterval(() => {
      setTime(prevState => prevState - 1)
    }, delay)
    return () => clearInterval(handler)
  }, [delay, time])
  return time
}
