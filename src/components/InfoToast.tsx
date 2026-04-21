interface Props {
  message: string;
  onDismiss: () => void;
}

export default function InfoToast({ message, onDismiss }: Props) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-800 dark:bg-slate-700 text-white px-4 py-3 rounded-xl shadow-lg text-sm whitespace-nowrap">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-slate-400 hover:text-white transition-colors ml-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
