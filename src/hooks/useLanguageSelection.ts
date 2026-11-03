import { useState } from 'react';

export interface EditorLanguage {
  lang: string;
  id: number;
}

export function useLanguageSelection(
  initialLanguageId: number | undefined,
  editorLanguages: EditorLanguage[],
  startWithEmptyLanguage: boolean = false
) {
  const [languageId, setLanguageId] = useState<number>(initialLanguageId ?? 0);
  
  const [language, setLanguage] = useState<string>(() => {
    if (startWithEmptyLanguage) {
      return '';
    }
    if (initialLanguageId) {
      return editorLanguages.find((lang) => lang.id === initialLanguageId)?.lang || '';
    }
    return '';
  });

  const getDataFromField = (
    array: any[],
    searchValue: any,
    searchField: string | number,
    targetField: string | number
  ): any => {
    let result = languageId;
    array.forEach((obj) => {
      if (obj[searchField] === searchValue) {
        result = obj[targetField];
      }
    });
    return result;
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const langID = getDataFromField(editorLanguages, lang, 'lang', 'id');
    setLanguageId(langID);
  };

  return {
    language,
    setLanguage,
    languageId,
    setLanguageId,
    handleLanguageChange,
    getDataFromField,
  };
}
