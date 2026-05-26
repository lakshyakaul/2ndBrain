import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import BannerUploadForm from './banner-upload-form';

interface BannerUploadProps {
  children: React.ReactNode;
  className?: string;
  dirType: 'workspace' | 'page';
  id: string;
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  id,
  dirType,
  children,
  className,
}) => {
  return (
    <Dialog>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Banner Form</DialogTitle>
        </DialogHeader>
        <BannerUploadForm dirType={dirType} id={id} />
      </DialogContent>
    </Dialog>
  );
};

export default BannerUpload;
