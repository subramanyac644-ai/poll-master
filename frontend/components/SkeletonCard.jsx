import React from 'react';
import './Skeleton.css';

const SkeletonCard = () => {
    return (
        <div className="skeleton-card card">
            <div className="skeleton-header">
                <div className="skeleton-badge"></div>
                <div className="skeleton-votes"></div>
            </div>
            <div className="skeleton-title"></div>
            <div className="skeleton-title short"></div>
            <div className="skeleton-options">
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
            </div>
            <div className="skeleton-footer">
                <div className="skeleton-date"></div>
                <div className="skeleton-button"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
