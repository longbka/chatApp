import { useEffect, useState } from "react";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    setTimeout(() => {
      const handler = setDebouncedValue(value);
      return () => {
        clearTimeout(handler);
      };
    }, delay);
  }, [value]);
  return debouncedValue;
};

export default useDebounce;
