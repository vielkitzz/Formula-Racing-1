
import React, { useRef, useState } from 'react';
import { AppSkin } from '../types';
import { useI18n } from '../i18n';
import { saveUserSkins } from '../storage';
import FloppyDiskIcon from './icons/FloppyDiskIcon';
import TrashIcon from './icons/TrashIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import PromptModal from './PromptModal';

const FONT_OPTIONS = [
    "'Exo 2', sans-serif",
    "'Roboto', sans-serif",
    "'Orbitron', sans-serif",
    "Arial, sans-serif",
    "'Courier New', monospace",
];

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-xs text-slate-400 mb-1 block">{label}</label>
        <div className="flex items-center gap-2 bg-[#15141f] p-2 rounded-md border border-slate-700 focus-within:ring-2 focus-within:ring-[#00e051] focus-within:border-[#00e051]">
            <input type="color" value={value} onChange={onChange} className="w-6 h-6 p-0 border-none bg-transparent" />
            <input type="text" value={value} onChange={onChange} className="w-full bg-transparent outline-none font-mono" />
        </div>
    </div>
);

interface SkinEditorProps {
    skin: AppSkin;
    onSkinChange: React.Dispatch<React.SetStateAction<AppSkin>>;
    userSkins: AppSkin[];
    setUserSkins: React.Dispatch<React.SetStateAction<AppSkin[]>>;
    availableSkins: AppSkin[];
}

const SkinEditor: React.FC<SkinEditorProps> = ({ skin, onSkinChange, userSkins, setUserSkins, availableSkins }) => {
    const { t } = useI18n();
    const importInputRef = useRef<HTMLInputElement>(null);
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    const handleColorChange = (colorName: keyof AppSkin['colors'], value: string) => {
        onSkinChange(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                [colorName]: value,
            }
        }));
    };

    const handleSkinPropChange = (field: keyof AppSkin, value: any) => {
        onSkinChange(prev => ({...prev, [field]: value}));
    };

     const handleSelectSkin = (skinId: string) => {
        const selected = availableSkins.find(s => s.id === skinId);
        if (selected) {
            onSkinChange(selected);
        }
    };
    
    const handleConfirmSaveSkin = (name: string | null) => {
        if (name) {
            const isExistingUserSkin = skin.isEditable && userSkins.some(s => s.id === skin.id);
            let newSkin = { ...skin, name };
            let newSkinsList;

            if (isExistingUserSkin) {
                newSkinsList = userSkins.map(s => s.id === skin.id ? newSkin : s);
            } else {
                newSkin.id = crypto.randomUUID();
                newSkin.isEditable = true;
                newSkinsList = [...userSkins, newSkin];
            }
            
            setUserSkins(newSkinsList);
            saveUserSkins(newSkinsList);
            onSkinChange(newSkin);
            alert(t('skin_save_success'));
        }
    };

    const handleSaveSkin = () => {
        setIsPromptOpen(true);
    };

    const handleDeleteSkin = () => {
        if (skin.isEditable && window.confirm(t('skin_confirm_delete', { name: skin.name }))) {
            const newSkinsList = userSkins.filter(s => s.id !== skin.id);
            setUserSkins(newSkinsList);
            saveUserSkins(newSkinsList);
            onSkinChange(availableSkins[0]);
        }
    };

    const handleExportSkin = () => {
        try {
            const skinToExport = { ...skin, id: '', name: skin.name, isEditable: true };
            const jsonString = JSON.stringify(skinToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${skin.name.replace(/[^a-z0-9]/gi, '_')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert(t('skin_export_error'));
        }
    };
    
    const handleImportSkin = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const importedSkin = JSON.parse(text) as AppSkin;
                
                if (!importedSkin.colors || !importedSkin.fontFamily || !importedSkin.name) {
                    throw new Error("Invalid skin file");
                }

                importedSkin.id = crypto.randomUUID();
                importedSkin.isEditable = true;
                
                const newSkinsList = [...userSkins, importedSkin];
                setUserSkins(newSkinsList);
                saveUserSkins(newSkinsList);
                onSkinChange(importedSkin);
                alert(t('skin_import_success', { name: importedSkin.name }));

            } catch (err) {
                 alert(t('skin_import_error'));
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };


    return (
        <div className="space-y-6">
            <PromptModal
                isOpen={isPromptOpen}
                title={t('skin_prompt_name')}
                defaultValue={skin.name}
                onConfirm={(newName) => {
                    handleConfirmSaveSkin(newName);
                    setIsPromptOpen(false);
                }}
                onCancel={() => setIsPromptOpen(false)}
            />
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">{t('skin_select_preset')}</label>
                <select value={skin.id} onChange={(e) => handleSelectSkin(e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]">
                    {availableSkins.map(s => (
                        <option key={s.id} value={s.id} className="bg-[#1e1e2b]">{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 <button onClick={handleSaveSkin} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm flex items-center justify-center gap-2 transition-colors">
                    <FloppyDiskIcon className="w-4 h-4" />
                    <span>{t('skin_save_current')}</span>
                </button>
                 <button onClick={() => importInputRef.current?.click()} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm flex items-center justify-center gap-2 transition-colors">
                    <CloudArrowUpIcon className="w-4 h-4" />
                    <span>{t('skin_import')}</span>
                </button>
                 <button onClick={handleExportSkin} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm flex items-center justify-center gap-2 transition-colors">
                    <CloudArrowUpIcon className="w-4 h-4 -scale-y-100" />
                    <span>{t('skin_export')}</span>
                </button>
                <button onClick={handleDeleteSkin} disabled={!skin.isEditable} className="p-2 bg-red-800/50 hover:bg-red-800/80 rounded-md text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <TrashIcon className="w-4 h-4" />
                    <span>{t('skin_delete_current')}</span>
                </button>
                <input type="file" ref={importInputRef} onChange={handleImportSkin} accept=".json" style={{display: 'none'}} />
            </div>

            <div>
                <h4 className="font-bold text-lg text-slate-300 mb-2">{t('skin_uiColors')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <ColorInput label={t('skin_bgMain')} value={skin.colors.bgMain} onChange={(e) => handleColorChange('bgMain', e.target.value)} />
                    <ColorInput label={t('skin_bgPanel')} value={skin.colors.bgPanel} onChange={(e) => handleColorChange('bgPanel', e.target.value)} />
                    <ColorInput label={t('skin_textPrimary')} value={skin.colors.textPrimary} onChange={(e) => handleColorChange('textPrimary', e.target.value)} />
                    <ColorInput label={t('skin_textSecondary')} value={skin.colors.textSecondary} onChange={(e) => handleColorChange('textSecondary', e.target.value)} />
                    <ColorInput label={t('skin_accentRed')} value={skin.colors.accentRed} onChange={(e) => handleColorChange('accentRed', e.target.value)} />
                    <ColorInput label={t('skin_accentGreen')} value={skin.colors.accentGreen} onChange={(e) => handleColorChange('accentGreen', e.target.value)} />
                    <ColorInput label={t('skin_borderColor')} value={skin.colors.borderColor} onChange={(e) => handleColorChange('borderColor', e.target.value)} />
                </div>
            </div>
            <div>
                <h4 className="font-bold text-lg text-slate-300 mb-2">{t('skin_font')}</h4>
                <select value={skin.fontFamily} onChange={(e) => handleSkinPropChange('fontFamily', e.target.value)} className="w-full bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051]">
                    {FONT_OPTIONS.map(font => (
                        <option key={font} value={font} className="bg-[#1e1e2b]" style={{ fontFamily: font }}>{font.split(',')[0].replace(/'/g, '')}</option>
                    ))}
                </select>
            </div>
            <div>
                <h4 className="font-bold text-lg text-slate-300 mb-2">{t('skin_logo')}</h4>
                <textarea
                    value={skin.logoSvg}
                    onChange={(e) => handleSkinPropChange('logoSvg', e.target.value)}
                    className="w-full h-32 bg-[#15141f] p-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00e051] focus:border-[#00e051] font-mono text-xs"
                    placeholder="data:image/svg+xml;base64,..."
                />
            </div>
        </div>
    );
};

export default SkinEditor;