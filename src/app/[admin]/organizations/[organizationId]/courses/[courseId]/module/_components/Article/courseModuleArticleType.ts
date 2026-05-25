export interface AddArticleProps {
    content: ContentArticle; 
    courseId:any;  
    articleUpdateOnPreview: boolean;  
    setArticleUpdateOnPreview: React.Dispatch<React.SetStateAction<boolean>>;  
    canEdit?: boolean;
}

export interface ContentDetailAddArticle{
    title: string
    description: string | null
    links: string | null
    file: string | null
    content: string | null
}


export interface ContentArticle{
    doc: any;
    id: string
    moduleId: string
    topicId: number
    order: number
    contentDetails: ContentDetailAddArticle[]
}


export type EditorDocArcticle = {
    type: string
    content: any[]
}



// UploadPdf
export type UploadProps = {
    className?: string;  
    file:File ;
    setFile:any; 
    isPdfUploaded: boolean; 
    pdfLink: string;  
    loading: boolean;
    setIsPdfUploaded: React.Dispatch<React.SetStateAction<boolean>>;  
    onDeletePdfhandler: () => void;  
    setDisableButton: React.Dispatch<React.SetStateAction<boolean>>; 
    disabled?: boolean;
};

