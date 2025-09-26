import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n";
import CheckIcon from "./icons/CheckIcon";
import CloseIcon from "./icons/CloseIcon";

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  defaultValue?: string | null; // se for null => vira confirm modal
  onConfirm: (value: string | null) => void;
  onCancel: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  title,
  message,
  defaultValue = "",
  onConfirm,
  onCancel,
}) => {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState(defaultValue ?? "");

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue ?? "");
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (defaultValue === null) {
      // Confirm modal
      onConfirm(null);
    } else {
      // Prompt modal
      onConfirm(inputValue);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[#1e1e2b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-slate-200">{title}</h3>
          {message && <p className="text-sm text-slate-400 mt-2">{message}</p>}
        </div>

        {/* Input só aparece se NÃO for confirm modal */}
        {defaultValue !== null && (
          <div className="p-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 bg-[#15141f] border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]"
              autoFocus
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-slate-600/50 text-slate-200 font-bold uppercase rounded-lg shadow-md hover:bg-slate-500/50 flex items-center justify-center gap-2 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
            <span>{t("cancel")}</span>
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-[#00e051] text-black font-bold uppercase rounded-lg shadow-md hover:bg-opacity-90 flex items-center justify-center gap-2 transition-colors"
            disabled={defaultValue !== null && !inputValue.trim()} // só bloqueia se for prompt vazio
          >
            <CheckIcon className="w-5 h-5" />
            <span>{t("confirm")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;