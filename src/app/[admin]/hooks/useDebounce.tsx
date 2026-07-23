import { useEffect, useState } from "react";

function useDebounce(value: any, delayTime: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayTime);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayTime]);
  return debouncedValue;
}

export default useDebounce;
