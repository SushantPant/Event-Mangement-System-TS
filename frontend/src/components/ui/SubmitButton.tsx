import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    className?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, loadingText, children, className = '', ...props }) => {
    return (
        <button
            type="submit"
            disabled={isLoading || props.disabled}
            className={`py-2.5 rounded-lg text-sm font-bold text-white transition flex items-center justify-center gap-2 ${isLoading || props.disabled
                    ? "bg-yellow-400 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700"
                } ${className}`}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {loadingText || children}
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default SubmitButton;
