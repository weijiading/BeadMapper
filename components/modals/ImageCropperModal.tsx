'use client'

import React from 'react';
import ImageCropper from '@/components/editor/Modals/ImageCropper'; // 假设你的底层裁剪器在这里

interface ImageCropperModalProps {
    isOpen: boolean;           // 是否显示
    imageSrc: string | null;   // 原始图片数据 (base64)
    onConfirm: (croppedImage: string) => void; // 裁剪完成的回调
    onCancel: () => void;      // 取消的回调
}

export function ImageCropperModal({
    isOpen,
    imageSrc,
    onConfirm,
    onCancel
}: ImageCropperModalProps) {
    
    // 如果没有打开，或者没有图片数据，就不渲染
    if (!isOpen || !imageSrc) return null;

    return (
        // 这里直接渲染 ImageCropper，它内部应该包含了遮罩层(Overlay)
        // 如果你的 ImageCropper 没有遮罩，这里可以包一层 div className="fixed inset-0 z-50..."
        <ImageCropper 
            imageSrc={imageSrc} 
            onCropComplete={onConfirm} 
            onCancel={onCancel} 
        />
    );
}