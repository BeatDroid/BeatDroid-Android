export type DialogContextType = { 
    children: React.ReactNode 
};

export type DialogContentProps = {
    content: React.ReactNode;
    icon?: React.ReactNode;
}

export type DialogContextProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    content: DialogContentProps;
    setContent: (content: DialogContentProps) => void;
}