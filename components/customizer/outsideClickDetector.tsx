import React, { useEffect } from 'react';

function useOutsideClickDetector(
    disabled: boolean,
    onBlur: () => void,
    ref: React.RefObject<HTMLDivElement>
) {
    useEffect(() => {
        function onClick(event: MouseEvent) {
            const element = ref.current as HTMLDivElement;
            if (element) {
                const validRect = element.getBoundingClientRect();
                if (
                    !(
                        event.clientX >= validRect.left &&
                        event.clientX <= validRect.right &&
                        event.clientY >= validRect.top &&
                        event.clientY <= validRect.bottom
                    )
                ) {
                    onBlur();
                }
            }
        }

        if (!disabled) {
            document.addEventListener('mousedown', onClick);
            setTimeout(() => {
                ref.current?.click();
            }, 0);
            return () => {
                // Clean up handler before next side effect
                document.removeEventListener('mousedown', onClick);
            };
        }
    }, [ref, disabled, onBlur]);
}

type Props = {
    onOutsideClick: () => void;
    className: string;
    disabled: boolean;
    innerRef: React.RefObject<HTMLDivElement>;
};
const OutsideClickDetector: React.FC<Props> = (props) => {
    useOutsideClickDetector(
        props.disabled,
        props.onOutsideClick,
        props.innerRef
    );
    return (
        <div ref={props.innerRef} className={props.className}>
            {props.children}
        </div>
    );
};

export default OutsideClickDetector;
