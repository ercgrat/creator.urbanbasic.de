import React, { useEffect, MutableRefObject } from "react";

function useOutsideClickDetector(disabled, onBlur, ref) {
    useEffect(() => {
        function onClick(event) {
            const element = ref.current as HTMLElement;
            if (element) {
                const validRect = element.getBoundingClientRect();
                if (!(event.clientX >= validRect.left &&
                    event.clientX <= validRect.right &&
                    event.clientY >= validRect.top &&
                    event.clientY <= validRect.bottom)) {

                    onBlur();
                }
            }
        }

        if (!disabled) {
            document.addEventListener("mousedown", onClick);
            setTimeout(() => { ref.current.click(); } , 0);
            return () => {
                // Clean up handler before next side effect
                document.removeEventListener("mousedown", onClick);
            };
        }
    }, [ref, disabled]);
}

export default function OutsideClickDetector(props: { onOutsideClick, children, className, disabled?: boolean, innerRef?: MutableRefObject<any> }) {
    useOutsideClickDetector(props.disabled, props.onOutsideClick, props.innerRef);
    return <div ref={props.innerRef} className={props.className}>{props.children}</div>;
}