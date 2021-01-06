//@flow
import { useEffect, useState } from "react"

export const getCountdownTime = (value: number, delay: number) => {
  const [time, setTime] = useState(value)
  useEffect(() => {
    let handler = setInterval(() => {
      setTime(prevState => prevState - 1)
    }, delay)
    return () => clearInterval(handler)
  }, [time])
  return time
}
