import React from 'react';

interface CancelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({ children, className = '', ...props }) => {
    return (
        <button
            type="button"
            className={`py-2.5 rounded-lg text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition ${className}`}
            {...props}
        >
            {children || "Cancel"}
        </button>
    );
};

export default CancelButton;
