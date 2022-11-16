import React, { ReactNode, useState } from 'react';
import { cls } from '@arco-design/mobile-utils';
import { IndexBarIndexType, IndexBarSideBarProps, IndexBarTipType } from './type';

export function IndexBarSideBar(props: IndexBarSideBarProps) {
    const {
        indexes,
        prefixCls,
        onClick,
        activeIndex,
        tipType,
        renderSideBar,
        renderSideBarItem = index => index,
        renderTip: propsRenderTip,
    } = props;
    const [isTouching, originSetIsTouching] = useState(false);

    const setIsTouching = (touching: boolean) => {
        originSetIsTouching(touching);
    };

    const handleTouchingStart = () => setIsTouching(true);

    const handleTouchingStop = () => setIsTouching(false);

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isTouching || !e.touches?.length) {
            return;
        }
        // e.stopPropagation();
        const { clientX, clientY } = e.touches[0];
        const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
        if (target && target.dataset?.index) {
            onClick(target.dataset.index);
        }
    };

    const renderSideBarTip = (index: IndexBarIndexType, type: IndexBarTipType): ReactNode => {
        if (propsRenderTip) {
            return propsRenderTip(index);
        }
        return <div className={`${prefixCls}-indexbar-sidebar-${type}`}>{index}</div>;
    };

    const node = (
        <div
            className={cls(`${prefixCls}-indexbar-sidebar`, {
                [`${prefixCls}-indexbar-sidebar-touching`]: isTouching,
            })}
            onTouchStart={() => handleTouchingStart()}
            onTouchEnd={() => handleTouchingStop()}
            onTouchCancel={() => handleTouchingStop()}
            onTouchMove={handleTouchMove}
        >
            {tipType === 'toast' &&
                isTouching &&
                activeIndex &&
                renderSideBarTip(activeIndex, 'toast')}
            {indexes.map(index => (
                <div
                    className={cls(`${prefixCls}-indexbar-sidebar-item`, {
                        [`${prefixCls}-indexbar-sidebar-active`]: activeIndex === index,
                    })}
                    key={index}
                    onTouchStart={() => onClick(index)}
                    data-index={index}
                >
                    {tipType === 'sweat' &&
                        isTouching &&
                        activeIndex === index &&
                        renderSideBarTip(index, 'sweat')}
                    {renderSideBarItem(index)}
                </div>
            ))}
        </div>
    );

    return renderSideBar ? renderSideBar(node) : node;
}
