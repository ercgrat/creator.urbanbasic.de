import { useCallback, useState } from 'react';

export default function useToastState(): [
    isToastOpen: boolean,
    openToast: () => void,
    closeToast: () => void
] {
    const [isToastOpen, setIsToastOpen] = useState<boolean>(false);

    const openToast = useCallback(() => {
        setIsToastOpen(true);
    }, [setIsToastOpen]);

    const closeToast = useCallback(() => {
        setIsToastOpen(false);
    }, [setIsToastOpen]);

    return [isToastOpen, openToast, closeToast];
}
