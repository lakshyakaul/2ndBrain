'use client';

import React, { createContext, useContext, useState } from 'react';
import * as Y from 'yjs';

interface ActiveEditorContextType {
  yDoc: Y.Doc | null;
  yProvider: any | null;
  editor: any | null;
  isAIAgentActive: boolean;
  setYDoc: (doc: Y.Doc | null) => void;
  setYProvider: (provider: any | null) => void;
  setEditor: (editor: any | null) => void;
  setIsAIAgentActive: (active: boolean) => void;
}

const ActiveEditorContext = createContext<ActiveEditorContextType>({
  yDoc: null,
  yProvider: null,
  editor: null,
  isAIAgentActive: false,
  setYDoc: () => {},
  setYProvider: () => {},
  setEditor: () => {},
  setIsAIAgentActive: () => {},
});

export const useActiveEditor = () => {
  const context = useContext(ActiveEditorContext);
  if (!context) {
    throw new Error('useActiveEditor must be used within an ActiveEditorProvider');
  }
  return context;
};

export const ActiveEditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [yProvider, setYProvider] = useState<any | null>(null);
  const [editor, setEditor] = useState<any | null>(null);
  const [isAIAgentActive, setIsAIAgentActive] = useState(false);

  return (
    <ActiveEditorContext.Provider
      value={{ yDoc, yProvider, editor, isAIAgentActive, setYDoc, setYProvider, setEditor, setIsAIAgentActive }}
    >
      {children}
    </ActiveEditorContext.Provider>
  );
};
