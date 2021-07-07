import React from 'react';

import './PreviewSizer.css'

export const PreviewSizes = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    XLARGE: 'xlarge'
}

export function PreviewSizer({previewSize, onSetPreviewSize}) {
    const onSelectSize = size => {
        console.log(`select: ${size}`)
        onSetPreviewSize(size)
    }

    return (
        <div class='preview-sizer'>
            <PreviewSizeItem 
                whichSize={PreviewSizes.SMALL} 
                selectedSize={previewSize} 
                onSelect={onSelectSize}
            />
            <PreviewSizeItem 
                whichSize={PreviewSizes.MEDIUM} 
                selectedSize={previewSize} 
                onSelect={onSelectSize}
            />
            <PreviewSizeItem 
                whichSize={PreviewSizes.LARGE} 
                selectedSize={previewSize} 
                onSelect={onSelectSize}
            />
            <PreviewSizeItem 
                whichSize={PreviewSizes.XLARGE} 
                selectedSize={previewSize} 
                onSelect={onSelectSize}
            />
        </div>
    )
}

function PreviewSizeItem({whichSize, selectedSize, onSelect}) {
    return (
        <div 
            class={buildClasses(selectedSize, whichSize)}
            onClick={() => onSelect(whichSize)}
        >
            {buildIcon(whichSize)}
        </div>
    )
}

function buildClasses(selection, which) {
    return `sizer-item ${selection == which ? 'selected' : ''}`;
}

function buildIcon(which) {
    switch (which) {
        default:
        case PreviewSizes.SMALL:    return <i class="fas fa-th fa-xs"></i>;
        case PreviewSizes.MEDIUM:   return <i class="fas fa-th fa-sm"></i>;
        case PreviewSizes.LARGE:    return <i class="fas fa-th"></i>;
        case PreviewSizes.XLARGE:   return <i class="fas fa-th-large"></i>;
    }
}